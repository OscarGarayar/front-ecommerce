import { CanActivateFn, Router } from '@angular/router';
import { inject } from '@angular/core';
import { SessionStore } from '../../../../core/state/session.store';

export const authGuard: CanActivateFn = () => {
  const router = inject(Router);
  const session = inject(SessionStore);

  if (session.snapshot.token) return true;

  router.navigateByUrl('/auth/login');
  return false;
};
