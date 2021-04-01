
import { Injectable } from '@angular/core';
import { EmployeesService } from './employees.service';
import {
  Resolve,
  ActivatedRouteSnapshot
} from '@angular/router';

@Injectable({
  providedIn: 'root'
})
export class EmployeeResolverResolver implements Resolve<any> {

  constructor(private empservice:EmployeesService){

  }
  resolve(route: ActivatedRouteSnapshot){
    let role = route.data.title;   
    return this.empservice.getEmployees({role});  
  }
}
