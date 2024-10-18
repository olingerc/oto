import { NgModule } from '@angular/core';

import { SharedModule } from '../shared/shared.module';

import { HomeComponent } from './home.component';

// routing
import { routing } from './home.routing';

@NgModule({
    imports: [
        routing,
        SharedModule,
        HomeComponent
    ]
})
export class HomeModule { }
