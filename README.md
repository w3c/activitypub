# ActivityPub

[ActivityPub](https://www.w3.org/TR/activitypub/) is the decentralized social networking protocol.

It provides a client to server API for creating, updating and deleting content, mechanisms for building a social graph, as well as a federated server to server API for delivering notifications and subscribing to content.

It is based on the [ActivityStreams 2.0](https://www.w3.org/TR/activitystreams-core/) (AS2) data format, which is a JSON-LD format for describing social activities. Because AS2 is extensible with new types of activities, objects, and properties, ActivityPub is also extensible. You can build many different kinds of social applications on top of ActivityPub.

ActivityPub is maintained by the [Social Web Working Group](https://www.w3.org/groups/wg/social) of the [World Wide Web Consortium](https://www.w3.org/).

See also the [ActivityPub publication history](https://www.w3.org/standards/history/activitypub/).

## Key info

- The [ActivityPub specification](https://www.w3.org/TR/activitypub/) is the official document that describes the protocol.
- The [errata](https://www.w3.org/wiki/ActivityPub_errata) pages shows known errors in the specification.
- The [Editor's Draft](https://w3c.github.io/activitypub/) incorporates the corrected errata directly into the specification text.
- The [Social  Web WG](https://www.w3.org/groups/wg/social/) is the working group that maintains the specification. It meets regularly to discuss the specification and its implementations.
- The [ActivityPub Primer](https://www.w3.org/wiki/ActivityPub/Primer) gives deeper explanations of topics described in the specification.

## Additional documents

The [Social Web Incubator Community Group](https://www.w3.org/groups/cg/socialcg/) also maintains:

- The [ActivityPub WebFinger profile](https://swicg.github.io/activitypub-webfinger/) describes how to use WebFinger with ActivityPub.
- The [ActivityPub HTTP Signature profile](https://swicg.github.io/activitypub-http-signature/) describes how to use HTTP Signature with ActivityPub.
- The [ActivityPub Data Portability task force](https://swicg.github.io/activitypub-data-portability/) describes how to use ActivityPub for data portability.

## Editors

The currently active editors of the AP specification(s) are:

- [Evan Prodromou](https://github.com/evanp)

## Contributions

The main way to make contributions, ask questions, or report errors is to make a [GitHub issue](https://github.com/w3c/activitypub/issues). Because the specification is a published W3C Recommendation, it is *not* helpful to make pull requests to the repository.

The AS2 vocabulary provides the basic data model for ActivityPub. Questions or issues about the AS2 vocabulary should be directed to the [AS2 repository](https://github.com/w3c/activitystreams). If you're not sure whether an issue should go there or here, feel free to add it here and it will be discussed and moved if necessary.

## Processes

Because the document is a published W3C Recommendation, the process for making changes to the specification is more formal than for other documents.

### Clarifying practices

Explanations, tips and clarifications usually go in the [ActivityPub Primer](https://www.w3.org/wiki/ActivityPub/Primer). If you have a question about how something works in ActivityPub, open an issue and we can discuss adding it to the primer.

### Correcting errors

To handle editorial errors like spelling or grammar mistakes, unclear or ambiguous text, factual errors in text, or syntax errors in examples, we have several steps.

1. Make a GitHub issue.
2. The editor will make a [proposed erratum](https://www.w3.org/wiki/ActivityPub_errata/Proposed) for review by the Social Web Working Group.
3. At a future Social Web WG meeting, the group will review the proposed erratum and decide whether to accept it. Accepted errata are added to the [errata](https://www.w3.org/wiki/ActivityPub_errata) page.
4. The editor will incorporate the errata into the [Editor's Draft](https://w3.github.io/activitypub/).
5. Errata are periodically deployed to the main [ActivityPub specification](https://www.w3.org/TR/activitypub/).

### Backwards-compatible changes

Backwards-compatible changes to ActivityPub include the following:

- Adding new kinds of activities
- Adding new kinds of objects
- Making mandatory behaviours optional
- Adding new properties to existing types

Backwards-compatible changes should usually be implemented as extensions to the specification. The [Activity Streams 2.0 primer](https://www.w3.org/wiki/Activity_Streams/Primer/Extensions) describes the extension architecture for ActivityStreams 2.0. The [Extensions Policy](https://swicg.github.io/extensions-policy/) describes the process for incorporating popular extensions into the main Activity Streams 2.0 context document.

The [Fediverse Enhancement Proposals](https://codeberg.org/fediverse/fep) process is a lightweight collaboration process for creating and documenting Activity Streams 2.0 extensions (and other changes to the Fediverse). It's a good place to start if you're considering a backwards-compatible change.

There are many ideas for backwards-compatible changes to ActivityPub that have not yet been written up as a FEP or other document. These are marked [Needs FEP](https://github.com/w3c/activitypub/issues?q=is%3Aissue+label%3A%22Needs+FEP%22) in the ActivityPub GitHub issue repository, and contributors are welcome to [submit a FEP](https://codeberg.org/fediverse/fep/src/branch/main#submitting-a-fep) on the topic. Note that issues may be closed without the FEP being created; that does not mean that the FEP is no longer needed.

Some backwards-compatible changes cannot be implemented as extensions. They require a new version of the core document; see below for how that process works. Examples include:

- Loosening behavioural requirements
- Deprecating existing properties or behaviours

### Breaking changes

Breaking changes to the specification require chartering a new working group at the W3C. It also requires making changes in dozens of ActivityPub implementations and tens of thousands of running servers. Breaking changes also cause disruption on the working network, since implementations and servers will upgrade gradually, on their own pace, not all at once. This is a lot of work, inhibits the point of the protocol (connecting people and communities), and is not done lightly.

Examples of such changes:

- Making optional features mandatory
- Forbidding optional features
- Forbidding required features

To propose a breaking change to ActivityPub, add a new issue. It will be discussed and flagged for the next version of ActivityPub.

## Lists of implementations

These lists are externally maintained and initiated.

- [delightful activitypub development](https://delightful.club/delightful_activitypub_development/): developer tools
- [delightful fediverse apps](https://delightful.club/delightful_fediverse_apps/): ActivityPub federation protocol implementations
- [FediDB software](https://fedidb.org/software): periodically polled software census, with statistics per implementation
