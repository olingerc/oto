import { NgModule } from '@angular/core';
import { ReactiveFormsModule } from '@angular/forms';

import { TableModule } from 'primeng/table';

import { SharedModule } from '../shared/shared.module';
import { AdminComponent } from './admin.component';
import { UsersComponent } from './users/users.component';
import { AdminHttpService } from './admin-http.service';
import { ScheduledjobsComponent } from './scheduledjobs/scheduledjobs.component';
import { WorkersDashboardComponent } from "./workers/workers-dashboard.component";
import { FailedjobsDashboardComponent } from "./failedjobs/failedjobs-dashboard.component";

import { UserDialogComponent } from './users/user-dialog.component';
import { JobdetailsDialog } from './scheduledjobs/jobdetails-dialog.component';

// routing
import { routing } from './admin.routing';

@NgModule({
    imports: [
        ReactiveFormsModule,
        routing,
        SharedModule,
        TableModule,
        AdminComponent,
        UsersComponent,
        UserDialogComponent,
        ScheduledjobsComponent,
        WorkersDashboardComponent,
        FailedjobsDashboardComponent,
        JobdetailsDialog
    ],
    providers: [
        AdminHttpService
    ]
})
export class AdminModule { }
