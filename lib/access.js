export const OWNER_ROLE = 'owner';
export const LIMITED_TEAM_ROLES = ['operations', 'ops', 'priest', 'pandit', 'team'];

export function getAccess(profile) {
  const role = String(profile?.role || '').toLowerCase();
  const isOwner = role === OWNER_ROLE;
  const isLimitedTeam = LIMITED_TEAM_ROLES.includes(role);

  return {
    role: role || 'none',
    canOpenAdmin: isOwner || isLimitedTeam,
    canManageAllData: isOwner,
    canViewOpsOnly: isOwner || isLimitedTeam,
  };
}
