import { RouterModule, Routes } from '@angular/router';

import { CamsComponent } from './cams.component';

const routes: Routes = [
  {
    path: '',
    component: CamsComponent,
  }
];

export const routing = RouterModule.forChild(routes);
