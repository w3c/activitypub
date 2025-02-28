# Following a person

From https://www.w3.org/wiki/Socialwg/Social_API/User_stories#Following_a_person

> 1. Delano meets Beth at a company meeting. They are both user interface designers. He finds her ideas interesting.
> 2. Delano follows Beth on their company social network.
> 3. Beth posts a photo from a whiteboarding session at a company retreat.
> 4. Delano sees the photo in his inbox stream.
> 5. Ted, Delano's coworker, wants to find new people to follow. He looks at the list of people that Delano follows. He finds Beth in the list, reads her stream, enjoys it, and decides to follow her, too.
> 6. Beth posts frequently. Delano is having a hard time reading his inbox stream because Beth's activities drown out everyone else's. He stops following Beth.

## 1, 2: Meeting and following a new person

At the Acme Game Corp company all-hands, Delano and Beth discover they
have a shared interest in user interface history and both have a soft
spot for retro toolkits like Motif.  It's not every day you meet
someone else to chat about vintage GUI elements, so Delano asks if
they can chat further.  Beth hands Delano her business card and
suggests maybe they could collaborate on an upcoming project.

Delano sees that her name is "Beth Marie Bost" and enters her name
into the company people-finder.  He ends up at the following URL, her
internal profile:

  https://acmegamecorp.example/people/beth_m_bost/

That's her all right!  He decides to subscribe to her using his
desktop client.  He hits the "subscribe" button and pastes her profile
URL into the textbox.

