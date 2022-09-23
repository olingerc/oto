
import {filter} from 'rxjs/operators';
import { Component, OnInit, OnDestroy, ViewEncapsulation } from '@angular/core';
import { Router, NavigationEnd, ActivatedRouteSnapshot } from '@angular/router';
import { MatDialog } from '@angular/material/dialog';


import { User } from '../../core/user.model';

import { AuthenticationService } from '../../core/authentication/authentication.service';
import { UserService } from '../../core/user/user.service';
import { AlertService } from '../../core/alert/alert.service';

import { NavbarEditUserDialog } from './navbar-edituser-dialog.component';
import { NavbarSetPasswordDialog } from './navbar-setpassword-dialog.component';
import { NavbarChangePasswordDialog } from './navbar-changepassword-dialog.component';

import * as _ from 'lodash';

@Component({
  selector: 'app-navbar',
  templateUrl: './navbar.component.html',
  styleUrls: ['./navbar.component.scss']
})
export class NavbarComponent implements OnInit, OnDestroy {

  public currentUser: User;
  private subscribeRouteChange: any;
  public breadCrumbs: any;
  public isDebug = false;
  public secondaryToolbar: boolean;

  public visible: boolean;
  public onHome: boolean;

  constructor(
    public dialog: MatDialog,
    public router: Router,
    private authenticationService: AuthenticationService,
    private userService: UserService,
    private alertService: AlertService
  ) {
    // Get current user from local storage
    this.currentUser = JSON.parse(localStorage.getItem('currentUser'));

    // subscribe to authentication status updates to set and remove the current user on login and logout
    this.authenticationService.getCurrentUserChange().subscribe(currentUser => this.currentUser = currentUser);
  }

  ngOnInit() {
    // update breadCrumbs on route change
    this.subscribeRouteChange = this.router.events.pipe(
      filter(event => event instanceof NavigationEnd))
      .subscribe((event) => {
        this.visible = true;
        this.onHome = false;
        if (this.router.url === '/login') {
          this.visible = false;
        } else if (this.router.url === '/home') {
          this.onHome = true;
        }
        this.breadCrumbs = this.getDeepestBreadCrumbs(this.router.routerState.snapshot.root);
        this.secondaryToolbar = this.getDeepestToolbar(this.router.routerState.snapshot.root);
      });
  }

  private getDeepestBreadCrumbs(routeSnapshot: ActivatedRouteSnapshot) {
    let bc = routeSnapshot.data ? routeSnapshot.data['breadCrumbs'] : '';
    if (routeSnapshot.firstChild) {
      bc = this.getDeepestBreadCrumbs(routeSnapshot.firstChild) || bc;
    }
    return bc;
  }

  private getDeepestToolbar(routeSnapshot: ActivatedRouteSnapshot) {
    let hasToolbar = routeSnapshot.data ? routeSnapshot.data['hasToolbar'] : false;
    if (routeSnapshot.firstChild) {
      hasToolbar = this.getDeepestToolbar(routeSnapshot.firstChild) || hasToolbar;
    }
    return hasToolbar;
  }

  ngOnDestroy() {
    this.subscribeRouteChange.unsubscribe();
  }

  logout() {
    this.authenticationService.logout(
      () => {
        this.router.navigate(['/login']);
      }
    );
  }

  openEditUserDialog() {
    let newUser = new User();
    _.extend(newUser, this.currentUser);

    let dialogRef = this.dialog.open(NavbarEditUserDialog, {
      width: '500px',
      data: { user: newUser }
    });

    dialogRef.beforeClosed().subscribe(updatedUser => {
      if (!updatedUser) {
        return;
      }
      _.extend(this.currentUser, updatedUser);
      this.authenticationService.setCurrentUser(this.currentUser);
    });
  }

  openSetPasswordDialog() {
    let dialogRef = this.dialog.open(NavbarSetPasswordDialog, {
      width: '300px',
      data: {userId: this.currentUser.id}
    });

    dialogRef.beforeClosed().subscribe(success => {
      if (!success) {
        return;
      }
      this.currentUser.defaultPasswordChanged = true;
      this.authenticationService.setCurrentUser(this.currentUser);
      this.alertService.info('Password has been set.');
    });
  }

  openChangePasswordDialog() {
    let dialogRef = this.dialog.open(NavbarChangePasswordDialog, {
      width: '300px',
      data: {userId: this.currentUser.id}
    });

    dialogRef.beforeClosed().subscribe(success => {
      if (!success) {
        return;
      }
      this.alertService.info('Password has been changed.');
    });
  }

  changeActiveRole(role: any = null) {
    this.userService.changeActiveRole(this.currentUser, role)
      .subscribe(
        (user) => {
          this.currentUser.activeRole = user.activeRole;
          this.currentUser.activePrivileges = user.activePrivileges;
          this.authenticationService.setCurrentUser(this.currentUser);
        },
        error => {
          this.alertService.error(error);
          console.log(error);
        }
      );
  }

  toggleDebug() {
    this.authenticationService.debugMode = !this.isDebug;
  }
}
