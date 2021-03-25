import { Component, OnInit, ViewChild } from "@angular/core";
import { ActivatedRoute } from "@angular/router";
import { ModalDirective } from "ngx-bootstrap/modal";
import { BehaviorSubject, ReplaySubject } from "rxjs";
import { debounce, last, take, takeUntil } from "rxjs/operators";
import {
  EmployeesService,
  ResponseData,
} from "../../../../services/employees.service";
import { ToastrService } from "ngx-toastr";
import { AsyncPipe, formatDate } from "@angular/common";
import { FormBuilder, FormGroup, Validators } from "@angular/forms";
import { NgxUiLoaderService, SPINNER } from "ngx-ui-loader";
@Component({
  selector: "app-project-manager-list",
  templateUrl: "./project-manager-list.component.html",
  styleUrls: ["./project-manager-list.component.scss"],
  providers: [AsyncPipe],
})
export class ProjectManagerListComponent implements OnInit {
  @ViewChild("projectManagerModal") public projectManagerModal: ModalDirective;
  @ViewChild("confirmationModal") public confirmationModal: ModalDirective;
  addProjectManagerForm: FormGroup;
  destroyed$: ReplaySubject<boolean> = new ReplaySubject(1);
  projectManager$ = new BehaviorSubject<any[]>([]);
  role: string;
  imageUrl: string;
  submitted = false;
  selectedProjectManagerData;
  spinnerType = SPINNER.cubeGrid;
  image: File;
  imagesUrl: any = "";
  isEdit;
  paginationControl = [];
  totalPages;
  currentPage;
  changeText:boolean;
  projectData= [];
  emailPattern =
    "^[a-zA-Z0-9.!#$%&'*+/=?^_`{|}~-]+@[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?(?:.[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?)*$";
  constructor(
    private employeeService: EmployeesService,
    private route: ActivatedRoute,
    private toaster: ToastrService,
    private fb: FormBuilder,
    private ngxLoader: NgxUiLoaderService,
    private asyncPipe: AsyncPipe
  ) {
    this.role = this.route.snapshot.data.title;
    this.addProjectManagerForm = this.fb.group({
      first_name: ["", [Validators.required]],
      last_name: ["", [Validators.required]],
      email: ["", [Validators.required, Validators.pattern(this.emailPattern)]],
      dob: ["", [Validators.required]],
      password: ["", [Validators.required, Validators.minLength(6)]],     
      gender: [""],
      status:[""]
    });
    this.changeText = false;
  }

  ngOnInit(): void {
    const list = this.route.snapshot.data.list;
    this.projectManager$.next(list.data);
    //this.projectData.push(list.data);
    console.log("Project Data",this.projectData);
    
    this.currentPage = list.currentPage;
    console.log("Current Page", this.currentPage);
    this.totalPages = list.totalPages;
    console.log("Total Page", this.totalPages);
    for (let i = 0; i <= this.totalPages; i++) {
      if (i < 3) {
        this.paginationControl.push(i + 1);
      }
    }
  }

  // getProjectManagerList1(page?:any){
  //   const data = {
  //     role: this.role,
  //   };
  //   try{
  //     this.employeeService.getEmployees(data,page).subscribe((res:any)=>{
  //       const {statusCode,data,message} = res;
  //         if(statusCode == 200){
  //           this.projectData.push(data);
            
  //         }else{
  //           this.toaster.error("Cannot load");
  //         }
  //     });
      
  //   }catch(error){
  //     console.log(error);
  //   }
  // }

  getProjectManagerList(page?: any) {
    this.ngxLoader.start();
    const data = {
      role: this.role,
    };
    try {
      this.employeeService
        .getEmployees(data, page)
        .pipe(takeUntil(this.destroyed$))
        .subscribe((res: any) => {
          const { statusCode, data, message } = res;
          if (statusCode == 200) {
            this.projectManager$.next(data);

            this.ngxLoader.stop();
          } else {
            this.toaster.error(message);
            this.ngxLoader.stop();
          }
        });
    } catch (error) {
      console.log(error);
      this.ngxLoader.stop();
    }
  }

  // addProjManag1(){
  //   const formdata = new FormData();
  //   const projmanagdata = this.addProjectManagerForm.value;
  //   projmanagdata.role = this.role;
  //   projmanagdata.dob = projmanagdata.dob.split("-").join("/");
  //   delete projmanagdata["status"];
  //   Object.keys(projmanagdata).forEach((key) => {
  //     if (key != "image") {
  //       formdata.append(key, projmanagdata[key]);
  //     }
  //   });
  //   if (this.image) {
  //     formdata.append("image", this.image);
  //   }
  //   try{
  //     this.employeeService.addEmployee(formdata).subscribe((res:ResponseData)=>{
  //       const {statusCode,data} = res;
  //       if(statusCode == 200){
  //         let arrayD = this.projectData;
  //         console.log(arrayD);
  //         arrayD.unshift(data);
  //         arrayD.pop();
  //         this.getProjectManagerList();
  //       }
  //       else{
  //         console.log("error");
          
  //       }
  //     });
  //   }catch{}
  // }
  
