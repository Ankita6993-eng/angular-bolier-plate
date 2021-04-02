import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ModalModule } from 'ngx-bootstrap/modal';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { ManagementsRoutingModule } from './managements-routing.module';
import{MangementComponent} from './../mangement.component'
import { NgxUiLoaderModule } from  'ngx-ui-loader';
import { PaginationModule } from 'ngx-bootstrap/pagination';
import { from } from 'rxjs';


@NgModule({
  declarations: [MangementComponent],
  imports: [
    CommonModule,
    ManagementsRoutingModule,
    ModalModule,
    CommonModule,
    FormsModule,
    ReactiveFormsModule,
    NgxUiLoaderModule,
    PaginationModule.forRoot()
  ]
})
export class ManagementsModule { }
