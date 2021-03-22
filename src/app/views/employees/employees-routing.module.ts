import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { from } from 'rxjs';
import { EmployeeListComponent } from './employee-list/employee-list.component';
import {AddEmployeeComponent} from './add-employee/add-employee.component'
import { UserResolverResolver } from '../../services/user-resolver.resolver';

const routes: Routes = [
  {
    path: '',
    component: EmployeeListComponent,
    resolve:{
      list:UserResolverResolver
    },
    data: {
      title: 'Employee'
    }
  },
    {
      path:'AddEmployee', component:AddEmployeeComponent
    }
  
]

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class EmployeesRoutingModule { }
