import { RouterModule, Routes } from '@angular/router';

import { ToolsComponent } from './tools.component';

const routes: Routes = [
  {
    path: '',
    component: ToolsComponent,
    children: [
      { path: '', redirectTo: 'transmlst', pathMatch: 'full' }
    ]
  }
];

export const routing = RouterModule.forChild(routes);
