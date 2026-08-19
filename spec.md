# LinkGarden — Product Specification

## 1. Purpose

LinkGarden is a collaborative link manager and a public, human-curated
directory of the web. It helps people save useful links, publish them for
others, organize them into meaningful collections, maintain those collections
with others, and discover websites and hidden gems outside algorithm-driven
feeds.

The long-term product goal is to build a large public collection of useful
websites through individual contributions and collaborative curation. It should
particularly help people find valuable parts of the long-tail web, such as
personal blogs and independent sites that are difficult to discover through
conventional search engines.

The core product loop is:

> Find a useful link, save or publish it, add it to a list, curate it with
> others, and help make the useful web easier to discover.

This document defines the expected behavior of the first release. It is the
source of truth for the implementation plan, data model, permissions, and
acceptance tests.

## 2. Product principles

- Public discovery is a core feature, not an optional sharing add-on.
- Anyone can browse and search public content without an account.
- A verified user can publish an individual link without first adding it to a
  list.
- Link and list visibility are independent of collaboration. A list can be
  private or public whether it has no editors or many editors.
- An account with a verified email is required for every write action.
- The product has two user-facing content concepts: links and lists of links.
- A personal link and a link in a list have independent ownership and
  lifecycles, even when they point to the same URL.
- Public lists provide human context through link titles, descriptions, tags,
  ordering, and curator identity rather than acting as raw URL dumps.
- Collaboration in the first release means maintaining links in lists together.
  It does not include teams, comments, chat, or real-time editing.

## 3. Actors

### Visitor

A visitor is not signed in. Visitors can browse and search public profiles,
public personal links, public lists, and links in public lists. They cannot
create, modify, report, or collaborate on content.

### Unverified user

An unverified user can sign in and use the same read-only public experience as
a visitor. Email verification is required before the user can perform any
write action.

### Verified user

A verified user can manage personal links, publish individual links, create
private or public lists, accept invitations, collaborate, and report public
content.

### List editor

A list editor is a verified user who accepted an invitation to a list. Editors
can maintain that list's links but do not control the list itself.

### List owner

The owner has all editor permissions and controls list details, visibility,
invitations, ownership transfer, and deletion.

### Platform administrator

A platform administrator can review content reports, dismiss them, and hide or
restore reported public lists and links.

## 4. Core domain model

The product stores links only. Notes, files, documents, free-standing text, and
other saved-item types are not supported. Supporting records such as accounts,
profiles, invitations, and reports are not user-facing content types.

### 4.1 Link

A link is a saved HTTP or HTTPS URL. It contains:

- The submitted URL and its normalized form.
- A title and description.
- Zero or more tags.
- For personal links, visibility: `private` or `public`.
- Moderation state: `active` or `hidden`.
- Metadata retrieval status: `pending`, `ready`, or `failed`.
- Metadata retrieval and retry timestamps.
- Creation and update timestamps.

Title and description are initially fetched from the linked page when
available. Metadata retrieval does not block saving, and the person or list
members who control the link can edit its title, description, and tags.

Every link has exactly one context:

- A personal link belongs to one verified user and has a visibility of
  `private` or `public`. A private personal link is visible only to its owner.
  An active public personal link is visible to everyone, including visitors who
  are not signed in.
- A list link belongs to one list. The user who added it is retained for
  attribution while that user exists, but does not own or exclusively control
  the link.

A personal link and a list link that point to the same normalized URL are
independent records. Editing or deleting either one does not change the other.
Adding a personal link to a list creates an independent list link by copying
its URL, title, description, and tags. Later changes do not synchronize.

A normalized URL can occur only once in a user's personal library and only
once in a particular list. Attempting to add it again must fail with a clear
`link already exists` validation error.

#### URL normalization

The first release accepts only HTTP and HTTPS URLs. Normalization must:

- Lowercase the hostname.
- Remove default HTTP and HTTPS ports.
- Remove URL fragments.
- Normalize an empty path to `/`.
- Retain query parameters because they may identify distinct resources.

Metadata retrieval must not block creation. A link is saved immediately in the
`pending` state, processed asynchronously, and left usable if retrieval fails.
Failed retrievals can be retried.

