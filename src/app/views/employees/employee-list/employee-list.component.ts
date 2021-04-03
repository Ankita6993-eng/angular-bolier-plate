import {
  Component,
  OnDestroy,
  OnInit,
  ViewChild,
  ChangeDetectorRef,
} from "@angular/core";
import { takeUntil } from "rxjs/operators";
import { BehaviorSubject, ReplaySubject } from "rxjs";
import {
  EmployeesService,
  ResponseData,
} from "../../../services/employees.service";
import { ModalDirective } from "ngx-bootstrap/modal";
import { FormBuilder, FormGroup, Validators } from "@angular/forms";
import { ToastrService } from "ngx-toastr";
import { AsyncPipe } from "@angular/common";
import { NgxUiLoaderService } from 'ngx-ui-loader';
import { ActivatedRoute } from "@angular/router";

@Component({
  templateUrl: "employee-list.component.html",
  styleUrls: ["./employee-list.component.scss"],
  providers: [AsyncPipe],
})
export class EmployeeListComponent implements OnInit, OnDestroy {
  @ViewChild("employeeModal") public employeeModal: ModalDirective;
  @ViewChild("confirmationModal") public confirmationModal: ModalDirective;

  selectedEmployeeId: string = null;
  addEmployeeForm: FormGroup;
  loading: boolean = false;
  isEdit: boolean = false;
  destroyed$: ReplaySubject<boolean> = new ReplaySubject(1);
  employees$ = new BehaviorSubject<any[]>([]);
  eml_pat =
    "^[a-zA-Z0-9.!#$%&'*+/=?^_`{|}~-]+@[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?(?:.[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?)*$";
  arr1: Array<any> = [];
  selectedIndex: number = null;
  currentpage: number = 1;

  existing_user: any;
  tot_pages: number;
  imageUrl: any = " ";
  imgfile: File = null;
  role: string;
  role_value: Array<any> = [];
  selected: any;
  submitted:boolean=false
 

  constructor(
    private EmployeesService: EmployeesService,
    private formBuilder: FormBuilder,
    private toasterService: ToastrService,
    private asyncPipe: AsyncPipe,
    private ngxService: NgxUiLoaderService,
    private cd: ChangeDetectorRef,
    private route: ActivatedRoute
  ) {
    this.role = this.route.snapshot.data.title;
    this.addEmployeeForm = this.formBuilder.group({
      first_name: ["", Validators.required],
      last_name: ["", Validators.required],
      email: [
        "",
        [
          Validators.required,
          Validators.email,
          Validators.pattern(this.eml_pat),
        ],
      ],
      status:[""],
      dob: ["", Validators.required],
      gender: ["", Validators.required],
      image: [""],
    });
  }

  ngOnInit(): void {
    this.ngxService.start()
    const list = this.route.snapshot.data.list;
    this.employees$.next(list.data);
    this.ngxService.stop()
    this.tot_pages = list.totalPages;
    for (let i = 0; i < this.tot_pages; i++) {
      if (i < 3) {
        this.arr1.push(i + 1);
      }
    }
  }

  ngOnDestroy(): void {
    this.destroyed$.next(true);
    this.destroyed$.complete();
  }

  //upload image
  uploadFile(event: any) {
    const file = event.target.files[0];
    this.imgfile = event.target.files[0];
    this.addEmployeeForm.get("image")?.updateValueAndValidity();
    const reader = new FileReader();
    reader.onload = () => {
      this.imageUrl = reader.result as string;
    };
    reader.readAsDataURL(file);
  }

  getEmployeesList(page: number) {
    const data = {
      role: this.role,
    };
    this.ngxService.start();
    try {
      this.EmployeesService.getUser(data, page)
        .pipe(takeUntil(this.destroyed$))
        .subscribe((result: any) => {
          this.loading = true;
          const { statusCode, data, message } = result;
         
          if (statusCode === 200) {
            this.employees$.next(data);
            this.ngxService.stop();
            this.toasterService.success(message);
          } else {
            this.toasterService.error("Recored successfully generated");
            this.ngxService.stop();
          }
        });
    } catch (err) {
      console.log("err", err);
      this.ngxService.stop();
    }
  }

  onSubmit() {
    this.submitted=true
    if (this.addEmployeeForm.invalid) {
      return;
    }
    this.isEdit ? this.updateEmployee() : this.addEmployee();
  }

  employee_model() {
    const emp_data = this.addEmployeeForm.value;
    const formData = new FormData();
    Object.keys(emp_data).forEach((key) => {
      if (key != "image") {
        formData.append(key, emp_data[key]);
      }
    });
    formData.append("role", this.role);
    if (this.imgfile) {
      formData.append("image", this.imgfile);
    }
    this.imgfile = null;
    return formData;
  }

