import { NgModule } from '@angular/core';

import { SharedModule } from '../../shared/shared.module';

import { ConfirmationComponent } from './confirmation.component';
import { ConfirmationDialog } from './confirmation-dialog.component';

@NgModule({
    imports: [
        SharedModule,
        ConfirmationDialog,
        ConfirmationComponent
    ],
    exports: [
        ConfirmationComponent
    ]
})
export class ConfirmationModule { }
