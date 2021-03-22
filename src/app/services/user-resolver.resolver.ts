import { Injectable } from '@angular/core';
import {
  Router, Resolve,
  RouterStateSnapshot,
  ActivatedRouteSnapshot
} from '@angular/router';
import { from, Observable, of } from 'rxjs';
import {EmployeesService} from './employees.service'

@Injectable({
  providedIn: 'root'
})
export class UserResolverResolver implements Resolve<any> {
  
  constructor(private employeeservice:EmployeesService){}
  
  resolve(route: ActivatedRouteSnapshot, state: RouterStateSnapshot): Observable<any> {
    let role = route.data.title;
    return this.employeeservice.getUser({role});
  }
}