  addProjectManager() {
    this.ngxLoader.start();
    const formdata = new FormData();
    const projectManagerData = this.addProjectManagerForm.value;
    projectManagerData.role = this.role;
    projectManagerData.dob = projectManagerData.dob.split("-").join("/");
    delete projectManagerData["status"];
    Object.keys(projectManagerData).forEach((key) => {
      if (key != "image") {
        formdata.append(key, projectManagerData[key]);
      }
    });
    if (this.image) {
      formdata.append("image", this.image);
    }
    try {
      this.employeeService
        .addEmployee(formdata)
        .pipe(takeUntil(this.destroyed$))
        .subscribe((res: ResponseData) => {
          const { statusCode, data, message } = res;
          if (statusCode == 200) {
            let projManager = this.projectManager$.value;
            projManager.unshift(data);
            projManager.pop();
            this.toaster.success(message);
            this.ngxLoader.stop();
          } else {
            this.toaster.error(message);
            this.ngxLoader.stop();
          }
        });
    } catch {
      this.toaster.error();
      this.ngxLoader.stop();
    }
  }

  openUpdateProjectManagerForm(data: any) {
    this.projectManagerModal.show();
    let date = formatDate(data.dob, "yyyy-MM-dd", "en-US");
    this.addProjectManagerForm.patchValue({
      first_name: data.first_name,
      last_name: data.last_name,
      email: data.email,
      dob: date,
      password: data.password,
      profile_pic: data.profile_pic,
      status: data.status,
      gender: data.gender,
    });
    
    this.imagesUrl = data.profile_pic;
    this.isEdit = true;
    this.selectedProjectManagerData = data._id;
  }

  updateProjectManager() {
    this.ngxLoader.start();
    const formdata = new FormData();
    const projectManagerData = this.addProjectManagerForm.value;
    projectManagerData.role = this.role;
    projectManagerData.dob = projectManagerData.dob;
    Object.keys(projectManagerData).forEach((key) => {
      if (key != "image") {
        formdata.append(key, projectManagerData[key]);
      }
    });
    if (this.image) {
      formdata.append("image", this.image);
    }
    console.log("Project manager data:", projectManagerData);
    try {
      this.employeeService
        .updateEmployee(formdata, this.selectedProjectManagerData)
        .pipe(takeUntil(this.destroyed$))
        .subscribe((res: ResponseData) => {
          const { statusCode, data } = res;
          if (statusCode == 200) {
            let projManagerDataValue = this.asyncPipe.transform(
              this.projectManager$
            );
            console.log(projManagerDataValue);
            let updatedProjManager = projManagerDataValue.find(
              (item) => item._id === data._id
            );
            console.log("updated proj value:", updatedProjManager);
            let index = projManagerDataValue.indexOf(updatedProjManager);
            console.log("index:", index);
            if (index > -1) {
              projManagerDataValue[index] = data;
              this.projectManager$.next(projManagerDataValue);
              this.toaster.success("Updated Successfully");
              this.closeProjectManagerModal();
              this.ngxLoader.stop();
            } else {
              this.toaster.error("Cannot update record");
              this.ngxLoader.stop();
            }
          }
        });
    } catch {
      this.toaster.error();
      this.ngxLoader.stop();
    }
  }
  uploadFile(event) {
    let freader = new FileReader();
    if (event.target.files && event.target.files[0]) {
      this.image = event.target.files[0];
      console.log(this.image);
      freader.readAsDataURL(this.image);
      freader.onload = (): any => {
        this.imagesUrl = freader.result;
        this.addProjectManagerForm.patchValue({
          file: freader.result,
        });
      };
    }
  }
  onPageChange(page) {
    console.log("", page);
    page > this.currentPage ? this.onNext(page) : this.onPrev();
    // if(page == this.currentPage){
    //   this.currentPage = page;
    // }
    // if(page > this.currentPage){
    //   if (this.paginationControl[this.paginationControl.length - 1] !=this.totalPages) {       
    //     this.paginationControl.push(this.paginationControl[this.paginationControl.length - 1] + 1);
    //     this.paginationControl.shift();
    //   }
    // }
    // else{
    // //if(page < this.currentPage){
    //   if (this.paginationControl[0] != 1) {
    //     this.paginationControl.unshift([this.paginationControl[0] - 1]);
    //     this.paginationControl.pop();
    //   }
    // }
    this.currentPage = page;
    this.getProjectManagerList(this.currentPage);
  }
  onNext(page) {
    if (this.paginationControl[this.paginationControl.length - 1] != this.totalPages) {
        this.paginationControl.push(this.paginationControl[this.paginationControl.length - 1] + 1);
        this.paginationControl.shift();    
    }
    this.currentPage += 1;
    this.getProjectManagerList(this.currentPage);
    console.log(this.currentPage);
  }
  onPrev() {
    if (this.paginationControl[0] != 1) {
      this.paginationControl.unshift([this.paginationControl[0] - 1]);
      this.paginationControl.pop();
    }
    this.currentPage -= 1;
    this.getProjectManagerList(this.currentPage);
  }

  onSubmit() {
    this.submitted = true;
    if (this.addProjectManagerForm.invalid) {
      return false;
    }
    this.isEdit ? this.updateProjectManager() : this.addProjectManager();
    this.closeProjectManagerModal();
  }

  openConfirmationModal() {
    this.confirmationModal.show();
  }
  closeConfirmationModal() {
    this.confirmationModal.hide();
  }
  closeProjectManagerModal() {
    this.submitted = false;
    this.imagesUrl = "";
    this.addProjectManagerForm.reset();
    this.projectManagerModal.hide();
    this.selectedProjectManagerData = null;
    this.isEdit = false;
  }
  deleteProjectManager() {}
}
