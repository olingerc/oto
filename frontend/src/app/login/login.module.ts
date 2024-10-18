import { NgModule } from '@angular/core';
import { ReactiveFormsModule } from '@angular/forms';

import { SharedModule } from '../shared/shared.module';

import { LoginComponent } from './login.component';

// routing
import { routing } from './login.routing';

@NgModule({
    imports: [
        ReactiveFormsModule,
        routing,
        SharedModule,
        LoginComponent
    ]
})
export class LoginModule { }
