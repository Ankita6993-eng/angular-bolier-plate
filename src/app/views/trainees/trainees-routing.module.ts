import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { TraineeListComponent } from './trainee-list/trainee-list.component';
import { EmployeeResolverResolver } from '../../services/employee-resolver.resolver';

const routes: Routes = [
    {
      path: '',
      component: TraineeListComponent,
       resolve: {
         list: EmployeeResolverResolver
      },
      data: {
        title: 'Trainee'
      }
    }
  ];
  
  @NgModule({
    imports: [RouterModule.forChild(routes)],
    exports: [RouterModule]
  })
  export class TraineesRoutingModule { }
  