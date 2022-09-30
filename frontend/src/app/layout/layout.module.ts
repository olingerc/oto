import { NgModule } from '@angular/core';
import { ReactiveFormsModule } from '@angular/forms';

import { SharedModule } from '../shared/shared.module';

import { NavbarEditUserDialog } from './navbar/navbar-edituser-dialog.component';
import { NavbarSetPasswordDialog } from './navbar/navbar-setpassword-dialog.component';
import { NavbarChangePasswordDialog } from './navbar/navbar-changepassword-dialog.component';

@NgModule({
  imports: [
    ReactiveFormsModule,
    SharedModule
  ],
  declarations: [
    NavbarEditUserDialog,
    NavbarSetPasswordDialog,
    NavbarChangePasswordDialog
  ],
  exports: [ ]
})
export class LayoutModule { }
