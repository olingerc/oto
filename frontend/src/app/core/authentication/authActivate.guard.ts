
import { Injectable } from '@angular/core';
import { Router, CanActivate, ActivatedRouteSnapshot, RouterStateSnapshot } from '@angular/router';

import {of as observableOf,  Observable } from 'rxjs';
import {catchError, map} from 'rxjs/operators';
import * as _ from 'lodash';

import { AuthenticationService } from './authentication.service';
import { AlertService } from '../alert/alert.service';


@Injectable({
  "providedIn": "root"
})
export class AuthActivateGuard implements CanActivate {

  constructor(
    private router: Router,
    private authenticationService: AuthenticationService,
    private alertService: AlertService
  ) { }

  canActivate(route: ActivatedRouteSnapshot, state: RouterStateSnapshot) {
    let currentUser = JSON.parse(localStorage.getItem('currentUser'));
    if (currentUser && currentUser.active_privileges) {
      // logged in, but first check if token still valid
      return this.authenticationService
        .checkTokenValidity()
        .pipe(map(
          // Token valid, go on to check access privileges
          () => {
            if (!this.authenticationService.authorizeMany(route.data['accessPrivileges'])) {
              // user does not have access rights

              if (currentUser.privileges.length === 0) {
                // NOTE: Problem if authLoadGuard did not run since module was already
                //  loaded (other user was logged in berfore)
                // this will create an endless loop if the user does not even have
                // rights to visit home (no velonaUser) Happens only if admin forgot
                // to set it
                this.router.navigate(['/401']);
                this.alertService.error(`No privileges were set for you in velona`);
              } else {
                // Test if this is a child route and we have another child route the user could go to
                if (route.parent?.routeConfig.children && route.parent?.routeConfig.children.length > 0) {
                  let firstRouteWithAccess = null;
                  route.parent?.routeConfig.children.forEach((childRoute: any) => {
                    let authorized = false;
                    if (childRoute.data?.accessPrivileges) {
                      _.each(childRoute.data.accessPrivileges, (privilege) => {
                        if (!authorized && currentUser.active_privileges) {
                          authorized = currentUser.active_privileges.indexOf(privilege) > -1;
                        }
                      });
                      if (!firstRouteWithAccess && authorized) {
                        firstRouteWithAccess = childRoute;
                      }
                    }
                  });
                  if (firstRouteWithAccess) {
                    this.router.navigateByUrl(state.url.split("/")[1] + "/" + firstRouteWithAccess.path)
                    return false;
                  }
                }

                // No rights, send to home
                this.alertService.error(`
                  You need one of "${route.data['accessPrivileges']}" rights to visit ${route.url}.`);
                this.router.navigate(['/', 'home']); // this will go to load guard
              }
              return false;
            } else {
              // logged in with correct rights
              return true;
            }
          }),
          catchError(
            // Invalid token --> logout
            (error) => {
              if (error === 'expired') {
                this.alertService.warn('Your login has expired. Please login again');
              }
              this.authenticationService.logout(
                () => {
                  // other http errors will be caught by the login component
                  this.router.navigate(['/', 'login']);
                }
              );
              return observableOf(false);
            }
      ),);
    } else {

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
