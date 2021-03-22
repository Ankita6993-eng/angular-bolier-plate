import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ProjectManagerListComponent } from './project-manager-list/project-manager-list/project-manager-list.component';
import { ProjectManagerRoutingModule } from './project-manager-routing.module';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { NgxUiLoaderModule } from "ngx-ui-loader";
// Pagination Component
import { PaginationModule } from 'ngx-bootstrap/pagination';
import { ModalModule } from 'ngx-bootstrap/modal';


@NgModule({
  declarations: [ProjectManagerListComponent],
  imports: [
    CommonModule,
    FormsModule,
    ReactiveFormsModule,
    ProjectManagerRoutingModule,
    PaginationModule.forRoot(),
    ModalModule,
    NgxUiLoaderModule
  ]
})
export class ProjectManagerModule { }
