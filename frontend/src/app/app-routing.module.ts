import { RouterModule, Routes } from '@angular/router';

import { Page404Component } from './page404.component';
import { Page401Component } from './page401.component';
import { AuthLoadGuard } from './core/authentication/authLoad.guard';
import { AuthActivateGuard } from './core/authentication/authActivate.guard';

const routes: Routes = [
    { path: '', redirectTo: 'home', pathMatch: 'full' },
    {
      path: 'home',
      loadChildren: () => import('./home/home.module').then(m => m.HomeModule),
      canLoad: [ AuthLoadGuard ],
      canActivate: [ AuthActivateGuard ],
      data: { accessLevel: 'privileged', accessPrivileges: ["otoUser"] }
    },
    {
      path: 'login',
      loadChildren: () => import('./login/login.module').then(m => m.LoginModule),
      canLoad: [ AuthLoadGuard ],
      canActivate: [ AuthActivateGuard ],
      data: { accessLevel: 'anon', accessPrivileges: ["otoUser"] }
    },
    {
      path: 'printer',
      loadChildren: () => import('./printer/printer.module').then(m => m.PrinterModule),
      canLoad: [ AuthLoadGuard ],
      canActivate: [ AuthActivateGuard ],
      data: { accessLevel: 'anon', accessPrivileges: ["printerUser"] }
    },
    {
      path: 'admin',
      loadChildren: () => import('./admin/admin.module').then(m => m.AdminModule),
      canLoad: [ AuthLoadGuard ],
      canActivate: [ AuthActivateGuard ],
      data: { accessLevel: 'privileged', accessPrivileges: ["otoAdmin"] }
    },
    {
      path: 'cams',
      loadChildren: () => import('./cams/cams.module').then(m => m.CamsModule),
      canLoad: [ AuthLoadGuard ],
      canActivate: [ AuthActivateGuard ],
      data: { accessLevel: 'privileged', accessPrivileges: ["camsUser"] }
    },

    { path: '404', component: Page404Component },
    { path: '401', component: Page401Component },
    { path: '**', redirectTo: '/404' }

];

export const AppRoutingModule = RouterModule.forRoot(routes);
