# Don't Loose It — Product Specification

## 1. Purpose

Don't Loose It is a collaborative bookmark manager and a public,
human-curated directory of the web. It helps people save useful links, organize
them into meaningful collections, maintain those collections with others, and
discover websites and hidden gems outside algorithm-driven feeds.

The core product loop is:

> Find a useful link, save it or add it to a list, curate it with others, and
> share the collection with the world.

This document defines the expected behavior of the first release. It is the
source of truth for the implementation plan, data model, permissions, and
acceptance tests.

## 2. Product principles

- Public discovery is a core feature, not an optional sharing add-on.
- Anyone can browse and search public content without an account.
- An account with a verified email is required for every write action.
- A website, a user's personal save, and a placement in a list are separate
  concepts with independent ownership and lifecycles.
- Public lists provide human context through titles, notes, tags, ordering, and
  curator identity rather than acting as raw URL dumps.
- Collaboration in the first release means maintaining list entries together.
  It does not include teams, comments, chat, or real-time editing.

## 3. Actors

### Visitor

A visitor is not signed in. Visitors can browse and search public profiles,
lists, and list entries. They cannot create, modify, report, or collaborate on
content.

### Unverified user

An unverified user can sign in and use the same read-only public experience as
a visitor. Email verification is required before the user can perform any
write action.

### Verified user

A verified user can manage a private bookmark library, create lists, accept
invitations, collaborate, publish lists, and report public content.

### List editor

A list editor is a verified user who accepted an invitation to a list. Editors
can maintain that list's entries but do not control the list itself.

### List owner

The owner has all editor permissions and controls list details, visibility,
invitations, ownership transfer, and deletion.

### Platform administrator

A platform administrator can review content reports, dismiss them, and hide or
restore reported public lists and list entries.

## 4. Core domain model

### 4.1 Website

A website represents a canonical URL shared across the application.

It contains:

- The submitted URL and its normalized form.
- A system-fetched title, description, image, and favicon.
- Metadata retrieval status: `pending`, `ready`, or `failed`.
- Metadata retrieval and retry timestamps.
- Creation and update timestamps.

Canonical website metadata is managed only by the system. Users express their
own context through bookmarks and list entries.

Websites remain independent of the user who first submitted them. Deleting a
bookmark or list entry does not delete a website while another record still
references it.

#### URL normalization

The first release accepts only HTTP and HTTPS URLs. Normalization must:

- Lowercase the hostname.
- Remove default HTTP and HTTPS ports.
- Remove URL fragments.
- Normalize an empty path to `/`.
- Retain query parameters because they may identify distinct resources.

Metadata retrieval must not block creation. A website is saved immediately in
the `pending` state, processed asynchronously, and left usable if retrieval
fails. Failed retrievals can be retried.

### 4.2 Bookmark

A bookmark is a verified user's private save of a website.

It contains:

- Its owner and website.
- An optional private title override.
- An optional private note.
- Zero or more private tags.
- Creation and update timestamps.

A user can save a website only once. Different users can save the same website
and annotate it independently. A user's bookmark library is private in the
first release.

Only the bookmark owner can create, edit, or delete it. Deleting a bookmark has
no effect on any list entry for the same website.

### 4.3 List

A list is an ordered collection owned by one verified user.

It contains:

- A title, description, and immutable slug.
- An owner.
- Visibility: `private` or `public`.
- Moderation state: `active` or `hidden`.
- Creation and update timestamps.

Visibility and collaboration are independent:

- A private list is visible only to its owner and accepted editors.
- A private list with editors is described in the product as a shared list.
- A public list is visible to everyone and editable only by its owner and
  accepted editors.
- Administrator hiding overrides the owner's visibility setting until an
  administrator restores the content.

The combination of owner and slug must be unique. Slugs are immutable in the
first release so shared and indexed links remain stable.

### 4.4 List entry

A list entry is an editorial placement of a website inside a list.

It contains:

