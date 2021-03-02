import { Component, OnDestroy, ViewChild } from '@angular/core';
import { takeUntil } from 'rxjs/operators'
import { BehaviorSubject, ReplaySubject } from 'rxjs';
import { EmployeesService, ResponseData } from '../../../services/employees.service';
import { ModalDirective } from 'ngx-bootstrap/modal';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { ToastrService } from 'ngx-toastr';
import { AsyncPipe } from '@angular/common';

@Component({
  templateUrl: 'employee-list.component.html',
  styleUrls: ['./employee-list.component.scss'],
  providers: [AsyncPipe]
})

export class EmployeeListComponent implements OnDestroy {
  @ViewChild('employeeModal') public employeeModal: ModalDirective;
  @ViewChild('confirmationModal') public confirmationModal: ModalDirective;
  selectedCountryId: string = null;
  addEmployeeForm: FormGroup;
  loading: boolean = false;
  isEdit: boolean = false;
  destroyed$: ReplaySubject<boolean> = new ReplaySubject(1);
  employees$ = new BehaviorSubject<any[]>([]);

  constructor(
    private EmployeesService: EmployeesService,
    private formBuilder: FormBuilder,
    private toasterService: ToastrService,
    private asyncPipe: AsyncPipe
  ) {
    this.getemployeesList();
    this.addEmployeeForm = this.formBuilder.group({
      'name': ['', [Validators.required]],
      'alias': ['', [Validators.required]]
    });
  }

  ngOnDestroy(): void {
    this.destroyed$.next(true);
    this.destroyed$.complete();
  }

  onSubmit() {
    if(this.addEmployeeForm.invalid){
      return;
    }
    this.isEdit ? this.updateCountry() :this.addCountry();
  }

  addCountry() {
    this.EmployeesService.addEmployee(this.addEmployeeForm.value).pipe(
      takeUntil(this.destroyed$)
    ).subscribe((result: ResponseData) => {
      const { statusCode, message, data } = result;
      if (statusCode === 200) {
        this.employees$.next([...this.employees$.value, data])
        this.closeEmployeeModal()
        this.addEmployeeForm.reset();
        this.toasterService.success(message)
      } else {
        this.toasterService.error(message)
      }
    });
  }

  updateCountry() {
    this.EmployeesService.updateEmployee(this.addEmployeeForm.value, this.selectedCountryId).pipe(
      takeUntil(this.destroyed$)
    ).subscribe((result: ResponseData) => {
      const { statusCode, message, data } = result;
      if (statusCode === 200) {
        let employeesClone = this.asyncPipe.transform(this.employees$);
        const updatedCountry = employeesClone.find(country => country._id === data._id);
        const index = employeesClone.indexOf(updatedCountry);
        if (index > -1) {
          employeesClone[index] = data;
          this.employees$.next(employeesClone)
        }
        this.closeEmployeeModal();
        this.addEmployeeForm.reset();
        this.toasterService.success(message)
      } else {
        this.toasterService.error(message)
      }
    });
  }

  getemployeesList() {
    const data = {
      role: 'Management'
    };
    try {
      this.EmployeesService.getEmployees(data).pipe(
        takeUntil(this.destroyed$)
      ).subscribe((result: any) => {
        this.loading = false;
        const { statusCode, data, message } = result;
        if(statusCode === 200) {
          this.employees$.next(data);
        } else {
          this.toasterService.error(message)
        }
      });
    } catch (err) {
      console.log('err', err);
    }
  }

  openConfirmationModal(id: string) {
    this.confirmationModal.show();
    this.selectedCountryId = id;
  }

  openUpdateCountryForm(country: any) {
    this.addEmployeeForm.patchValue({
      name: country.name,
      alias: country.alias
    })
    this.employeeModal.show();
    this.selectedCountryId = country._id;
    this.isEdit = true;
  }

  deleteCountry() {
    try {
      this.EmployeesService.deleteEmployee(this.selectedCountryId).pipe(
        takeUntil(this.destroyed$)
      ).subscribe((result: ResponseData) => {
        this.loading = false;
        const { statusCode, message } = result;
        if (statusCode === 200) {
          let employeesClone = this.asyncPipe.transform(this.employees$);
          const deletedCountry = employeesClone.find(country => country._id === this.selectedCountryId);
          const index = employeesClone.indexOf(deletedCountry);
          if(index>-1){
            employeesClone.splice(index, 1);
            this.employees$.next(employeesClone)
          }
          this.closeConfirmationModal();
          this.toasterService.success(message)
        } else {

        }
      });
    } catch (err) {
      console.log('err', err);
    }
  }

  closeEmployeeModal() {
    this.employeeModal.hide();
    if (this.selectedCountryId) this.selectedCountryId = null;
  }

  closeConfirmationModal() {
    this.confirmationModal.hide();
    this.selectedCountryId = null;
  }

}
