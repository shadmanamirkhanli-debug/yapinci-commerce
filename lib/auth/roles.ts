export const ROLES = {
  SUPER_ADMIN: "super-admin",
  ADMIN: "admin",
  CUSTOMER: "customer",
} as const;

export type RoleSlug = (typeof ROLES)[keyof typeof ROLES];

export const ADMIN_ROLES: RoleSlug[] = [ROLES.SUPER_ADMIN, ROLES.ADMIN];

export function isAdminRole(role?: string | null) {
  return role ? ADMIN_ROLES.includes(role as RoleSlug) : false;
}

export function isSuperAdmin(role?: string | null) {
  return role === ROLES.SUPER_ADMIN;
}
