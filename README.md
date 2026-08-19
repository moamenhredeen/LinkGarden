# Don't Loose It

Don't Loose It is a collaborative bookmark manager and public directory for
rediscovering the web. It is a place to save useful links, curate collections
with other people, and uncover lost websites and hidden gems.

The product is built around a simple loop:

> Find a useful link, save it to a list, curate it with others, and share the
> collection with the world.

## Product vision

Modern discovery is dominated by feeds, algorithms, and a small number of large
platforms. Valuable independent websites are easy to lose and difficult to find
again. Don't Loose It should become a human-curated map of the interesting web.

Public discovery is a central part of the product, not an optional sharing
feature. Anyone should be able to explore public lists and bookmarks without an
account. An account is required only when someone wants to save bookmarks,
create or maintain lists, or collaborate with another user.

## Core concepts

### Bookmarks

- A bookmark belongs to one user.
- A user can create, edit, and delete their bookmarks.
- The same bookmark can be added to multiple lists.
- A URL should be unique within a user's bookmark library.
- Page metadata such as the title, description, favicon, and image can be
  retrieved automatically.

### Lists

- A list is owned by one user.
- A list contains bookmarks and can be ordered and maintained as a collection.
- The same bookmark can have a different title, note, and tags in each list.
- Lists can be private, shared with invited users, or public.

### Collaboration

- The list owner invites collaborators individually.
- Collaborators maintain a list together by adding, editing, reordering, and
  removing entries.
- The owner controls the list's visibility, collaborators, and deletion.
- The initial collaboration model does not include teams, chat, comments, or
  real-time cursors.

### Visibility

- **Private:** visible and editable only by the owner.
- **Shared:** visible and editable by the owner and invited collaborators.
- **Public:** visible to everyone and editable by the owner and collaborators.

Public pages should be indexable by search engines so useful collections can be
found outside the application as well.

## Discovery

The public experience should help people find websites worth keeping. It may
include:

- Search across public lists, bookmarks, descriptions, tags, and curators.
- Featured and recently maintained collections.
- Popular or recently discovered hidden gems.
- Topic and tag pages.
- Public curator profiles.
- A "surprise me" path for exploring unexpected parts of the web.

A public list should provide context for its links rather than acting as a raw
URL dump. Titles, notes, tags, ordering, and the people maintaining it should
make each collection useful and trustworthy.

## Initial release

The first release should focus on the complete curation and discovery loop:

1. Browse and search public content without an account.
2. Register, sign in, and manage a public profile.
3. Save bookmarks and retrieve their page metadata.
4. Create lists and choose their visibility.
5. Add a bookmark to one or more lists.
6. Add list-specific titles, notes, tags, and ordering.
7. Invite individual collaborators.
8. Maintain shared and public lists together.

## Later possibilities

- Follow lists and curators.
- Save or copy public collections.
- Import and export browser bookmarks.
- Browser extensions and bookmarklets.
- Activity history and restoration of removed entries.
- Duplicate and broken-link detection.
- Page archiving for links that disappear.
- Personalized recommendations and trending collections.
