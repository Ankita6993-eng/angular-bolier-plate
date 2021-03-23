import { Component, OnInit, ViewChild } from "@angular/core";
import { ActivatedRoute } from "@angular/router";
import { ModalDirective } from "ngx-bootstrap/modal";
import { BehaviorSubject, ReplaySubject } from "rxjs";
import { debounce, take, takeUntil } from "rxjs/operators";
import { EmployeesService, ResponseData } from "../../../../services/employees.service";
import { ToastrService } from "ngx-toastr";
import { AsyncPipe, formatDate } from "@angular/common";
import { FormBuilder, FormGroup, Validators } from "@angular/forms";
import { NgxUiLoaderService, SPINNER } from "ngx-ui-loader";
@Component({
  selector: "app-project-manager-list",
  templateUrl: "./project-manager-list.component.html",
  styleUrls: ["./project-manager-list.component.scss"],
  providers: [AsyncPipe]
})
export class ProjectManagerListComponent implements OnInit {
  @ViewChild("projectManagerModal") public projectManagerModal: ModalDirective;
  @ViewChild("confirmationModal") public confirmationModal: ModalDirective;
  addProjectManagerForm: FormGroup;
  destroyed$: ReplaySubject<boolean> = new ReplaySubject(1);
  projectManager$ = new BehaviorSubject<any[]>([]);
  role: string;
  imageUrl:string;
  submitted=false;
  selectedProjectManagerData;
  spinnerType = SPINNER.cubeGrid;
  image:File;
  imagesUrl:any="";
  isEdit;
  emailPattern = "^[a-zA-Z0-9.!#$%&'*+/=?^_`{|}~-]+@[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?(?:.[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?)*$";
  constructor(
    private employeeService: EmployeesService,
    private route: ActivatedRoute,
    private toaster: ToastrService,
    private fb:FormBuilder,
    private ngxLoader:NgxUiLoaderService,
    private asyncPipe:AsyncPipe
  ) {
    this.role = this.route.snapshot.data.title;
    this.addProjectManagerForm = this.fb.group({
      first_name : ["",[Validators.required]],
      last_name : ["",[Validators.required]],
      email : ["",[Validators.required,Validators.pattern(this.emailPattern)]],
      dob : ["",[Validators.required]],
      password : ["",[Validators.required,Validators.minLength(6)]],
      gender : [""]
    })
  }

  ngOnInit(): void {
    const list = this.route.snapshot.data.list;
    this.projectManager$.next(list.data);
  }

  getProjectManagerList() {
    this.ngxLoader.start();
    const data = {
      role: this.role,
    };
    try {
      this.employeeService
        .getEmployees(data)
        .pipe(takeUntil(this.destroyed$))
        .subscribe((res: any) => {
          const { statusCode, data, message } = res;
          if (statusCode == 200) {
            this.projectManager$.next(data);
            this.toaster.success(message);
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
  formData(){
    const formdata = new FormData;
    const projectManagerData = this.addProjectManagerForm.value;
    projectManagerData.role = this.role;
    projectManagerData.dob = projectManagerData.dob.split("-").join("/");
    Object.keys(projectManagerData).forEach((key) =>{
      if(key != "image"){formdata.append(key,projectManagerData[key])}
    });
    if(this.image){
      formdata.append("image",this.image);
    }
  }
  addProjectManager(){
    this.ngxLoader.start();    
    const formdata = new FormData;
    const projectManagerData = this.addProjectManagerForm.value;
    projectManagerData.role = this.role;
    projectManagerData.dob = projectManagerData.dob.split("-").join("/");
    Object.keys(projectManagerData).forEach((key) =>{
      if(key != "image"){formdata.append(key,projectManagerData[key])}
    });
    if(this.image){
      formdata.append("image",this.image);
    }
    //this.image = null;
    try{
      this.employeeService.addEmployee(formdata).pipe(takeUntil(this.destroyed$)).subscribe((res:ResponseData)=>{
        const {statusCode,data,message} = res;
          if(statusCode == 200){
            let projManager = this.projectManager$.value;
            projManager.unshift(data);
            projManager.pop();
            //this.projectManager$.next(data);
            this.toaster.success(message);
            this.ngxLoader.stop();
          }else{
            this.toaster.error(message);
            this.ngxLoader.stop();
          }
      });
    }catch{
      this.toaster.error();
      this.ngxLoader.stop();
    }
  }

  openUpdateProjectManagerForm(data:any){
    this.projectManagerModal.show();
    let date = formatDate(data.dob,"yyyy-MM-dd","en-US");
    this.addProjectManagerForm.patchValue({
      first_name:data.first_name,
      last_name:data.last_name,
      email:data.email,
      dob:date,
      password:data.password,
      profile_pic:data.profile_pic,
      gender:data.gender
    })
    this.imagesUrl = data.profile_pic;
    this.isEdit = true;
    this.selectedProjectManagerData = data._id;
  }

  updateProjectManager(){
    //this.ngxLoader.start();
    const formdata = new FormData;
    const projectManagerData = this.addProjectManagerForm.value;
    projectManagerData.role = this.role;
    projectManagerData.dob = projectManagerData.dob.split("-").join("/");
    Object.keys(projectManagerData).forEach((key) =>{
      if(key != "image"){formdata.append(key,projectManagerData[key])}
    });
    if(this.image){
      formdata.append("image",this.image);
    }  
    try{
      this.employeeService.updateEmployee(formdata,this.selectedProjectManagerData).pipe(takeUntil(this.destroyed$)).subscribe((res:ResponseData)=>{
        const {statusCode,data} = res;
        if(statusCode == 200){         
          let projManagerDataValue = this.asyncPipe.transform(this.projectManager$);
          //console.log(projectManagerData);
          let updatedProjManager = projManagerDataValue.find(item=>item._id == data._id);
          console.log("updated proj value:",updatedProjManager);
          let index = updatedProjManager.indexOf(projManagerDataValue);
          console.log("index:",index);
          if(index > -1){
            projManagerDataValue[index]=data;
            this.projectManager$.next(projManagerDataValue);
            this.toaster.success("Updated Successfully");
            this.closeProjectManagerModal();
           // this.ngxLoader.stop();
          }
          else{
            this.toaster.error("Cannot update record");
          //  this.ngxLoader.stop();
          }
        }
      })
    }catch{

    }
  }
  uploadFile(event){
    let freader = new FileReader;
    if(event.target.files && event.target.files[0]){
    this.image = event.target.files[0];
    console.log(this.image);
    freader.readAsDataURL(this.image);
    freader.onload=():any=>{
      this.imagesUrl = freader.result;
      this.addProjectManagerForm.patchValue({
        file:freader.result
      });
    }
    }
  }

  onSubmit(){
    this.submitted = true;
    if(this.addProjectManagerForm.invalid){
      return false;
    }
    this.isEdit ? this.updateProjectManager() : this.addProjectManager();
    this.closeProjectManagerModal();
  }
  
  
  openConfirmationModal(){
    this.confirmationModal.show();
  }
  closeConfirmationModal(){
    this.confirmationModal.hide();
  }
  closeProjectManagerModal(){
    this.submitted = false;
    this.imagesUrl = "";
    this.addProjectManagerForm.reset();
    this.projectManagerModal.hide();
    this.selectedProjectManagerData = null;
    
  }
  deleteProjectManager(){}
}
