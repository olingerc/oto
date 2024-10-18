import { NgModule } from '@angular/core';

import { SharedModule } from '../shared/shared.module';

import { CamsComponent } from './cams.component';

// routing
import { routing } from './cams.routing';

@NgModule({
    imports: [
        routing,
        SharedModule,
        CamsComponent
    ]
})
export class CamsModule { }
