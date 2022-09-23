import { NgModule } from '@angular/core';
import { ReactiveFormsModule } from '@angular/forms';

import { SharedModule } from '../shared/shared.module';

import { NavbarComponent } from './navbar/navbar.component';
import { NavbarEditUserDialog } from './navbar/navbar-edituser-dialog.component';
import { NavbarSetPasswordDialog } from './navbar/navbar-setpassword-dialog.component';
import { NavbarChangePasswordDialog } from './navbar/navbar-changepassword-dialog.component';

@NgModule({
  imports: [
    ReactiveFormsModule,
    SharedModule
  ],
  declarations: [
    NavbarComponent,
    NavbarEditUserDialog,
    NavbarSetPasswordDialog,
    NavbarChangePasswordDialog
  ],
  exports: [ NavbarComponent ]
})
export class LayoutModule { }
