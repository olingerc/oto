import { Component } from '@angular/core';
import { Router, 
// import as RouterEvent to avoid confusion with the DOM Event
Event as RouterEvent, NavigationStart, NavigationEnd, NavigationCancel, NavigationError, RouterOutlet, RouterLinkActive, RouterLink } from '@angular/router'

import { MatDialog } from '@angular/material/dialog';

import { Subscription } from "rxjs";
import _ from "lodash";

import { User } from './core/user.model';
import { UserService } from './core/user/user.service';
import { VelonaSocketService } from "./core/websocket/velona-socket.service";
import { AlertService } from "./core/alert/alert.service";
import { AuthenticationService } from './core/authentication/authentication.service';

import { NavbarEditUserDialog } from './layout/navbar/navbar-edituser-dialog.component';
import { NavbarSetPasswordDialog } from './layout/navbar/navbar-setpassword-dialog.component';
import { NavbarChangePasswordDialog } from './layout/navbar/navbar-changepassword-dialog.component';

import { MatIconModule } from '@angular/material/icon';
import { ConfirmationComponent } from './core/confirmation/confirmation.component';
import { ToastModule } from 'primeng/toast';
import { NgClass } from '@angular/common';
import { MatToolbarModule } from '@angular/material/toolbar';
import { MatChipsModule } from '@angular/material/chips';
import { MatMenuModule } from '@angular/material/menu';
import { MatDividerModule } from '@angular/material/divider';
import { VisibleForPrivilegesDirective } from './shared/directives/visible-for-privileges.directive';
import { MatListModule } from '@angular/material/list';
import { MatSidenavModule } from '@angular/material/sidenav';

@Component({
    selector: 'app-root',
    templateUrl: './app.component.html',
    styleUrls: ['./app.component.scss'],
    standalone: true,
    imports: [
    ToastModule,
    NgClass,
    MatIconModule,
    MatSidenavModule,
    MatListModule,
    RouterLinkActive,
    RouterLink,
    VisibleForPrivilegesDirective,
    MatDividerModule,
    MatMenuModule,
    MatChipsModule,
    MatToolbarModule,
    RouterOutlet,
    ConfirmationComponent
],
})
export class AppComponent {
  title = 'oto';

  private newTasksProgressMessageSubscription: Subscription;

  public currentUser: User;

  public loadingRoute: boolean = true;
  public tasksProgressMessages: any[] = [];
  public delayedHide = false;

  public visible: boolean;
  public onHome: boolean;

  constructor(
    private router: Router,
    private alertService: AlertService,
    private userService: UserService,
    private dialog: MatDialog,
    private socketService: VelonaSocketService,
    public authenticationService: AuthenticationService,
    ) {
    router.events.subscribe((event: RouterEvent) => {
      this.navigationInterceptor(event);
    });
  }

