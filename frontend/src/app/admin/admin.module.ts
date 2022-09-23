import { NgModule } from '@angular/core';
import { ReactiveFormsModule } from '@angular/forms';

import { TableModule } from 'primeng/table';

import { SharedModule } from '../shared/shared.module';
import { BioinfCoreModule } from '../bioinf-core/bioinf-core.module';

import { AdminComponent } from './admin.component';
import { UsersComponent } from './users/users.component';
import { GroupsComponent } from './groups/groups.component';
import { AdminHttpService } from './admin-http.service';
import { ScheduledjobsComponent } from './scheduledjobs/scheduledjobs.component';
import { WorkersDashboardComponent } from "./workers/workers-dashboard.component";
import { FailedjobsDashboardComponent } from "./failedjobs/failedjobs-dashboard.component";
import { QueuesDashboardComponent } from "./queues/queues-dashboard.component";
import { InfrastructureDashboardComponent } from "./infrastructure/infrastructure-dashboard.component";
import { DangerZoneComponent } from "./danger-zone/danger-zone.component";

import { UserDialogComponent } from './users/user-dialog.component';
import { GroupDialogComponent } from './groups/group-dialog.component';
import { JobdetailsDialog } from './scheduledjobs/jobdetails-dialog.component';

// routing
import { routing } from './admin.routing';

@NgModule({
  imports: [
    ReactiveFormsModule,
    routing,
    SharedModule,
    TableModule,
    BioinfCoreModule,
  ],
  declarations: [
    AdminComponent,
    UsersComponent,
    GroupsComponent,
    GroupDialogComponent,
    UserDialogComponent,
    ScheduledjobsComponent,
    WorkersDashboardComponent,
    FailedjobsDashboardComponent,
    JobdetailsDialog,
    QueuesDashboardComponent,
    DangerZoneComponent,
    InfrastructureDashboardComponent
  ],
  providers: [
    AdminHttpService
  ]
})
export class AdminModule { }
