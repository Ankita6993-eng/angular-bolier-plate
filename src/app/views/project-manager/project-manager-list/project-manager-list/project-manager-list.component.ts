import { Component, OnInit, ViewChild } from "@angular/core";
import { ActivatedRoute } from "@angular/router";
import { ModalDirective } from "ngx-bootstrap/modal";
import { BehaviorSubject, ReplaySubject } from "rxjs";
import { takeUntil } from "rxjs/operators";
import { EmployeesService } from "../../../../services/employees.service";
import { ToastrService } from "ngx-toastr";
import { AsyncPipe } from "@angular/common";
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
  selectedProjectManagerId;
  spinnerType = SPINNER.cubeGrid;
  image:File;
  imagesUrl:any="";
  emailPattern = "^[a-zA-Z0-9.!#$%&'*+/=?^_`{|}~-]+@[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?(?:.[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?)*$";
  constructor(
    private employeeService: EmployeesService,
    private route: ActivatedRoute,
    private toaster: ToastrService,
    private fb:FormBuilder,
    private ngxLoader:NgxUiLoaderService
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
    if(!this.addProjectManagerForm.valid){
      console.log("error");
    }
    console.log(this.addProjectManagerForm.value);
    // this.addProjectManagerForm.reset();
    // this.closeConfirmationModal();
  }
  
  openUpdateTraineeForm(){}
  openConfirmationModal(){}
  closeConfirmationModal(){}
  closeProjectManagerModal(){
    this.addProjectManagerForm.reset();
    this.projectManagerModal.hide();
  }
  deleteProjectManager(){}
}
