import { NgModule } from '@angular/core';

import { SharedModule } from '../shared/shared.module';

import { PrinterComponent } from './printer.component';

// routing
import { routing } from './printer.routing';

@NgModule({
    imports: [
        routing,
        SharedModule,
        PrinterComponent
    ]
})
export class PrinterModule { }