Delano's client submits a post to its outbox declaring that Delano
would like to subscribe to Beth.  Beth is included as a recipient in
the "to" field so that her server can know to begin delivery of
messages to Delano, and the special
[public collection](http://w3c.github.io/activitypub/#public-addressing)
is added as a Cc: so that others might know about that subscription.


```
POST /api/user/delano_sota/feed HTTP/1.1
Host: acmegamecorp.example
Content-Type: application/activitystreams+json
Authorization: Bearer xx-bearer-token-here-xx

{
  "@context": "http://www.w3.org/ns/activitystreams",
  "@type": "Follow",
  "actor": {
    "@type": "Person",
    "@id": "https://acmegamecorp.example/people/delano_sota/",
    "displayName": "Delano Sota",
  },
  "object": {
    "@type": "Person",
    "@id": "https://acmegamecorp.example/people/beth_m_bost/"
  },
  "to": [{
      "@type": "Person",
      "@id": "https://acmegamecorp.example/people/beth_m_bost/"
  }],
  "cc": [{
    "@context": "http://www.w3.org/ns/activitystreams",
    "@id": "http://activityschema.org/collection/public",
    "@type": "Collection"
  }]
}
```

Behind the scenes, Delano's server fetches Beth's profile URL and sees
a Json-LD encoded ActivityStreams representation of a Person on the
page:

```
GET /people/beth_m_bost/
Host: acmegamecorp.example
Content-Type: text/html

<!DOCTYPE html>
<html>
  <head>
    <script type="application/ld+json">
      {
        "@context": [
          "http://www.w3.org/ns/activitystreams",
          "http://www.w3.org/ns/activitypub"
        ],
        "@type": "Person",
        "@id": "https://acmegamecorp.example/people/beth_m_bost/",
        "following": "https://acmegamecorp.example/api/user/beth_m_bost/following",
        "followers": "https://acmegamecorp.example/api/user/beth_m_bost/followers",
        "inbox": "https://acmegamecorp.example/api/user/beth_m_bost/inbox",
        "outbox": "https://acmegamecorp.example/api/user/beth_m_bost/outbox",
        "preferredUsername": "beth_m_bost",
        "displayName": "Beth M. Bost",
        "summary": "AcmeGameCorp UI designer.  Fan of embossed widgets and 1990s video game menus.",
        "icon": [
          "https://acmegamecorp.example/media/profile_pics/beth_m_bost.png"
        ]
      }
    </script>
  </head>
  <body>
    <!-- Content goes here! -->
  </body>
</html>
```

The server takes note of Beth's "inbox"; it needs this information so
that it can send this activity to Beth.  Now that it has it, it posts
the same activity that Delano posted to his outbox to Beth's inbox.

```
POST /api/user/beth_m_bost/inbox HTTP/1.1
Host: acmegamecorp.example
Content-Type: application/activitystreams+json
Authorization: Bearer xx-bearer-token-here-xx

/* [SAME DOCUMENT AS POSTED TO ACTOR'S INBOX ENDPOINT]
   [... YES I KNOW JSON DOESN'T HAVE COMMENTS WHAT'S UP WITH THAT] */
```

Beth's server recognizes that Delano is subscribing to Beth and
records that information so that future activities addressed generally
to Beth's followers will reach Delano.  Beth will also get a
notification in her inbox seeing that Delano has subscribed to her,
which she can use to follow back.

Since this is a public post, Delano's server will also send this
message to all of Delano's followers.

## 3, 4: Seeing that new person's content

Beth has settled back from the company retreat and decides to post a
picture from a whiteboarding session she participated in.  Her client submits
to the file endpoint for her user
(note: where the file endpoint is defined still
[needs to be clarified](https://github.com/w3c-social/activitypub/issues/23))
and gets back a response object with the object.  The client then
makes a second post containing addressing of who the file should be
sent to.

```
POST /api/user/beth_m_bost/feed HTTP/1.1
Host: acmegamecorp.example
Content-Type: application/activitystreams+json
Authorization: Bearer xx-bearer-token-here-xx

{
  "@context": [
    "http://www.w3.org/ns/activitystreams",
    "http://www.w3.org/ns/activitypub"
  ],
  "@type": "Post",
  "actor": {
    "@type": "Person",
    "@id": "https://acmegamecorp.example/people/beth_m_bost/",
    "displayName": "Beth M. Bost"
  },
  "object": {
    "@id": "https://acmegamecorp.example/people/beth_m_bost/images/5150",
    "@type": "Image",
    "url": [{
        "@type": "Link",
        "href": "http://acmegamecorp.example/media/beth_m_bost/images/whiteboard_20150503.png",
        "mediaType": "image/png"
    }]
  },
  "to": [{
    "@context": "http://www.w3.org/ns/activitystreams",
    "@id": "http://activityschema.org/collection/public",
    "@type": "Collection"
  }]
}
```

When Delano next looks at his inbox, he sees this object, amongst
others:

```
GET /api/user/delano_sota/inbox HTTP/1.1
Host: acmegamecorp.example
Content-Type: application/activitystreams+json
Authorization: Bearer xx-bearer-token-here-xx

{
  "@context": [
    "http://www.w3.org/ns/activitystreams",
    "http://www.w3.org/ns/activitypub"
  ],
  "@id": "https://acmegamecorp.example/api/user/delano_sota/inbox",
  "@type": "Collection",
  "itemsType": ["activity"]
  "items": [
    {
      "@context": [
        "http://www.w3.org/ns/activitystreams",
        "http://www.w3.org/ns/activitypub"
      ],
      "@type": "Post",
      "actor": {
        "@type": "Person",
        "@id": "https://acmegamecorp.example/people/beth_m_bost/",
        "displayName": "Beth M. Bost"
      },
      "object": {
        "@id": "https://acmegamecorp.example/people/beth_m_bost/images/5150",
        "@type": "Image",
        "url": [{
            "@type": "Link",
            "href": "http://acmegamecorp.example/media/beth_m_bost/images/whiteboard_20150503.png",
            "mediaType": "image/png"
        }]
      },
      "to": [{
        "@context": "http://www.w3.org/ns/activitystreams",
        "@id": "http://activityschema.org/collection/public",
        "@type": "Collection"
      }]
    }
    /* More objects here */
  ]
}
```

## 5: Friends finding and following friends

Ted looks at his sad and fairly quiet timeline and thinks he should
follow someone interesting.  He sees that Delano has recently
favorited and shared with his followers several posts that Beth has
made.  He clicks on Beth's name in his client's interface and selects
"Subscribe".  Behind the scenes, the same process that happened with
Delano subscribing to Beth happens again, but instead with Ted
subscribing to Beth.

(I believe the above example is self explanatory enough to not repeat
those requests.)


## 6: Unfollowing someone

Delano is in the middle of an urgent project and needs to pay close
attention to messages from his immediate team-mates, but he is feeling
overwhelmed with Beth's frequent posting, which is making it hard for
him to sort through his inbox.  He decides to unsubscribe, at least
for now.  He clicks on Beth's username and selects "Unsubscribe".

His client submits an activity with an "Unfollow" activity to his
outbox:

```
POST /api/user/delano_sota/feed HTTP/1.1
Host: acmegamecorp.example
Content-Type: application/activitystreams+json
Authorization: Bearer xx-bearer-token-here-xx

{
  "@context": "http://www.w3.org/ns/activitystreams",
  "@type": "Unfollow",
  "actor": {
    "@type": "Person",
    "@id": "https://acmegamecorp.example/people/delano_sota/",
    "displayName": "Delano Sota",
  },
  "object": {
    "@type": "Person",
    "@id": "https://acmegamecorp.example/people/beth_m_bost/"
  },
  "to": [{
      "@type": "Person",
      "@id": "https://acmegamecorp.example/people/beth_m_bost/"
  }],
  "cc": [{
    "@context": "http://www.w3.org/ns/activitystreams",
    "@id": "http://activityschema.org/collection/public",
    "@type": "Collection"
  }]
}
```

Delano's server sends the above activity to Beth's inbox as well as
the inboxes of his general followers.  Delano's server removes Beth
from his "following" collection and Beth's server removes Delano from
Beth's "followers" collection.  In the future, Beth's server will not
send activities to Delano which are addressed to her general
followers.
