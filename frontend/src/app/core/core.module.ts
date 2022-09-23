/**
 * Read for details:
 * https://angular.io/docs/ts/latest/guide/ngmodule.html#!#feature-modules
 * The aim is to keep the app.module clean.
 * Core contains singletons
 */

import { NgModule, Optional, SkipSelf } from '@angular/core';
import { CommonModule } from '@angular/common';

// used to create fake backends
// import { fakeAuthBackendProvider } from '../helpers/fake-auth-backend';
// import { MockBackend } from '@angular/http/testing';
// import { BaseRequestOptions, HttpModule } from '@angular/http';

// for real backend
import { HttpClientModule } from '@angular/common/http';

// Single use components
import { Page404Component } from '../page404.component';
import { Page401Component } from '../page401.component';



// Singletons
import { EnvServiceProvider } from './env/env.service.provider';
import { MessageService } from 'primeng/api';
import { AuthLoadGuard } from './authentication/authLoad.guard';
import { AuthActivateGuard } from './authentication/authActivate.guard';
import { AuthenticationService } from './authentication/authentication.service';
import { UserService } from './user/user.service';
import { AlertService } from './alert/alert.service';
import { UtilitiesService } from './utilities.service';
import { VelonaSocketService } from './websocket/velona-socket.service';
import { UploadService } from './upload.service';
import { HttpHandler } from './http-handler';
import { ConfirmationService } from './confirmation/confirmation.service';

@NgModule({
  imports: [
    CommonModule,
    HttpClientModule
  ],
  declarations: [ Page404Component, Page401Component ],
  exports: [],
  providers: [
    EnvServiceProvider,
    MessageService
    /*AuthLoadGuard,
    AuthActivateGuard,

    AlertService,
    AuthenticationService,
    UserService,
    UtilitiesService,
    VelonaSocketService,
    UploadService,
    HttpHandler,
    ConfirmationService*/

    // providers used to create fake backend
    // fakeAuthBackendProvider,
    // MockBackend,
    // BaseRequestOptions
  ]
})
export class CoreModule {

  // Prevent reimporting by accident in a feature module
  constructor (@Optional() @SkipSelf() parentModule: CoreModule) {
    if (parentModule) {
      throw new Error(
        'CoreModule is already loaded. Import it in the AppModule only'
      );
    }
  }
}
