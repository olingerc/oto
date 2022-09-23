import { RouterModule, Routes } from '@angular/router';

import { AdminComponent } from './admin.component';
import { UsersComponent } from './users/users.component';
import { ScheduledjobsComponent } from './scheduledjobs/scheduledjobs.component';
import { WorkersDashboardComponent } from "./workers/workers-dashboard.component";
import { FailedjobsDashboardComponent } from "./failedjobs/failedjobs-dashboard.component";
import { DangerZoneComponent } from "./danger-zone/danger-zone.component";
import { InfrastructureDashboardComponent } from "./infrastructure/infrastructure-dashboard.component";


const routes: Routes = [
  {
    path: '',
    data: {breadCrumbs: [{ title: "Dashboard" }]},
    component: AdminComponent,
    children: [
      { path: '', redirectTo: 'infrastructure', pathMatch: 'full' },
      {
        path: 'users',
        component: UsersComponent,
        data: {}
      },
      {
        path: 'scheduledjobs',
        component: ScheduledjobsComponent,
        data: {}
      },
      {
        path: 'failedjobs',
        component: FailedjobsDashboardComponent,
        data: {}
      },
      {
        path: 'workers',
        component: WorkersDashboardComponent,
        data: {}
      },
      {
        path: 'dangerzone',
        component: DangerZoneComponent,
        data: {}
      },
      {
        path: 'infrastructure',
        component: InfrastructureDashboardComponent,
        data: {}
      }
    ]
  }
];

export const routing = RouterModule.forChild(routes);
