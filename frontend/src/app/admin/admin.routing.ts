import { RouterModule, Routes } from '@angular/router';

import { AdminComponent } from './admin.component';
import { UsersComponent } from './users/users.component';
import { ScheduledjobsComponent } from './scheduledjobs/scheduledjobs.component';
import { WorkersDashboardComponent } from "./workers/workers-dashboard.component";
import { FailedjobsDashboardComponent } from "./failedjobs/failedjobs-dashboard.component";


const routes: Routes = [
  {
    path: '',
    component: AdminComponent,
    children: [
      { path: '', redirectTo: 'scheduledjobs', pathMatch: 'full' },
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
      }
    ]
  }
];

export const routing = RouterModule.forChild(routes);
