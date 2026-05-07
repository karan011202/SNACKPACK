import {Injectable} from '@angular/core';
import {CanActivate, ActivatedRouteSnapshot, Router, RouterStateSnapshot} from '@angular/router';

@Injectable({
  providedIn: 'root',
})
export class AuthGuard implements CanActivate {
  constructor(private router: Router) {}

  canActivate(_route: ActivatedRouteSnapshot, state: RouterStateSnapshot): boolean {
    const token = localStorage.getItem('snackpackAuthToken');

    if (token) {
      return true;
    }

    this.router.navigate(['/login'], {
      state: {
        returnUrl: state.url,
      },
    });

    return false;
  }
}
