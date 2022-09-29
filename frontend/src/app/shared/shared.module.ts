/**
 * Read for details:
 * https://angular.io/docs/ts/latest/guide/ngmodule.html#!#feature-modules
 *
 * Use for commonly used components, directives and pipes (NOT services)
 */

import { NgModule } from "@angular/core";
import { CommonModule } from "@angular/common";
import { FormsModule } from "@angular/forms";
import { RouterModule } from "@angular/router";

// Material
import { MatButtonModule } from "@angular/material/button";
import { MatMenuModule } from "@angular/material/menu";
import { MatChipsModule } from "@angular/material/chips";
import { MatToolbarModule } from "@angular/material/toolbar";
import { MatSidenavModule } from "@angular/material/sidenav";
import { MatCardModule } from "@angular/material/card";
import { MatInputModule } from "@angular/material/input";
import { MatDialogModule } from "@angular/material/dialog";
import { MatTableModule } from "@angular/material/table";
import { MatTooltipModule } from "@angular/material/tooltip";
import { MatIconModule } from "@angular/material/icon";
import { MatProgressSpinnerModule } from "@angular/material/progress-spinner";
import { MatSelectModule } from "@angular/material/select";
import { MatSlideToggleModule } from "@angular/material/slide-toggle";
import { MatListModule } from "@angular/material/list";
import { MatDatepickerModule } from "@angular/material/datepicker";
import { MatNativeDateModule } from "@angular/material/core";
import { MatButtonToggleModule } from "@angular/material/button-toggle";
import { MatTabsModule } from "@angular/material/tabs";
import { MatRadioModule } from "@angular/material/radio";
import { MatProgressBarModule } from "@angular/material/progress-bar";
import { MatCheckboxModule } from "@angular/material/checkbox";
import { MatBadgeModule } from "@angular/material/badge";

import { FlexLayoutModule } from "@angular/flex-layout";

import { VisibleForPrivilegeDirective } from "./directives/visible-for-privilege.directive";
import { VisibleForPrivilegesDirective } from "./directives/visible-for-privileges.directive";
import { NotVisibleForPrivilegesDirective } from "./directives/not-visible-for-privileges.directive";
import { AutofocusDirective } from "./directives/focus.directive";

import { MyCollectionFilterPipe } from "./pipes/collection-filter.pipe";
import { MyArrayFilterPipe } from "./pipes/array-filter.pipe";
import { MyArrayFilterByKeyPipe } from "./pipes/array-filter-by-key.pipe";
import { MyTruncatePipe } from "./pipes/truncate.pipe";
import { ReversePipe } from "./pipes/reverse.pipe";
import { MyExplorerItemsFilterPipe } from "./pipes/explorer-items-filter.pipe";

@NgModule({
  imports: [
    CommonModule,
    RouterModule,

    MatButtonModule,
    MatMenuModule,
    MatToolbarModule,
    MatIconModule,
    MatCardModule,
    MatChipsModule,
    MatCheckboxModule,
    MatSidenavModule,
    MatInputModule,
    MatDialogModule,
    MatTableModule,
    MatTooltipModule,
    MatProgressSpinnerModule,
    MatSelectModule,
    MatSlideToggleModule,
    MatListModule,
    MatDatepickerModule,
    MatNativeDateModule,
    MatButtonToggleModule,
    MatTabsModule,
    MatRadioModule,
    MatProgressBarModule,
    MatBadgeModule,

    FlexLayoutModule
  ],
  providers: [],
  declarations: [
    VisibleForPrivilegeDirective,
    VisibleForPrivilegesDirective,
    NotVisibleForPrivilegesDirective,
    AutofocusDirective,
    MyCollectionFilterPipe,
    MyArrayFilterPipe,
    MyArrayFilterByKeyPipe,
    MyTruncatePipe,
    MyExplorerItemsFilterPipe,
    ReversePipe
  ],

  // All exports here will be available to other modules if they import SharedModule
  // Even if SharedModule does not use them. No need to put them into imports here.
  // Module: https://angular.io/docs/ts/latest/guide/ngmodule.html#!#feature-modules
  exports: [
    // Shared re-exports
    CommonModule,
    FormsModule,
    RouterModule,

    // Material
    MatButtonModule,
    MatMenuModule,
    MatToolbarModule,
    MatIconModule,
    MatCardModule,
    MatChipsModule,
    MatCheckboxModule,
    MatSidenavModule,
    MatInputModule,
    MatDialogModule,
    MatTableModule,
    MatTooltipModule,
    MatProgressSpinnerModule,
    MatSelectModule,
    MatSlideToggleModule,
    MatListModule,
    MatDatepickerModule,
    MatNativeDateModule,
    MatButtonToggleModule,
    MatTabsModule,
    MatRadioModule,
    MatProgressBarModule,
    MatBadgeModule,

    FlexLayoutModule,

    // Shared directives, components, ...
    VisibleForPrivilegeDirective,
    VisibleForPrivilegesDirective,
    NotVisibleForPrivilegesDirective,
    AutofocusDirective,
    MyCollectionFilterPipe,
    MyArrayFilterPipe,
    MyArrayFilterByKeyPipe,
    MyTruncatePipe,
    MyExplorerItemsFilterPipe,
    ReversePipe
  ]
})
export class SharedModule { }