- Its list and website.
- The user who added it, when that user still exists.
- An optional list-specific title.
- An optional note.
- Zero or more list-specific tags.
- An explicit ordering position.
- A moderation state: `active` or `hidden`.
- Creation and update timestamps.

Adding a URL directly to a list creates or reuses the website and creates a
list entry. It does not automatically create a personal bookmark for the user
who added it.

The same website may appear multiple times in one list. Each placement has
independent context, tags, and ordering.

The owner and every editor can add, edit, reorder, and remove any entry in the
list, regardless of who added it. These actions never edit another user's
personal bookmark or the website's canonical metadata.

### 4.5 Tags

Tags use a normalized, case-insensitive name so equivalent spellings do not
create duplicate tag identities. Bookmark-tag associations are private.
List-entry tags become publicly searchable only when their list and entry are
both public and active.

### 4.6 Profile

Every user who writes content has a profile containing:

- An immutable, globally unique username.
- Display name.
- Optional bio and avatar.
- Joined date.

The public profile route is `/@username`. It shows the profile and the user's
active public lists. Private bookmarks, private lists, memberships, and pending
invitations never appear on the public profile.

A public list route is `/@username/list-slug`.

## 5. Permissions

| Action | Visitor | Unverified user | Verified user | Editor | Owner | Admin |
| --- | --- | --- | --- | --- | --- | --- |
| View active public content | Yes | Yes | Yes | Yes | Yes | Yes |
| View a private list | No | No | No | Yes | Yes | Admin tools only |
| Save a bookmark | No | No | Yes | Yes | Yes | Yes |
| Create a list | No | No | Yes | Yes | Yes | Yes |
| Add/edit/remove/reorder list entries | No | No | No | Yes | Yes | No |
| Edit list details or visibility | No | No | No | No | Yes | No |
| Invite or remove editors | No | No | No | No | Yes | No |
| Transfer or delete a list | No | No | No | No | Yes | No |
| Report public content | No | No | Yes | Yes | Yes | Yes |
| Hide or restore reported content | No | No | No | No | No | Yes |

Permissions must be enforced on the server for every read and write operation;
UI visibility is not an authorization boundary.

## 6. Collaboration and invitations

- Owners invite one editor at a time by username or email address.
- Each invitation is bound to one list and one intended recipient.
- Invitations are single-use, revocable, and expire after seven days.
- A registered recipient sees the invitation in the application and receives
  an email.
- An unregistered email recipient receives a link, creates an account, verifies
  the matching email address, and then accepts the invitation.
- An invitation addressed to an email can be accepted only by an account with
  that verified email.
- An invitation addressed to a user can be accepted only by that user.
- Accepting an invitation creates one editor membership. Duplicate memberships
  and duplicate active invitations for the same user and list are not allowed.
- Removing an editor revokes access immediately but does not remove entries
  they previously added.
- An editor can leave a list. The owner cannot leave without transferring or
  deleting the list.
- Ownership can be transferred only to an accepted editor. After transfer, the
  previous owner becomes an editor unless their account is being deleted.

## 7. Discovery and search

The first release provides:

- A public homepage with recently created or recently updated public lists.
- Search across active public lists and active entries.
- Public curator profiles.
- Search results for both lists and individual entries.

List search considers the list title, description, owner username, and public
entry content. Entry search considers its contextual title, note, tags, URL,
and available canonical website metadata.

Every entry result links through its containing public list so the curator's
context is preserved. Search and recent feeds must exclude private lists,
hidden lists, and hidden entries.

Popularity ranking, featured collections, following, recommendations, and
"surprise me" are deferred.

## 8. Reporting and moderation

- A verified user can report an active public list or list entry.
- A report records the reporter, target, reason, optional explanation, status,
  and timestamps.
- Report statuses are `open`, `dismissed`, or `actioned`.
- A user cannot create multiple open reports for the same target.
- Administrators review reports in a small private queue.
- An administrator can dismiss a report or hide the target and mark the report
  as actioned.
