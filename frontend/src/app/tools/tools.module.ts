import { NgModule } from '@angular/core';

import { SharedModule } from '../shared/shared.module';

import { ToolsComponent } from './tools.component';
import { TransmlstComponent } from './transmlst/transmlst.component';

// routing
import { routing } from './tools.routing';

@NgModule({
  imports: [
    routing,
    SharedModule
  ],
  declarations: [
    ToolsComponent,
    TransmlstComponent
  ]
})
export class ToolsModule { }