Only the owner can create, edit, publish, make private, or delete a personal
link. The list owner and accepted editors can create, edit, reorder, or remove
every link in their list, regardless of who added it.

### 4.2 List

A list is an ordered collection owned by one verified user.

It contains:

- A title, description, and immutable slug.
- An owner.
- Visibility: `private` or `public`.
- Moderation state: `active` or `hidden`.
- Creation and update timestamps.

Visibility and collaboration are independent:

- A list can remain private or be made public without inviting any editors.
- A private list is visible only to its owner and accepted editors.
- A private list with editors is described in the product as a shared list.
- A public list is visible to everyone and editable only by its owner and
  accepted editors.
- Administrator hiding overrides the owner's visibility setting until an
  administrator restores the content.

The combination of owner and slug must be unique. Slugs are immutable in the
first release so shared and indexed links remain stable.

Each link in a list also has an explicit ordering position. Adding a URL
directly to a list creates a list link but does not automatically create a
personal link for the contributor.

Tags use a normalized, case-insensitive name so equivalent spellings do not
create duplicate tag identities. Personal-link tags are private. List-link
tags become publicly searchable only when their list and link are both public
and active.

### 4.3 Profile

Every user who writes content has a profile containing:

- An immutable, globally unique username.
- Display name.
- Optional bio and avatar.
- Joined date.

The public profile route is `/@username`. It shows the profile, the user's
active public personal links, and their active public lists. Private personal
links, private lists, memberships, and pending invitations never appear on the
public profile.

A public list route is `/@username/list-slug`.

## 5. Permissions

| Action                               | Visitor | Unverified user | Verified user | Editor | Owner | Admin            |
| ------------------------------------ | ------- | --------------- | ------------- | ------ | ----- | ---------------- |
| View active public content           | Yes     | Yes             | Yes           | Yes    | Yes   | Yes              |
| View a private list                  | No      | No              | No            | Yes    | Yes   | Admin tools only |
| Save a personal link                 | No      | No              | Yes           | Yes    | Yes   | Yes              |
| Publish a personal link              | No      | No              | Yes           | Yes    | Yes   | Yes              |
| Create a list                        | No      | No              | Yes           | Yes    | Yes   | Yes              |
| Add/edit/remove/reorder list links   | No      | No              | No            | Yes    | Yes   | No               |
| Edit list details or visibility      | No      | No              | No            | No     | Yes   | No               |
| Invite or remove editors             | No      | No              | No            | No     | Yes   | No               |
| Transfer or delete a list            | No      | No              | No            | No     | Yes   | No               |
| Report public content                | No      | No              | Yes           | Yes    | Yes   | Yes              |
| Hide or restore reported content     | No      | No              | No            | No     | No    | Yes              |

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
- Removing an editor revokes access immediately but does not remove links
  they previously added.
- An editor can leave a list. The owner cannot leave without transferring or
  deleting the list.
- Ownership can be transferred only to an accepted editor. After transfer, the
  previous owner becomes an editor unless their account is being deleted.

## 7. Discovery and search

The first release provides:

- A public homepage with recently published links and recently created or
  updated public lists.
- Search across active public personal links, public lists, and active links in
  public lists.
- Public curator profiles.
- Search results for both lists and individual links.

List search considers the list title, description, owner username, and public
link content. Link search considers its title, description, tags, URL, and
owner or curators.

Every list-link result identifies and links through its containing public list
so the curator's context is preserved. A public personal-link result identifies
its owner and links to the external URL. Search and recent feeds must exclude
private personal links, private lists, hidden lists, and hidden links.

Popularity ranking, featured collections, following, recommendations, and
"surprise me" are deferred.

## 8. Reporting and moderation

- A verified user can report an active public personal link, public list, or
  active link in a public list.
- A report records the reporter, target, reason, optional explanation, status,
  and timestamps.
- Report statuses are `open`, `dismissed`, or `actioned`.
- A user cannot create multiple open reports for the same target.
- Administrators review reports in a small private queue.
- An administrator can dismiss a report or hide the target and mark the report
  as actioned.
- Hiding a list removes the list and all of its links from public routes,
  search, feeds, and public profiles, while preserving it for its owner and
  editors.
- Hiding a link removes only that link from public access and discovery,
  whether it is a public personal link or a link in a public list.
