import { enableProdMode, LOCALE_ID, importProvidersFrom } from '@angular/core';

import { environment } from './environments/environment';
import { AppComponent } from './app/app.component';
import { MatListModule } from '@angular/material/list';
import { MatDividerModule } from '@angular/material/divider';
import { MatToolbarModule } from '@angular/material/toolbar';
import { MatSidenavModule } from '@angular/material/sidenav';
import { MatIconModule } from '@angular/material/icon';
import { MatMenuModule } from '@angular/material/menu';
import { MatChipsModule } from '@angular/material/chips';
import { CoreModule } from './app/core/core.module';
import { ToastModule } from 'primeng/toast';
import { AppRoutingModule } from './app/app-routing.module';
import { provideAnimations } from '@angular/platform-browser/animations';
import { MatDialogModule } from '@angular/material/dialog';
import { BrowserModule, bootstrapApplication } from '@angular/platform-browser';

if (environment.production) {
  enableProdMode();
}

bootstrapApplication(AppComponent, {
    providers: [
        importProvidersFrom(
          BrowserModule,
          AppRoutingModule,
          ToastModule,
          CoreModule,
          MatChipsModule,
          MatMenuModule,
          MatIconModule,
          MatSidenavModule,
          MatToolbarModule,
          MatDividerModule,
          MatListModule,
          MatDialogModule
        ),
        provideAnimations()
    ]
})
  .catch(err => console.error(err));
