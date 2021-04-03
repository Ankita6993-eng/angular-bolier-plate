import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { ProjectManagerListComponent } from './project-manager-list/project-manager-list/project-manager-list.component';
import { EmployeeResolverResolver } from '../../services/employee-resolver.resolver';
const routes: Routes = [
    {
      path: '',
      component: ProjectManagerListComponent,
       resolve: {
         list: EmployeeResolverResolver
      },
      data: {
        title: 'Project Manager'
      }
    }
  ];
  
  @NgModule({
    imports: [RouterModule.forChild(routes)],
    exports: [RouterModule]
  })
  export class ProjectManagerRoutingModule { }