import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { TraineeListComponent } from './trainee-list/trainee-list.component';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { NgxUiLoaderModule } from "ngx-ui-loader";
// Pagination Component
import { PaginationModule } from 'ngx-bootstrap/pagination';


// Components Routing
import { TraineesRoutingModule } from './trainees-routing.module';
import { ModalModule } from 'ngx-bootstrap/modal';


@NgModule({
  declarations: [TraineeListComponent],
  imports: [
    CommonModule,
    FormsModule,
    ReactiveFormsModule,
    TraineesRoutingModule,
    PaginationModule.forRoot(),
    ModalModule,
    NgxUiLoaderModule
  ]
})
export class TraineesModule { }
