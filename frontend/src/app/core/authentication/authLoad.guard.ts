import { Injectable } from '@angular/core';
import { Router, Route, RouterStateSnapshot } from '@angular/router';

import { AuthenticationService } from './authentication.service';
import { AlertService } from '../alert/alert.service';

@Injectable({
  "providedIn": "root"
})
export class AuthLoadGuard  {

  constructor(
    private router: Router,
    private authenticationService: AuthenticationService,
    private alertService: AlertService
  ) { }

  canLoad(route: Route) {
    if (this.authenticationService.currentUser && this.authenticationService.currentUser.active_privileges) {
      /* Logged in */

      // logged in users should not go to login
      if (route.path === "login") {
        this.router.navigate(['/', 'home']);
        return true;
      }

      if (!this.authenticationService.authorizeMany(route.data['accessPrivileges'])) {
        // user does not have access rights
        this.alertService.error(`
          You need one of "${route.data['accessPrivileges']}" rights to visit ${route.path}.`);
        this.router.navigate(['/401']);
        return false;
      } else {
        // logged in with correct rights
        return true;
      }
    } else {

      /* Not logged in */
      // public page
      if (route.data['accessLevel'] === 'public') {
        return true;
      }

      // anon page
      if (route.data['accessLevel'] === 'anon') {
        return true;
      }

      // user page
      this.router.navigate(['/', 'login']);
      return true;
    }
  }
}
