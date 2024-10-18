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
import { provideHttpClient, withInterceptorsFromDi } from '@angular/common/http';

// Single use components
import { Page404Component } from '../page404.component';
import { Page401Component } from '../page401.component';

// Singletons
import { EnvServiceProvider } from './env/env.service.provider';
import { MessageService } from 'primeng/api';
import { BioinfHttpService } from './bioinf-http.service';

@NgModule({
    imports: [
        CommonModule,
        Page404Component, Page401Component
    ],
    exports: [],
    providers: [
        EnvServiceProvider,
        MessageService,
        provideHttpClient(withInterceptorsFromDi()),
        BioinfHttpService
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
