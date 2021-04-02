import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import{MangementComponent} from './../mangement.component'
import { UserResolverResolver } from "../../../services/user-resolver.resolver"
const routes: Routes = [
  {
    path: '',
    component: MangementComponent,

    resolve:{
      list:UserResolverResolver
    },
    data: {
      title: 'Management'
    }
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class ManagementsRoutingModule { }
