module.exports = async ({ github, context, core }) => {
  const repo = context.repo;
  let prs = [];

  // Determine if triggered by a pull request event or a cron schedule
  if (['pull_request', 'pull_request_target'].includes(context.eventName)) {
    prs = [context.payload.pull_request];
  } else if (context.eventName === 'schedule' || context.eventName === 'workflow_dispatch') {
    // Fetch all open PRs for cron processing
    const { data } = await github.rest.pulls.list({
      owner: repo.owner,
      repo: repo.repo,
      state: 'open',
    });
    prs = data;
  }

  for (const pr of prs) {
    if (pr.state !== 'open') continue;

    // Skip if the PR is in a draft state
    if (pr.draft) continue;

    const prNumber = pr.number;
    
    // Retrieve existing metadata and comment ID from dedicated bot comments
    let { commentId, metadata } = await getBotComment(github, repo, prNumber);

    const now = new Date();
    let updated = false;

    // --- EVENT: PR Opened or Ready for Review ---
    if (['pull_request', 'pull_request_target'].includes(context.eventName) && ['opened', 'ready_for_review'].includes(context.payload.action)) {
      if (context.payload.action === 'ready_for_review' || !metadata.staleTimerEnd) {
        // Every new PR or newly ready PR gets a `WD-needs-class` tag and a 28-day Stale PR timer
        await github.rest.issues.addLabels({
          owner: repo.owner,
          repo: repo.repo,
          issue_number: prNumber,
          labels: ['WD-needs-class'],
        });

        const staleEnd = new Date(now.getTime() + 28 * 24 * 60 * 60 * 1000);
        metadata.staleTimerEnd = staleEnd.toISOString();
        metadata.warnedStale = false;

        const actionText = context.payload.action === 'ready_for_review'
          ? 'PR marked as ready for review. The 28-day Stale PR timer has been reset and'
          : 'A 28-day Stale PR timer has begun and';

        await github.rest.issues.createComment({
          owner: repo.owner,
          repo: repo.repo,
          issue_number: prNumber,
          body: `${actionText} is set to end on ${staleEnd.toUTCString()}.

(This bot is here to assist in managing the [Social Web Working Group publishing rules](https://github.com/w3c/socialwg/blob/main/governance/publication-workflow.md) for comment periods and objections.)`,
        });
        updated = true;
      }
    }

    // --- EVENT: PR Labelled ---
    if (['pull_request', 'pull_request_target'].includes(context.eventName) && context.payload.action === 'labeled') {
      const labelName = context.payload.label.name;
      const sender = context.payload.sender ? context.payload.sender.login : 'Someone';

      if (['WD-class-1', 'WD-class-2'].includes(labelName)) {
        // 7-day Comment Period timer + WD-comment-open label
        const commentEnd = new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000);
        metadata.commentPeriodEnd = commentEnd.toISOString();

        await github.rest.issues.addLabels({
          owner: repo.owner,
          repo: repo.repo,
          issue_number: prNumber,
          labels: ['WD-comment-open'],
        });

        // Remove WD-needs-class label when WD-comment-open is added
        await removeNeedsClass(github, repo, prNumber);
        
        await github.rest.issues.createComment({
          owner: repo.owner,
          repo: repo.repo,
          issue_number: prNumber,
          body: `A 7-day comment window has begun and is set to end on ${commentEnd.toUTCString()}.`,
        });
        updated = true;
      } else if (['WD-class-3', 'WD-class-4'].includes(labelName)) {
        // 14-day Comment Period timer + WD-comment-open label
        const commentEnd = new Date(now.getTime() + 14 * 24 * 60 * 60 * 1000);
        metadata.commentPeriodEnd = commentEnd.toISOString();

        await github.rest.issues.addLabels({
          owner: repo.owner,
          repo: repo.repo,
          issue_number: prNumber,
          labels: ['WD-comment-open'],
        });

        // Remove WD-needs-class label when WD-comment-open is added
        await removeNeedsClass(github, repo, prNumber);

        await github.rest.issues.createComment({
          owner: repo.owner,
          repo: repo.repo,
          issue_number: prNumber,
          body: `A 14-day comment window has begun and is set to end on ${commentEnd.toUTCString()}.`,
        });
        updated = true;
      } else if (labelName === 'WD-objections-open') {
        // Stop comment period timer, add WD-comment-paused label
        metadata.commentPeriodEnd = null;

        await github.rest.issues.addLabels({
          owner: repo.owner,
          repo: repo.repo,
          issue_number: prNumber,
          labels: ['WD-comment-paused'],
        });

        await github.rest.issues.removeLabel({
          owner: repo.owner,
          repo: repo.repo,
          issue_number: prNumber,
          name: 'WD-comment-open',
        });

        await github.rest.issues.createComment({
          owner: repo.owner,
          repo: repo.repo,
          issue_number: prNumber,
          body: `@${sender} has noted an objection, so the Comment Period timer has stopped.`,
        });
        updated = true;
      } else if (labelName === 'WD-objections-resolved') {
        // 7-day Post Resolution timer, update labels
        const postResEnd = new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000);
        metadata.postResolutionTimerEnd = postResEnd.toISOString();

        try {
          await github.rest.issues.removeLabel({
            owner: repo.owner,
            repo: repo.repo,
            issue_number: prNumber,
            name: 'WD-comment-paused',
          });
        } catch (e) { /* ignore if label wasn't present */ }

        try {
          await github.rest.issues.removeLabel({
            owner: repo.owner,
            repo: repo.repo,
            issue_number: prNumber,
            name: 'WD-objections-open',
          });
        } catch (e) { /* ignore if label wasn't present */ }

        await github.rest.issues.addLabels({
          owner: repo.owner,
          repo: repo.repo,
          issue_number: prNumber,
          labels: ['WD-comment-open'],
        });

        // Remove WD-needs-class label when WD-comment-open is re-added
        await removeNeedsClass(github, repo, prNumber);

        await github.rest.issues.createComment({
          owner: repo.owner,
          repo: repo.repo,
          issue_number: prNumber,
          body: `@${sender} has noted that all open objections have been resolved and a 7-day Post Resolution timer for further comment has started, set to end on ${postResEnd.toUTCString()}.`,
        });
        updated = true;
      }
    }

    // --- CRON / TIMER CHECKS ---
    if (metadata.commentPeriodEnd && new Date(metadata.commentPeriodEnd) <= now) {
      // Comment Period timer is done, remove WD-comment-open label
      await github.rest.issues.createComment({
        owner: repo.owner,
        repo: repo.repo,
        issue_number: prNumber,
        body: 'The comment period is now over. WG Chair is expected to evaluate whether this should be merged or closed based on the [Social Web Working Group publishing rules](https://github.com/w3c/socialwg/blob/main/governance/publication-workflow.md).',
      });

      try {
        await github.rest.issues.removeLabel({
          owner: repo.owner,
          repo: repo.repo,
          issue_number: prNumber,
          name: 'WD-comment-open',
        });
      } catch (e) { /* ignore */ }

      try {
        await github.rest.issues.addLabels({
          owner: repo.owner,
          repo: repo.repo,
          issue_number: prNumber,
          labels: ['WD-comment-closed'],
        });
      } catch (e) { /* ignore */ }

      metadata.commentPeriodEnd = null;
      updated = true;
    }

    // Post Resolution Timer Expiration
    if (metadata.postResolutionTimerEnd && new Date(metadata.postResolutionTimerEnd) <= now) {
      await github.rest.issues.createComment({
        owner: repo.owner,
        repo: repo.repo,
        issue_number: prNumber,
        body: 'The post-resolution comment period is now over. WG Chair is expected to evaluate whether this should be merged or closed based on the [Social Web Working Group publishing rules](https://github.com/w3c/socialwg/blob/main/governance/publication-workflow.md).',
      });

      try {
        await github.rest.issues.removeLabel({
          owner: repo.owner,
          repo: repo.repo,
          issue_number: prNumber,
          name: 'WD-comment-open',
        });
      } catch (e) { /* ignore */ }

      try {
        await github.rest.issues.addLabels({
          owner: repo.owner,
          repo: repo.repo,
          issue_number: prNumber,
          labels: ['WD-comment-closed'],
        });
      } catch (e) { /* ignore */ }

      metadata.postResolutionTimerEnd = null;
      updated = true;
    }

    if (metadata.staleTimerEnd) {
      let staleEnd = new Date(metadata.staleTimerEnd);
      
      // Extension Adjustment Logic (Minute-based)
      if (metadata.postResolutionTimerEnd) {
        const postResEnd = new Date(metadata.postResolutionTimerEnd);
        if (postResEnd > staleEnd) {
          staleEnd = postResEnd;
          metadata.staleTimerEnd = staleEnd.toISOString();
          updated = true;
        }
      }

      // Check for 3-day warning reminder and label
      const threeDaysBeforeStale = new Date(staleEnd.getTime() - 3 * 24 * 60 * 60 * 1000);
      if (!metadata.warnedStale && now >= threeDaysBeforeStale && now < staleEnd) {
        await github.rest.issues.addLabels({
          owner: repo.owner,
          repo: repo.repo,
          issue_number: prNumber,
          labels: ['WD-closure-warning'],
        });

        await github.rest.issues.createComment({
          owner: repo.owner,
          repo: repo.repo,
          issue_number: prNumber,
          body: `Reminder: This issue will close in three days if not merged (impending closure scheduled for ${staleEnd.toUTCString()}).`,
        });
        metadata.warnedStale = true;
        updated = true;
      }

      // When Stale PR timer is done (or passed), close the PR
      if (now >= staleEnd) {
        await github.rest.issues.createComment({
          owner: repo.owner,
          repo: repo.repo,
          issue_number: prNumber,
          body: 'Automatically closing because no resolution was reached by the end of the review window.',
        });
        await github.rest.pulls.update({
          owner: repo.owner,
          repo: repo.repo,
          pull_number: prNumber,
          state: 'closed',
        });
        continue;
      }
    }

    // Upsert/Update the dedicated bot state comment if tracking has started or changes occurred
    if (metadata.staleTimerEnd || metadata.commentPeriodEnd || metadata.postResolutionTimerEnd || updated) {
      commentId = await upsertBotComment(github, repo, prNumber, commentId, metadata);
    }
  }
};

