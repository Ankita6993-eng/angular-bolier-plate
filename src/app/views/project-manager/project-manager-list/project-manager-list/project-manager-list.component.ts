import { Component, OnInit, ViewChild } from "@angular/core";
import { ActivatedRoute } from "@angular/router";
import { ModalDirective } from "ngx-bootstrap/modal";
import { BehaviorSubject, ReplaySubject } from "rxjs";
import { takeUntil } from "rxjs/operators";
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
    this.projectData = list.data;
    console.log("Project Data",this.projectData);
    
    this.currentPage = list.currentPage;
    this.totalPages = list.totalPages;
    for (let i = 0; i <= this.totalPages; i++) {
      if (i < 3) {
        this.paginationControl.push(i + 1);
      }
    }
  }

  //Get list using array.
  getProjectManagerList1(page?:any){
    this.ngxLoader.start();
    const data = {
      role: this.role,
    };
    try{
      this.employeeService.getEmployees(data,page).subscribe((res:any)=>{
        const {statusCode,data,message} = res;
          if(statusCode == 200){
            this.projectData = data;
            this.ngxLoader.stop();
          }else{
            this.toaster.error("Cannot load");
            this.ngxLoader.stop();
          }
      });
      
    }catch(error){
      console.log(error);
      this.ngxLoader.stop();
    }
  }
  
  //Adding using array:
  addProjManag1(){
    this.ngxLoader.start();
    const formdata = new FormData();
    const projmanagdata = this.addProjectManagerForm.value;
    projmanagdata.role = this.role;
    projmanagdata.dob = projmanagdata.dob.split("-").join("/");
    delete projmanagdata["status"];
    Object.keys(projmanagdata).forEach((key) => {
      if (key != "image") {
        formdata.append(key, projmanagdata[key]);
      }
    });
    if (this.image) {
      formdata.append("image", this.image);
    }
    this.image = null;
    try{
      this.employeeService.addEmployee(formdata).subscribe((res:ResponseData)=>{
        const {statusCode,data} = res;
        if(statusCode == 200){
          let arrayD = this.projectData;
          arrayD.unshift(data); 
          this.toaster.success("Added Successfully");
          arrayD.pop();
          this.getProjectManagerList();
          this.ngxLoader.stop();
        }
        else{
          this.ngxLoader.stop();
        }
      });
    }catch{
      this.toaster.error("Error Adding Value");
      this.ngxLoader.stop();
    }
  }

  //Update using array:
  updProjManag1(){
    this.ngxLoader.start();
    const formdata = new FormData();
    let updprojData = this.addProjectManagerForm.value;
    updprojData.role = this.role;
    updprojData.dob = updprojData.dob;
    Object.keys(updprojData).forEach((key)=>{
      if(key!='image'){formdata.append(key,updprojData[key])}
    });
    if(this.image){formdata.append("image",this.image)}
    this.image = null;
    try{
      this.employeeService.updateEmployee(formdata,this.selectedProjectManagerData).subscribe((res:ResponseData)=>{
        const{statusCode,data} = res;
        if(statusCode == 200){
          let projectmanagClone = this.projectData;
          let findManager = projectmanagClone.find((item)=>item._id == data._id);
          let index = projectmanagClone.indexOf(findManager);
          if(index > -1){
            this.projectData.splice(index,1,data);
          }
          this.ngxLoader.stop();
        }
        else{
          this.toaster.error("Cannot Update:");
          this.ngxLoader.stop();
        }
      })
    }catch(error){
      this.toaster.error(error);
      this.ngxLoader.stop();
    }
  }

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
      this.ngxLoader.stop();
    }
  }
  
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
    this.image = null;
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
            let updatedProjManager = projManagerDataValue.find(
              (item) => item._id === data._id
            );
            let index = projManagerDataValue.indexOf(updatedProjManager);
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
    this.currentPage = page;
    this.getProjectManagerList1(this.currentPage);
  }
  onNext() {
    if (this.paginationControl[this.paginationControl.length - 1] != this.totalPages) {
        this.paginationControl.push(this.paginationControl[this.paginationControl.length - 1] + 1);
        this.paginationControl.shift();    
    }
    this.currentPage += 1;
    this.getProjectManagerList1(this.currentPage);
  }
  onPrev() {
    if (this.paginationControl[0] != 1) {
      this.paginationControl.unshift([this.paginationControl[0] - 1]);
      this.paginationControl.pop();
    }
    this.currentPage -= 1;
    this.getProjectManagerList1(this.currentPage);
  }
  onLast(page){
    page=this.totalPages;
    this.currentPage = page;
    this.getProjectManagerList1(this.currentPage);
  }
  onSubmit() {
    this.submitted = true;
    if (this.addProjectManagerForm.invalid) {
      return false;
    }
    this.isEdit ? this.updProjManag1() : this.addProjManag1();
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
