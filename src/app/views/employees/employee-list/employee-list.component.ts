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
import { NgxUiLoaderService, SPINNER } from "ngx-ui-loader";
import { ActivatedRoute, Router } from "@angular/router";

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
  spinnerType = SPINNER.circle;
  existing_user: any;
  tot_pages: number;
  imageUrl: any = " ";
  imgfile: File=null;
  role:string
  
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
      dob: ["", Validators.required],
     // role: ["Employee"],
      gender: ["", Validators.required],
      image: [""]
    });
  }

  ngOnInit(): void {
    this.getEmployeesList(1);
  }

  ngOnDestroy(): void {
    this.destroyed$.next(true);
    this.destroyed$.complete();
  }

  //upload image
  uploadFile(event: any) {
    const file = event.target.files[0];
    this.imgfile = event.target.files[0];
    console.log("event.target.file", event.target.files);

    this.addEmployeeForm.get("image")?.updateValueAndValidity();
    const reader = new FileReader();
    reader.onload = () => {
      this.imageUrl = reader.result as string;
    };
    this.cd.markForCheck();
    reader.readAsDataURL(file);
  }

  getEmployeesList(page: number, resetPagination: boolean = true) {
    console.log("get employee list");
    const data = {
      role: "Employee",
    };
    try {
      this.EmployeesService.getEmployees(data, page)
        .pipe(takeUntil(this.destroyed$))
        .subscribe((result: any) => {
          this.loading = false;
          const { statusCode, data, message } = result;
          this.tot_pages = result.totalPages;
          if (resetPagination) {
            for (let i = 0; i < this.tot_pages; i++) {
              if (i < 3) {
                this.arr1.push(i + 1);
              }
            }
          }
          this.ngxService.start();
          if (statusCode === 200) {
            this.employees$.next(data);
            this.toasterService.success(message);
            this.ngxService.stop();
          } else {
            this.toasterService.error(message);
               this.ngxService.stop(); 
          }
        });
    } catch (err) {
      console.log("err", err);
    }
  }

  onSubmit() {
    if (this.addEmployeeForm.invalid) {
      return;
    }
    this.isEdit ? this.updateEmployee() : this.addEmployee();
  }
  
  employee_model(){
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
    this.imgfile=null
    return formData;
  }

  addEmployee() {
   let data=this.employee_model()
    this.ngxService.start();
    const temp_emp = this.employees$.value;
    this.EmployeesService.addEmployee(data)
      .pipe(takeUntil(this.destroyed$))
      .subscribe((result: ResponseData) => {
        const { statusCode, message, data } = result;
        if (statusCode === 200) {
          console.log("data", data);
          temp_emp.unshift(data);
          this.toasterService.success("User successfully created")  
          temp_emp.pop();
          this.ngxService.stop();
          this.closeEmployeeModal();
        } else {
          this.toasterService.error(message);
          this.ngxService.stop();
        }
      });
  }


  openUpdaterecorde(employee: any) {
    var date=employee.dob
    var date1=new Date(date)
    this.addEmployeeForm.patchValue({
      first_name:employee.first_name,
      last_name:employee.last_name,
      email:employee.email,
      dob:date1.toLocaleDateString('en-CA'),
      gender:employee.gender,
      role:this.role,
    })
    this.imageUrl=employee.profile_pic
    this.selectedEmployeeId = employee._id;
    this.employeeModal.show();
    this.isEdit=true
  }

  updateEmployee() {     
  let data =  this.employee_model()
  this.ngxService.start();
  console.log('this.imgfile', this.imgfile);
  
   console.log('data', data);
      console.log('formdata', this.addEmployeeForm.value);  

       this.EmployeesService.updateEmployee(data,this.selectedEmployeeId)
       .pipe(takeUntil(this.destroyed$)).subscribe((result:ResponseData)=>{
        const { statusCode, message, data } = result
        if (statusCode === 200) {
          let employeesClone = this.asyncPipe.transform(this.employees$);
          console.log('employeesClone', employeesClone);
          
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
          this.toasterService.success(message);
          } else {
              this.toasterService.error(message);
              this.ngxService.stop();
          }
    });
  }


 openConfirmationModal(id: string) {
    this.confirmationModal.show();
    this.selectedEmployeeId = id;
  }

  deleteEmployee() {
    console.log('this.selectedEmployeeId', this.selectedEmployeeId);
    
    try {
      this.EmployeesService.deleteEmployee(this.selectedEmployeeId)
        .pipe(takeUntil(this.destroyed$))
        .subscribe((result: ResponseData) => {
          this.loading = false;
          console.log('this.selectedEmployeeId', this.selectedEmployeeId);
          const { statusCode, message } = result 
          console.log('result', result);
          console.log('statusCode====>', statusCode);

          if (statusCode === 200) {
            let employeesClone = this.asyncPipe.transform(this.employees$);
            console.log('employeeClone', this.employees$.value);
            
            const deletedEmployee = employeesClone.find(
              (employee) => employee._id === this.selectedEmployeeId
            );
            const index = employeesClone.indexOf(deletedEmployee);
            if (index > -1) {
              employeesClone.splice(index, 1);
              this.employees$.next(employeesClone);
            }
            this.closeConfirmationModal();
            this.toasterService.success(message);
          } else {
          }
        });
    } catch (err) {
      console.log("err", err);
    }
  }


  clickPage(pagenationType: string, page: number) {
    switch (pagenationType) {
      case "prev": {
        this.currentpage = this.currentpage - 1;
        try {
          let first_ele = this.arr1[0];
          this.arr1.unshift(first_ele - 1);
          this.arr1.pop();
          this.getEmployeesList(this.currentpage, false);
        } catch (err) {
          console.log("err", err);
        }
        break;
      }
      case "current": {
        this.currentpage = page;
        const data = { role: "Employee" };
        try {
          this.getEmployeesList(page, false);
        } catch (err) {
          console.log("err", err);
        }
        break;
      }

      case "next": {
        this.currentpage = this.currentpage + 1;
        try {
          if (this.arr1[2]!=this.tot_pages) {
            let last_ele = this.arr1[2];
            this.arr1.push(last_ele + 1);
            this.arr1.shift();
            this.getEmployeesList(this.currentpage, false);
          } 
        } catch (err) {
          console.log("err", err);
        }
        break;
      }
    }
  }

  closeEmployeeModal() {
    this.employeeModal.hide();
    if (this.selectedEmployeeId) this.selectedEmployeeId = null;
    this.addEmployeeForm.reset();
    this.isEdit=false
    this.imageUrl=" "
  }

  closeConfirmationModal() {
    this.confirmationModal.hide();
    this.selectedEmployeeId = null;
  }
}