// Helper: Safely remove the WD-needs-class label
async function removeNeedsClass(github, repo, prNumber) {
  try {
    await github.rest.issues.removeLabel({
      owner: repo.owner,
      repo: repo.repo,
      issue_number: prNumber,
      name: 'WD-needs-class',
    });
  } catch (e) {
    // Ignore if the label wasn't attached
  }
}

// Helper: Scan comments to find the one containing our hidden tracking signature
async function getBotComment(github, repo, prNumber) {
  const { data: comments } = await github.rest.issues.listComments({
    owner: repo.owner,
    repo: repo.repo,
    issue_number: prNumber,
  });

  for (const comment of comments) {
    const match = comment.body.match(/<!-- pr-lifecycle: (.*?) -->/);
    if (match && match[1]) {
      try {
        return {
          commentId: comment.id,
          metadata: JSON.parse(match[1]),
        };
      } catch (e) {
        // Ignore malformed JSON
      }
    }
  }

  return {
    commentId: null,
    metadata: { staleTimerEnd: null, commentPeriodEnd: null, postResolutionTimerEnd: null, warnedStale: false },
  };
}

// Helper: Create the bot state comment if it doesn't exist, or update it if it does
async function upsertBotComment(github, repo, prNumber, commentId, metadata) {
  const commentBody = `🤖 This comment stores our helper bot's *PR Lifecycle Automation State*, do not delete or edit! \n<!-- pr-lifecycle: ${JSON.stringify(metadata)} -->`;

  if (commentId) {
    await github.rest.issues.updateComment({
      owner: repo.owner,
      repo: repo.repo,
      comment_id: commentId,
      body: commentBody,
    });
    return commentId;
  } else {
    const { data: newComment } = await github.rest.issues.createComment({
      owner: repo.owner,
      repo: repo.repo,
      issue_number: prNumber,
      body: commentBody,
    });
    return newComment.id;
  }
}
