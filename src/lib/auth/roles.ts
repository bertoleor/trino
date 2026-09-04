export type Role = 'super_admin' | 'admin' | 'editor' | 'viewer';

export const ROLE_RANK: Record<Role, number> = {
  super_admin: 4,
  admin: 3,
  editor: 2,
  viewer: 1,
};

function rankOf(role: string): number {
  return (ROLE_RANK[role as Role] ?? 0);
}

export function hasRole(userRole: Role, required: Role): boolean {
  const userRank = rankOf(userRole);
  const reqRank = rankOf(required);
  if (userRank === 0 || reqRank === 0) return false;
  // unknown handled as 0 above; explicit 99 in SQL maps to deny here
  if (reqRank === 99) return false;
  return userRank >= reqRank;
}

export function requireRole(userRole: Role, required: Role): void {
  if (!hasRole(userRole, required)) {
    throw new Error(`Forbidden: ${userRole} lacks ${required}`);
  }
}

export function isEditorOrAbove(role: Role): boolean {
  return hasRole(role, 'editor');
}

export function isAdminOrAbove(role: Role): boolean {
  return hasRole(role, 'admin');
}

export function isSuperAdmin(role: Role): boolean {
  return role === 'super_admin';
}
