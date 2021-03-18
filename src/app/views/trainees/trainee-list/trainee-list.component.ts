import { Component, ElementRef, OnInit, ViewChild } from "@angular/core";
import { AsyncPipe } from "@angular/common";
import { takeUntil} from "rxjs/operators";
import { BehaviorSubject, ReplaySubject} from "rxjs";
import {
  EmployeesService,
  ResponseData,
} from "../../../services/employees.service";
import { ModalDirective } from "ngx-bootstrap/modal";
import { FormBuilder, FormGroup, Validators } from "@angular/forms";
import { ToastrService } from "ngx-toastr";
import { ActivatedRoute } from "@angular/router";
import { ThisReceiver } from "@angular/compiler";
import { NgxUiLoaderService, SPINNER } from "ngx-ui-loader";
import { ErrorHandlingService } from '../../../services/error-handling.service';
@Component({
  selector: "app-trainee-list",
  templateUrl: "./trainee-list.component.html",
  styleUrls: ['./trainee-list.component.scss'],
  providers: [AsyncPipe],
})
export class TraineeListComponent implements OnInit {
  @ViewChild("traineeModal") public traineeModal: ModalDirective;
  @ViewChild("confirmationModal") public confirmationModal: ModalDirective;
  @ViewChild("fileInput") el:ElementRef;
  selectedTraineeId: string = null;
  addTraineeForm: FormGroup;
  loading: boolean = false;
  isEdit: boolean = false;
  destroyed$: ReplaySubject<boolean> = new ReplaySubject(1);
  trainees$ = new BehaviorSubject<any[]>([]);
  role: string = null;
  data1;
  totalPages: 0;
  paginationControl: number[] = [];
  currentPage;
  nextprevPageLink: string="";
  spinnerType = SPINNER.threeStrings;
  submitted = false;
  imageUrl:any = '';
  image:File;
  selectedEmployeeId:string;
  emailPattern =
    "^[a-zA-Z0-9.!#$%&'*+/=?^_`{|}~-]+@[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?(?:.[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?)*$";
  constructor(
    private formBuilder: FormBuilder,
    private toasterService: ToastrService,
    private asyncPipe: AsyncPipe,
    private route: ActivatedRoute,
    private EmployeesService: EmployeesService,
    private ngxLoaderService: NgxUiLoaderService
  ) {
    this.role = this.route.snapshot.data.title;
    this.addTraineeForm = this.formBuilder.group({
      first_name: ["", [Validators.required]],
      last_name: ["", [Validators.required]],
      email: ["", [Validators.required,Validators.pattern(this.emailPattern)]],
      dob: ["", [Validators.required]],
      password: ["", [Validators.required,Validators.minLength(6)]],
      gender: [""],
      // file:[null],
      // imgUpload:[""],
    });
  }

  ngOnInit(): void {
    const list = this.route.snapshot.data.list;
    this.trainees$.next(list.data);
    this.totalPages = list.totalPages;
    this.currentPage = list.currentPage;
    console.log(this.currentPage);

    for (let i = 0; i < this.totalPages; i++) {    
       if(i < 3) {
        this.paginationControl.push(i + 1);
       }
      // console.log("Pagination value", this.paginationControl[i]);
    }
  }

  getTraineesList(page?: number) {
    this.ngxLoaderService.start();
    const data = {
      role: this.role,
    };
    try {
      this.EmployeesService.getEmployees(data, page)
        .pipe(takeUntil(this.destroyed$))
        .subscribe((res: any) => {
          this.loading = false;
          const { statusCode, data, message } = res;
          if (statusCode == 200) {
            this.trainees$.next(data);
            this.ngxLoaderService.stop()
          } else {
            this.ngxLoaderService.stop()
            this.toasterService.error(message);
          }
        });
    } catch (error) {
      console.log("Error", error);      
      this.ngxLoaderService.stop()
    }
  }

  onPageChange(page) {
    
    // switch(this.nextprevPageLink){
    //   case 'prev':
    //     if() 
    // }
    if(page > this.currentPage) { //onNext 
      this.paginationControl.push(this.paginationControl[this.paginationControl.length-1] + 1);
      this.paginationControl.shift();
    }else{ //onPrev
      this.paginationControl.pop();
      this.paginationControl.unshift(this.paginationControl[0]-1);
    }
    this.currentPage = page;
    console.log('page', page);
     this.getTraineesList(page)     
  }

