
import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

// Import Containers
import { DefaultLayoutComponent } from './containers';
import { AuthGuard } from './guards/auth.guard';
import { UnAuthGuard } from './guards/un-auth.guard';

import { P404Component } from './views/error/404.component';
import { LoginComponent } from './views/login/login.component';
import { RegisterComponent } from './views/register/register.component';


export const routes: Routes = [
  {
    path: '',
    redirectTo: 'login',
    pathMatch: 'full',
  },
  {
    path: 'login',
    component: LoginComponent,
    canActivate: [UnAuthGuard],
    data: {
      title: 'Login Page'
    }
  },
  {
    path: 'register',
    component: RegisterComponent,
    canActivate: [UnAuthGuard],
    data: {
      title: 'Register Page'
    }
  },
  {
    path: '',
    component: DefaultLayoutComponent,
    data: {
      title: 'Home'
    },
    children: [
      {
        path: 'employees',
        canActivate: [AuthGuard],
        loadChildren: () => import('./views/employees/employees.module').then(m => m.CountriesModule)
      },
      {
        path: 'management',
        canActivate: [AuthGuard],
        loadChildren: () => import('./views/mangement/managements/managements.module').then(m=>m.ManagementsModule)
      },
    {
        path: 'trainees',
        canActivate: [AuthGuard],
        loadChildren: () => import('./views/trainees/trainees.module').then(m=>m.TraineesModule)
      },
      {
        path: 'projectManager',
        canActivate: [AuthGuard],
        loadChildren: () => import('./views/project-manager/project-manager.module').then(m=>m.ProjectManagerModule)
      }
    ]
  }, 
  {
    path: '404',
    component: P404Component,
    data: {
      title: 'Page 404'
    }
  },
  { path: '**', component: P404Component },
  
];

@NgModule({
  imports: [ RouterModule.forRoot(routes, { relativeLinkResolution: 'legacy'}) ],
  exports: [ RouterModule ]
})
export class AppRoutingModule {}
