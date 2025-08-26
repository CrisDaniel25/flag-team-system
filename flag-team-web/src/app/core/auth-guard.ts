import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { Auth } from './auth';

export const authGuard: CanActivateFn = () => {
  const auth = inject(Auth); const router = inject(Router);
  if (!auth.isLoggedIn()) { router.navigateByUrl('/login'); return false; }
  return true;
};
