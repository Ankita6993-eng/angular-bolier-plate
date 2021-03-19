// Angular
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { NgModule } from '@angular/core';

// Pagination Component
import { PaginationModule } from 'ngx-bootstrap/pagination';


// Components Routing
import { EmployeesRoutingModule } from './employees-routing.module';
import { EmployeeListComponent } from './employee-list/employee-list.component';
import { ModalModule } from 'ngx-bootstrap/modal';
import { AddEmployeeComponent } from './add-employee/add-employee.component';
import { NgxUiLoaderModule } from  'ngx-ui-loader';
@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    ReactiveFormsModule,
    EmployeesRoutingModule,
    PaginationModule.forRoot(),
    ModalModule,
    NgxUiLoaderModule
  ],
  declarations: [
    EmployeeListComponent,
    AddEmployeeComponent,
  ],
})

export class CountriesModule { }
