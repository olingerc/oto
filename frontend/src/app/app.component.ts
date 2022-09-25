import { Component, ViewEncapsulation, OnInit, OnDestroy } from '@angular/core';
import {
    Router,
    // import as RouterEvent to avoid confusion with the DOM Event
    Event as RouterEvent,
    NavigationStart,
    NavigationEnd,
    NavigationCancel,
    NavigationError
} from '@angular/router'

import { Subscription } from "rxjs";
import _ from "lodash";

import { VelonaSocketService } from "./core/websocket/velona-socket.service";
import { AlertService } from "./core/alert/alert.service";
import { User } from './core/user.model';
import { AuthenticationService } from './core/authentication/authentication.service';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss'],
  encapsulation: ViewEncapsulation.None
})
export class AppComponent {
  title = 'oto';

  private newTasksProgressMessageSubscription: Subscription;

  public loadingRoute: boolean = true;
  public tasksProgressMessages: any[] = [];
  public delayedHide = false;

  constructor(
    private router: Router,
    private alertService: AlertService,
    public authenticationService: AuthenticationService,
    private socketService: VelonaSocketService
    ) {
    router.events.subscribe((event: RouterEvent) => {
      this.navigationInterceptor(event);
    });
  }

  ngOnInit() {
    // Get current user from local storage
    let currentUser = JSON.parse(localStorage.getItem('currentUser'));
    if (currentUser) {
      this.socketService.connect("/taskssocket", currentUser);
      this.socketService.setupSystemSocketSubscriptions();
    };

    // subscribe to authentication status updates to set and remove the current user on login and logout
    this.authenticationService.getCurrentUserChange()
      .subscribe(currentUser => {
        if (currentUser) {
          this.socketService.connect("/taskssocket", currentUser);
          this.socketService.setupSystemSocketSubscriptions();
        };
      });

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

  logout() {
    this.authenticationService.logout(
      () => {
        this.router.navigate(['/login']);
      }
    );
  }

}