  onPageChange1(pageType:string){
    switch(pageType){
      case 'prev':
        
      let paginationPages = this.paginationControl[0];
        this.paginationControl.unshift(paginationPages-1);
        this.paginationControl.pop();
        //this.currentPage = page;

        break;
      case 'next':
        this.paginationControl.push(this.paginationControl[this.paginationControl.length-1] + 1);
        this.paginationControl.shift();
        break;
      default:
        break;
    }
  }

  
  addTrainee() {
    // this.isEdit = false;
    this.ngxLoaderService.start();
    

    // this.addTraineeForm.patchValue({
    //   image: this.image,
    //   role : this.role
    // })
     
    //Adding form values to temporary variable
    const data1 = this.addTraineeForm.value;
    //Adding role explicitly
    data1.role = this.role;
    //Changing date format
    data1.dob = data1.dob.split("-").join("/");
    //Adding image
    data1.image = this.image;

    //Object.assign(data1, {image: this.image})

    //Adding image
     const formData = new FormData();
     Object.keys(data1).forEach((key)=>{
       if(key!= "image"){
         formData.append(key,data1[key]);
       }
     });
     if(this.image){
       formData.append("image",this.image);
     }
     //formData.append('image', this.image);
    // //const imgData = this.addTraineeForm.get('imgUpload').value;
    // //data1.image = formData;
    console.log("Data:",data1);
    try {
      this.EmployeesService.addEmployee(formData)
        .pipe(takeUntil(this.destroyed$))
        .subscribe((res: ResponseData) => {
          this.loading = false;
          
          const { statusCode, data, message } = res;
          if (statusCode == 200) {
            //Adding all the values to temporary array and then pushing new value to it, to display new value added.
            let tempTrainee = this.trainees$.value;
            console.log("Temp trainee data",tempTrainee);
            tempTrainee.unshift(data);
            console.log("Temp trainee data",tempTrainee);

            //Passing value to the behaviour subject
            //this.trainees$.next(tempTrainee);      
            tempTrainee.pop();    
            console.log("VALUES",this.trainees$);
            this.ngxLoaderService.stop();
            this.toasterService.success("Successfully entered the data:")
            this.closeTraineeModal();  
            //this.getTraineesList();
          } else {
            this.ngxLoaderService.stop()
            this.toasterService.error(message);
          }
        });
    } catch (error) {
      console.log("Error", error);      
      this.ngxLoaderService.stop()
    }
  }
  openUpdateTraineeForm(trainee: any) {
    this.addTraineeForm.patchValue({
      first_name: trainee.first_name,
      last_name: trainee.last_name,
      email: trainee.email,
      dob: trainee.dob,
      gender: trainee.gender,
      profile_pic: trainee.image,
      password: trainee.password
    })
    this.traineeModal.show();
    this.selectedTraineeId = trainee._id;
    this.isEdit = true;
  }
  updateTrainee() {
    
    // this.selectedEmployeeId = this.route.snapshot.params['_id'];
    // this.EmployeesService.updateEmployee(this.addTraineeForm.value, this.selectedEmployeeId).pipe(
    //   takeUntil(this.destroyed$)
    // ).subscribe((result: ResponseData) => {
    //   const { statusCode, message, data } = result;
    //   console.log(this.trainees$);
    //   if (statusCode === 200) {
    //     let traineesClone = this.asyncPipe.transform(this.trainees$);
    //     console.log(traineesClone);
    //     const updatedEmployee = traineesClone.find(trainee => trainee._id === data._id);
    //     console.log("id",updatedEmployee);
    //     this.selectedEmployeeId = updatedEmployee
    //     const index = traineesClone.indexOf(updatedEmployee);
    //     if (index > -1) {
    //       traineesClone[index] = data;
    //       this.trainees$.next(traineesClone)
    //     }
    //     this.closeTraineeModal();
    //     this.addTraineeForm.reset();
    //     this.toasterService.success(message)
    //   } else {
    //     this.toasterService.error(message)
    //   }
    // });
  }
  deleteTrainee() {}
  closeConfirmationModal() {
    // this.submitted=false;
    this.addTraineeForm.reset();
    this.confirmationModal.hide();
    this.selectedTraineeId = null;
  }
  onSubmit() {
    this.submitted = true;
    if (this.addTraineeForm.invalid) {
      return false;
    }
    this.submitted=false;
    //this.addTrainee();   
     this.isEdit ? this.updateTrainee() : this.addTrainee();
  }

  closeTraineeModal() {
    this.imageUrl='';
    this.submitted=false;
    this.addTraineeForm.reset();
    this.traineeModal.hide();
    if(this.selectedTraineeId){ this.selectedTraineeId = null}
    this.isEdit = false;
  }
  
  uploadFile(event){
    //this.submitted=false;
    //this.addTraineeForm.reset();
    let fReader = new FileReader();
   
    if (event.target.files && event.target.files[0]) {
      this.image = event.target.files[0]; 
      //let file = event.target.files[0];
      console.log(this.image);
       fReader.readAsDataURL(this.image);

      // When file uploads set it to file formcontrol
      fReader.onload = ():any => {
        this.imageUrl = fReader.result;
        this.addTraineeForm.patchValue({
          file: fReader.result
        });
        // this.editFile = false;
        // this.removeUpload = true;
      }
      // ChangeDetectorRef since file is loading outside the zone
      // this.cd.markForCheck();        
    }
    console.log("Reader value:",fReader.result);
  }
  
}
