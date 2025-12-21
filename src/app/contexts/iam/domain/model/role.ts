export type Role = 'GUEST' | 'CLIENT' | 'ADMIN' | string;

export const RoleUtils = {
  isAdmin(role: Role | null | undefined): boolean {
    const r = (role ?? '').toUpperCase();
    return r === 'ADMIN' || r === 'ROLE_ADMIN';
  },

  isClient(role: Role | null | undefined): boolean {
    const r = (role ?? '').toUpperCase();
    return (
      r === 'CLIENT' ||
      r === 'ROLE_CLIENT' ||
      r === 'USER' ||
      r === 'ROLE_USER'
    );
  },
};

export const RolePolicy = {
  // Customer area: solo clientes (no admin)
  isAllowedForCustomerArea(role: Role | null | undefined): boolean {
    return RoleUtils.isClient(role);
  },

  // Admin area: solo admins
  isAllowedForAdminArea(role: Role | null | undefined): boolean {
    return RoleUtils.isAdmin(role);
  },
};
