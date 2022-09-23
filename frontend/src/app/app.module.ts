import { NgModule, LOCALE_ID } from '@angular/core';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { BrowserModule } from '@angular/platform-browser';
import { registerLocaleData } from '@angular/common';
import localeFr from '@angular/common/locales/fr';
registerLocaleData(localeFr);

import { AppRoutingModule } from './app-routing.module';
import { AppComponent } from './app.component';

// root app.html components
import { ConfirmationModule } from './core/confirmation/confirmation.module';
import { ToastModule } from 'primeng/toast';

// feature modules
import { CoreModule } from './core/core.module';
import { BioinfCoreModule } from './bioinf-core/bioinf-core.module';
import { LayoutModule } from './layout/layout.module';
import { SharedModule } from './shared/shared.module';

@NgModule({
  declarations: [
    AppComponent
  ],
  imports: [
    BrowserModule,
    BrowserAnimationsModule,
    AppRoutingModule,
    ConfirmationModule,
    ToastModule,
    CoreModule,
    BioinfCoreModule,
    LayoutModule,
    SharedModule
  ],
  providers: [{ provide: LOCALE_ID, useValue: 'fr-FR'}],
  bootstrap: [AppComponent]
})
export class AppModule { }