  ngOnInit() {
    // Get current user from local storage
    this.currentUser = JSON.parse(localStorage.getItem('currentUser'));

    // subscribe to authentication status updates to set and remove the current user on login and logout
    this.authenticationService.getCurrentUserChange().subscribe(currentUser => {
      this.currentUser = currentUser;
      if (currentUser) {
        this.socketService.connect("/taskssocket", currentUser);
        this.socketService.setupSystemSocketSubscriptions();
      };
    });

    if (this.currentUser) {
      this.socketService.connect("/taskssocket", this.currentUser);
      this.socketService.setupSystemSocketSubscriptions();
    };

    /*
    * Tasks progress messages
    */
    this.newTasksProgressMessageSubscription = this.socketService.newTasksProgressMessage()
      .subscribe(data => {

        /*
        message_type:
          copy (key=destiantion)
          move (key=destiantion)
          delete (key=pipelineid)
         message_content:
          start
          progress (with progress key)
          cancelled
          success
          error (with error key with text)
         */

        /*

        DELETE

        */
        if (data.message_type == "delete") {
          data.messageKey = data.pipelineid;

          if (data.message_content == "start" || data.message_content == "progress") {
            data.messageText = "Deleting " + data.pipelineid;
            this.delayedHide = true;
            let index = _.findIndex(this.tasksProgressMessages, {"messageKey": data.messageKey});
            if (index == -1) {
              this.tasksProgressMessages.push(data);
            } else {
              this.tasksProgressMessages[index].progress = data.progress;
            }
          }

          if (data.message_content == "success") {
            data.messageText = "Finished deleting " + data.pipelineid;
            this.delayedHide = true;
            let index = _.findIndex(this.tasksProgressMessages, {"messageKey": data.messageKey});
            if (index == -1) {
              this.tasksProgressMessages.push(data);
            } else {
              this.tasksProgressMessages[index].messageText =  data.messageText;
            }
            setTimeout(() => {
              this.tasksProgressMessages = _.reject(this.tasksProgressMessages, {"messageKey": data.messageKey});
              
              // Show empty box
              if (this.tasksProgressMessages.length == 0) {
                setTimeout(() => {
                  this.delayedHide = false;
                }, 2000)
              }
            }, 3000);
          }

          if (data.message_content == "error") {
            this.alertService.error(data.error);
            this.tasksProgressMessages = _.reject(this.tasksProgressMessages, {"messageKey": data.messageKey});

            // Show empty box
            if (this.tasksProgressMessages.length == 0) {
              setTimeout(() => {
                this.delayedHide = false;
              }, 2000);
            }
          }
        }


        /*

        COPY / MOVE 

        */

        if (data.message_type == "copy" || data.message_type == "move") {
          data.messageText = data.message_type == "copy" ? "Copying" : "Moving";
          data.messageKey = data.destination;


          if (data.message_content == "start" || data.message_content == "progress") {
            let index = _.findIndex(this.tasksProgressMessages, {"messageKey": data.messageKey});
            if (index == -1) {
              this.tasksProgressMessages.push(data);
            } else {
              this.tasksProgressMessages[index].progress = data.progress;
            }
            //this.bioinfStoreService.pipelinesBeingCopied[data.messageKey] = true;
            this.delayedHide = true;
          }
          
          if (data.message_content == "success") {
            this.tasksProgressMessages = _.reject(this.tasksProgressMessages, {"messageKey": data.messageKey});
            //this.bioinfStoreService.pipelinesBeingCopied[data.messageKey] = false;
            if (this.tasksProgressMessages.length == 0) {
              setTimeout(() => {
                this.delayedHide = false;
              }, 3000)
            }
          }
  
          if (data.message_content == "error") {
            this.alertService.error(data.error_message);
            this.tasksProgressMessages = _.reject(this.tasksProgressMessages, {"messageKey": data.messageKey});
            //this.bioinfStoreService.pipelinesBeingCopied[data.messageKey] = false;
          }
  
          if (data.message_content == "cancelled") {
            this.alertService.info("Cancelled");
            this.tasksProgressMessages = _.reject(this.tasksProgressMessages, {"messageKey": data.messageKey});
            //this.bioinfStoreService.pipelinesBeingCopied[data.messageKey] = false;
          }
        }

    });

  }

  ngOnDestroy() {
    this.socketService.disconnect();
    this.newTasksProgressMessageSubscription.unsubscribe();
  }

  // Shows and hides the loading spinner during
  // RouterEvent changes
  navigationInterceptor(event: RouterEvent): void {
    this.visible = true;
    this.onHome = false;
    if (this.router.url === '/login') {
      this.visible = false;
    } else if (this.router.url === '/home') {
      this.onHome = true;
    }

    if (event instanceof NavigationStart) {
      this.loadingRoute = true;
    }
    if (event instanceof NavigationEnd) {
      this.loadingRoute = false;
    }

    // Set loading state to false in both of the below events to hide the
    // spinner in case a request fails
    if (event instanceof NavigationCancel) {
      this.loadingRoute = false;
    }
    if (event instanceof NavigationError) {
      this.loadingRoute = false;
    }
  }

  /* Authentication */

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
      data: {userId: this.currentUser.username}
    });

    dialogRef.beforeClosed().subscribe(success => {
      if (!success) {
        return;
      }
      this.currentUser.default_password_changed = true;
      this.authenticationService.setCurrentUser(this.currentUser);
      this.alertService.info('Password has been set.');
    });
  }

  openChangePasswordDialog() {
    let dialogRef = this.dialog.open(NavbarChangePasswordDialog, {
      width: '300px',
      data: {userId: this.currentUser.username}
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
          this.currentUser.active_role = user.active_role;
          this.currentUser.active_privileges = user.active_privileges;
          this.authenticationService.setCurrentUser(this.currentUser);
        },
        error => {
          this.alertService.error(error);
          console.log(error);
        }
      );
  }

  logout() {
    this.authenticationService.logout(
      () => {
        this.router.navigate(['/login']);
      }
    );
  }

}