- Owners and editors cannot override an administrator-hidden state.
- Restoring content is an administrator action and does not alter its owner-set
  visibility.

## 9. Lifecycle and deletion rules

### Personal-link deletion

Delete the personal link and its tag associations. Keep every independently
stored list link with the same normalized URL intact.

### List-link removal

Delete only the link in that list and its tag associations. Keep personal links
and links in other lists with the same normalized URL intact.

### List deletion

Delete its links, link-tag associations, memberships, and pending invitations.
Do not delete users' personal links or links in other lists.

### Account deletion

- Block deletion while the user owns any shared or public list.
- Require those lists to be transferred or explicitly deleted first.
- Private lists owned only by the user may be deleted with the account.
- Delete the user's personal links, their link tags, memberships, invitations,
  and profile.
- Preserve list links the user added to lists owned by others, but remove or
  anonymize the contributor reference.
- Preserve reports and moderation audit information while anonymizing the
  deleted reporter where required.

## 10. Logical data model

The implementation should model these entities:

- Existing Better Auth `user`, `session`, `account`, and `verification` tables.
- `profile`: one-to-one public identity for a user.
- `link`: URL, title, description, visibility where applicable, metadata state,
  ordering and moderation fields, plus exactly one context: a personal owner or
  a containing list.
- `tag`: normalized tag identity.
- `link_tag`: link-to-tag association.
- `list`: owner, presentation, visibility, and moderation state.
- `list_member`: one accepted editor membership per user and list.
- `list_invitation`: pending, accepted, expired, or revoked invitation state.
- `content_report`: report target, reason, workflow state, and reviewer.
- `platform_admin`: explicit administrator assignment independent of public
  profile data.

Foreign keys, uniqueness constraints, deletion behavior, moderation fields,
and timestamps must enforce the rules in this specification. The `link` table
must enforce that exactly one of `owner_user_id` and `list_id` is set, uniqueness
of `(owner_user_id, normalized_url)` for personal links, and uniqueness of
`(list_id, normalized_url)` for list links. The placeholder `task` table is not
part of the product model and should be removed when the product schema is
introduced.

## 11. Acceptance scenarios

The first release is behaviorally complete when all of the following hold:

1. A visitor can view and search active public personal links, profiles, lists,
   and list links without signing in.
2. An unverified user cannot save, create, edit, collaborate, publish, or
   report.
3. Two users can save the same normalized URL with independently editable
   titles, descriptions, and tags.
4. A user cannot save the same normalized URL twice in their own library.
5. A user can make a personal link public or private; only an active public link
   is visible to other users and signed-out visitors.
6. A URL can be added to a list without being saved to the contributor's
   personal library, and adding a personal link to a list creates an independent
   list link.
7. Editors can maintain every link in their list but cannot change another
   user's personal links or owner-only list settings.
8. The same normalized URL cannot appear twice in one list; a duplicate attempt
   returns a clear validation error without changing the list.
9. Deleting a personal link leaves every list link with the same URL intact.
10. Removing a link from a list leaves personal links and other lists intact.
11. A list can be private or public without collaborators; adding editors does
    not alter its visibility.
12. Private lists are inaccessible to non-members, including by direct URL.
13. Public lists are readable without authentication and writable only by the
    owner and accepted editors.
14. Invitations are recipient-bound, expire, can be revoked, and cannot be
    reused.
15. Metadata failure does not prevent a link from being saved, and retrieval can
    be retried.
16. Public search and recent feeds include active public personal links and
    public-list links while excluding private and hidden content.
17. A moderator-hidden list or link cannot be republished by its owner.
18. Account deletion cannot orphan a shared or public list.
19. Public profile and list URLs remain stable throughout the first release.

## 12. Out of scope for the first release

- Read-only collaborator roles or granular team permissions.
- Teams, organizations, or reusable groups.
- Comments, chat, presence, and real-time collaborative editing.
- Nested lists or folders.
- Following users or lists.
- Copying or forking collections.
- Browser bookmark import/export, extensions, or bookmarklets.
- Activity history and restoration of deleted links.
- Automated broken-link detection or page archiving.
- Popularity rankings, editorially featured content, and personalized
  recommendations.