- Hiding a list removes the list and all of its entries from public routes,
  search, feeds, and public profiles, while preserving it for its owner and
  editors.
- Hiding an entry removes only that entry from public access and discovery.
- Owners and editors cannot override an administrator-hidden state.
- Restoring content is an administrator action and does not alter its owner-set
  visibility.

## 9. Lifecycle and deletion rules

### Bookmark deletion

Delete the bookmark and its private tag associations. Keep the website and all
list entries intact.

### List-entry deletion

Delete only that placement and its tag associations. Keep the website,
bookmarks, and other placements intact.

### List deletion

Delete its entries, entry-tag associations, memberships, and pending
invitations. Do not delete referenced websites or users' bookmarks.

### Account deletion

- Block deletion while the user owns any shared or public list.
- Require those lists to be transferred or explicitly deleted first.
- Private lists owned only by the user may be deleted with the account.
- Delete the user's bookmarks, private bookmark tags, memberships, invitations,
  and profile.
- Preserve list entries the user added to lists owned by others, but remove or
  anonymize the contributor reference.
- Preserve reports and moderation audit information while anonymizing the
  deleted reporter where required.

## 10. Logical data model

The implementation should model these entities:

- Existing Better Auth `user`, `session`, `account`, and `verification` tables.
- `profile`: one-to-one public identity for a user.
- `website`: normalized URL and system metadata.
- `bookmark`: one private save per user and website.
- `tag`: normalized tag identity.
- `bookmark_tag`: private bookmark-to-tag association.
- `list`: owner, presentation, visibility, and moderation state.
- `list_member`: one accepted editor membership per user and list.
- `list_invitation`: pending, accepted, expired, or revoked invitation state.
- `list_entry`: ordered contextual placement of a website.
- `list_entry_tag`: entry-to-tag association.
- `content_report`: report target, reason, workflow state, and reviewer.
- `platform_admin`: explicit administrator assignment independent of public
  profile data.

Foreign keys, uniqueness constraints, deletion behavior, moderation fields,
and timestamps must enforce the rules in this specification. The placeholder
`task` table is not part of the product model and should be removed when the
product schema is introduced.

## 11. Acceptance scenarios

The first release is behaviorally complete when all of the following hold:

1. A visitor can view and search active public profiles, lists, and entries
   without signing in.
2. An unverified user cannot save, create, edit, collaborate, publish, or
   report.
3. Two users can save the same website with different private annotations.
4. A user cannot save the same website twice in their own library.
5. A URL can be added to a list without being saved to the contributor's
   personal library.
6. Editors can maintain every entry in their list but cannot change another
   user's bookmark, canonical website metadata, or owner-only list settings.
7. The same website can have multiple independently editable placements in one
   list.
8. Deleting a bookmark leaves every list entry for that website intact.
9. Removing a list entry leaves bookmarks and other placements intact.
10. Private lists are inaccessible to non-members, including by direct URL.
11. Public lists are readable without authentication and writable only by the
    owner and accepted editors.
12. Invitations are recipient-bound, expire, can be revoked, and cannot be
    reused.
13. Metadata failure does not prevent a website, bookmark, or entry from being
    saved, and retrieval can be retried.
14. Public search and recent feeds exclude private and hidden content.
15. A moderator-hidden list or entry cannot be republished by its owner.
16. Account deletion cannot orphan a shared or public list.
17. Public profile and list URLs remain stable throughout the first release.

## 12. Out of scope for the first release

- Read-only collaborator roles or granular team permissions.
- Teams, organizations, or reusable groups.
- Comments, chat, presence, and real-time collaborative editing.
- Nested lists or folders.
- Public personal bookmark libraries.
- Following users or lists.
- Copying or forking collections.
- Browser bookmark import/export, extensions, or bookmarklets.
- Activity history and restoration of deleted entries.
- Automated broken-link detection or page archiving.
- Community editing of canonical website metadata.
- Popularity rankings, editorially featured content, and personalized
  recommendations.