  addEmployee() {
    let temp_data=this.addEmployeeForm.value    
    delete temp_data["status"]
    
    try{
    let data = this.employee_model();
    this.ngxService.start();
    let temp_emp = this.employees$.value;
    this.EmployeesService.addUser(data)
      .pipe(takeUntil(this.destroyed$))
      .subscribe((result: ResponseData) => {
        const { statusCode, message, data } = result;
        if (statusCode === 200) {
          temp_emp.unshift(data);
          this.toasterService.success("Recored successfully created");
          temp_emp.pop();
          this.ngxService.stop();
          this.closeEmployeeModal();
        } else {
          this.toasterService.error(message);
          this.ngxService.stop();
        }
      });
    }catch(err){
      console.log('err.message', err.message);
      this.ngxService.stop();
    }
  }

  openUpdaterecorde(employee: any) {
    try{
    var date = employee.dob;
    var date1 = new Date(date);

    this.addEmployeeForm.patchValue({
      first_name: employee.first_name,
      last_name: employee.last_name,
      email: employee.email,
      dob: date1.toLocaleDateString("en-CA"),
      status:employee.status,
      gender: employee.gender,
      role: this.role,
    });
    this.imageUrl = employee.profile_pic;
    this.selectedEmployeeId = employee._id;
    this.employeeModal.show();
    this.isEdit = true;
  }catch(err){
    console.log('err.message', err.message);
    
  }
  }

  
  updateEmployee() {
    try{
    let data = this.employee_model();
    this.ngxService.start();
    this.EmployeesService.updateUser(data, this.selectedEmployeeId)
      .pipe(takeUntil(this.destroyed$))
      .subscribe((result: ResponseData) => {
        const { statusCode, message, data } = result;
        if (statusCode === 200) {
          let employeesClone = this.asyncPipe.transform(this.employees$);
          
          const updatedEmployee = employeesClone.find(
            (employee) => employee._id === data._id
          );
          const index = employeesClone.indexOf(updatedEmployee);

          if (index > -1) {
            employeesClone[index] = data;
            this.employees$.next(employeesClone);
          }
          this.closeEmployeeModal();
          this.ngxService.stop();
          this.addEmployeeForm.reset();
          this.toasterService.success("Recored Sucessfully updated");
        } else {
          this.toasterService.error(message);
          this.ngxService.stop();
        }
      });
    }catch(err){
      console.log('err.message', err.message);
      this.ngxService.stop();
    }
  }

  openConfirmationModal(id: string) {
    this.confirmationModal.show();
    this.selectedEmployeeId = id;
  }

  deleteEmployee() {
    try {
      this.EmployeesService.deleteUser(this.selectedEmployeeId)
        .pipe(takeUntil(this.destroyed$))
        .subscribe((result: ResponseData) => {
          this.loading = false;
          const { statusCode, message } = result;
          if (statusCode === 200) {
            let employeesClone = this.asyncPipe.transform(this.employees$);
            const deletedEmployee = employeesClone.find(
              (employee) => employee._id === this.selectedEmployeeId
            );
            const index = employeesClone.indexOf(deletedEmployee);
            if (index > -1) {
              employeesClone.splice(index, 1);
              this.employees$.next(employeesClone);
            }
            this.closeConfirmationModal();
            this.toasterService.success("Recored successfully deleted");
          } else {
          }
        });
    } catch (err) {
      console.log("err", err);
    }
  }

  clickPage(pagenationType: string, page?: number) {
    switch (pagenationType) {
     
      case "prev": {
        this.currentpage = this.currentpage - 1;
       
        try {
          this.getEmployeesList(this.currentpage);
         
          if (this.arr1[0] != 1) {
            let first_ele = this.arr1[0];
            this.arr1.unshift(first_ele - 1);
            this.arr1.pop();
           
          }
        } catch (err) {
          console.log("err", err);
        }
        break;
      }
      case "current": {
        this.currentpage = page;
        try {
          this.getEmployeesList(page);
        } catch (err) {
          console.log("err", err);
        }
        break;
      }

      case "next": {
        this.currentpage = this.currentpage + 1;
      
        try {
          this.getEmployeesList(this.currentpage);
          if (this.arr1[2] != this.tot_pages) {
            let last_ele = this.arr1[2];
            this.arr1.push(last_ele + 1);
            this.arr1.shift();
          }
        } catch (err) {
          console.log("err", err);
        }
        break;
      }
    }
  }
  onChangeEvents() {}

  closeEmployeeModal() {
    this.employeeModal.hide();
    if (this.selectedEmployeeId) this.selectedEmployeeId = null;
    this.addEmployeeForm.reset();
    this.submitted=false
    this.isEdit = false;
    this.imageUrl = " ";
  }

  closeConfirmationModal() {
    this.confirmationModal.hide();
    this.selectedEmployeeId = null;
  }
}
