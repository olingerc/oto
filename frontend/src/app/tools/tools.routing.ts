import { RouterModule, Routes } from '@angular/router';

import { ToolsComponent } from './tools.component';
import { TransmlstComponent } from './transmlst/transmlst.component';

const routes: Routes = [
  {
    path: '',
    component: ToolsComponent,
    children: [
      { path: '', redirectTo: 'transmlst', pathMatch: 'full' },
      {
        path: 'transmlst',
        component: TransmlstComponent,
        data: {
          breadCrumbs: [{ title: 'Tools' }]
        }
      }
    ]
  }
];

export const routing = RouterModule.forChild(routes);
