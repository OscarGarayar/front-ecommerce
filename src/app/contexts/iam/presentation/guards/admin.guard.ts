import { CanActivateFn, Router } from '@angular/router';
import { inject } from '@angular/core';
import { SessionStore } from '../../../../core/state/session.store';
import { RoleUtils } from '../../domain/model/role';

export const adminGuard: CanActivateFn = () => {
  const router = inject(Router);
  const session = inject(SessionStore);

  if (RoleUtils.isAdmin(session.snapshot.role)) return true;

  router.navigateByUrl('/shop');
  return false;
};
