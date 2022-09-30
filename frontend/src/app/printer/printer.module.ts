import { NgModule } from '@angular/core';

import { SharedModule } from '../shared/shared.module';

import { PrinterComponent } from './printer.component';

// routing
import { routing } from './printer.routing';

@NgModule({
  imports: [
    routing,
    SharedModule
  ],
  declarations: [
    PrinterComponent
  ]
})
export class PrinterModule { }
