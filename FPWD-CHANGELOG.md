# Changelog

This is a log of changes since TR.

## Class 1

- The respec section was updated for the current status, including maintenance by the Social Web Working Group.
- Links to Activity Streams Core and Vocabulary were updated to the current respec short names for these documents.
- Normative respec references in non-normative sections were changed to non-normative references.
- Extra whitespace was trimmed in several lines throughout the document.

## Class 2

- The note at the end of Section 4.1 should read, "Properties containing natural language values, such as name or summary, make use of natural language support defined in ActivityStreams."
- In section 5.7, in the non-normative note, the description of the "liked" collection should read liked: Specifically a property of actors. This is a collection of objects liked by the actor, added to the collection as a side effect of delivery to the outbox.
- Section 5.3 "Followers Collection" erroneously says that the "followers" collection is a list of everyone who has sent a Follow activity for the actor (emphasis added). Because the receiving actor can optionally Reject a Follow activity, the sending actor can later Undo a Follow activity, and one or both could Block the other, not everyone who sends a Follow activity will be in the list of followers. A possible correction is to replace the text with Every actor SHOULD have a followers collection. This is where one would find a list of all the actors that are following the actor.
- In Section 3.2 "Retrieving objects", the first sentence contains a grammatical error and a mismatch in subject between the two clauses of the sentence. The incorrect text says "The HTTP GET method may be dereferenced", which is nonsensical; the HTTP GET method is used to dereference an identifier. Also, the sentence first refers to an "object" but later refers to an "activity". A possible correction is to rewrite the sentence as follows: "The HTTP GET method may be used to dereference an object's id property to retrieve the object."
- In Section 3.2 "Retrieving objects", the last sentence in the first paragraph refers to an "activity" when describing how to dereference an object. One possible correction is to change the last word: "The client MUST specify an Accept header with the application/ld+json; profile="https://www.w3.org/ns/activitystreams" media type in order to retrieve the object."
- In section 7.1.2 "Forwarding from Inbox", the third relevance check says The server MUST only target the values of to, cc, and/or audience on the original object being forwarded. However, it's important to note that only activities, not any object, would be forwarded this way. One solution is to replace the word "object" with "activity" in the sentence so it reads The server MUST only target the values of to, cc, and/or audience on the original activity being forwarded.
- Section 3.1, "Object identifiers", says in part that the server should create an ID "in the actor's namespace". "The actor's namespace" is not otherwise defined, making it impossible for implementers to comply. One solution is to remove this term from the sentence: However, for client to server communication, a server receiving an object posted to the outbox with no specified id SHOULD allocate an object ID and attach it to the posted object.
- All uses of the Public collection in examples are changed from the full URL `https://www.w3.org/ns/activitystreams#Public` to the prefixed URL `as:Public`, as they would be in a properly compacted JSON-LD document.
- "Care should be taken to not confuse the the likes collection" changed to "Care should be taken to not confuse the likes collection".
- Lowercase "should" is capitalized to "SHOULD" in the Outbox section.
- In the Outbox section, "the actor's profile" is changed to "the actor object".
- The term "foreign server", used once, was changed to the more common "remote server".
- The term "json" was capitalized to "JSON".
- A missing period "." was restored in the description of the following collection.
- The name "ActivityStreams" was changed to match the term used in the "Activity Streams" documents.
- Christine Lemmer Webber's name was corrected from her former name throughout the document, in credits, acknowledgements, and in examples.

## Class 3

- Exception for filtering. Section 6.11 should read, "Federated servers SHOULD perform delivery on all Activities posted to the outbox according to outbox delivery. Servers MAY filter activities for privacy, abuse mitigation, or other reasons."
- Exception for filtering.  Section 7.1.1 should read: "When objects are received in the outbox (for servers which support both Client to Server interactions and Server to Server Interactions), the server SHOULD target and deliver to: The to, bto, cc, bcc or audience fields if their values are individuals or Collections owned by the actor. Servers MAY filter activities for privacy, abuse mitigation, or other reasons."
- Section 5 should read, 'These OrderedCollection objects MUST be ordered consistently in reverse chronological order. Collections defined in other vocabularies, including extensions, are not subject to this requirement and can be unordered or ordered by other criteria.'
- In section 4.1 "Actor objects", the definition of "inbox" uses the imprecise term "reference" and is different from the definition of "outbox", giving the false impression that the range of the "inbox" property is different than that of "outbox". A possible correction is to make the definition of inbox parallel with that of outbox: "An OrderedCollection comprised of all the messages received by the actor; see 5.2 Inbox."
- In section 7.5 "Follow Activity", the second paragraph erroneously describes processing requirements for receiving an Accept activity with a Follow activity as the object. It describes changing the "followers" collection; however, receiving an "Accept" activity over the federation protocol would result in a change to the "following" collection. The correct behaviour is already described in section 7.6 "Accept Activity". One possible correction is to simply remove the second paragraph of section 7.5.
- Section 3.1 "Object identifiers", says in part that "identifiers must fall into one of the following groups: [...] An ID explicitly specified as the JSON null object, which implies an anonymous object (a part of its parent context)". However, Activity Streams 2.0 objects must be formatted as compacted JSON-LD objects, where `null` is not a meaningful property value, including for `id`. One solution is to simply leave the `id` property unspecified: ActivityPub extends this requirement; all objects distributed by the ActivityPub protocol MUST have unique global identifiers, unless they are intentionally transient or anonymous, in which case the identifier MAY be omitted. If present, the identifiers MUST be publicly dereferencable URIs, such as HTTPS URIs, with their authority belonging to that of their originating server. (Publicly facing content SHOULD use HTTPS URIs).
- In Section 6.3.1 "Partial updates", a mechanism for removing properties of an object by setting their values to null is defined. However, for JSON-LD, null values are elided from the compact representation, and treated as undefined, so the server will not receive the null value and cannot implement the property removal. One possible correction is to remove the following sentence: A special exception is for when the value is the json null type; this means that this field should be removed from the server's representation of the object.
- In the section on public inbox delivery, "a server MAY deliver that object to all known sharedInbox endpoints on the network" changed to "a server MAY deliver that object to additional sharedInbox endpoints on the network".
- In the section "Outbox Delivery Requirements for Server to Server", the phrase "to additional inboxes" is expanded to "to additional inboxes, such as `sharedInbox` endpoints".
- In discussing delivery of activities addressed only to the Public special collection, delivery to other inboxes is allowed. "If the object is addressed exclusively to the "public" collection, the object, may be publicly viewable in the actor's outbox without being delivered to any actors."

## Class 4

(No class 4 changes.)
