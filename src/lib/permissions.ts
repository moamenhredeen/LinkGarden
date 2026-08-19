export type Actor = { userId?: string; verified: boolean; hasProfile: boolean; isAdmin?: boolean };
export type ListAccess = { ownerUserId: string; editorUserIds: readonly string[]; visibility: 'private' | 'public'; moderationState: 'active' | 'hidden' };
export type PersonalLinkAccess = { ownerUserId: string; visibility: 'private' | 'public'; moderationState: 'active' | 'hidden' };

export const canWrite = (actor: Actor) => Boolean(actor.userId && actor.verified && actor.hasProfile);
export const canViewPersonalLink = (actor: Actor, item: PersonalLinkAccess) => item.ownerUserId === actor.userId || (item.visibility === 'public' && item.moderationState === 'active');
export const canViewList = (actor: Actor, item: ListAccess) => item.ownerUserId === actor.userId || item.editorUserIds.includes(actor.userId ?? '') || (item.visibility === 'public' && item.moderationState === 'active');
export const canEditListLinks = (actor: Actor, item: ListAccess) => canWrite(actor) && (item.ownerUserId === actor.userId || item.editorUserIds.includes(actor.userId!));
export const canManageList = (actor: Actor, item: ListAccess) => canWrite(actor) && item.ownerUserId === actor.userId;
