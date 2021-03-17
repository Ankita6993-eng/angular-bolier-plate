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

  
  addTrainee() {
    this.ngxLoaderService.start();
    //Adding role explicitly
    const data1 = this.addTraineeForm.value;
    data1.role = this.role;
    //Changing date format
    data1.dob = data1.dob.split("-").join("/");
    //Adding image
    data1.image = this.image;
    
    
    // //Adding image
    // const formData = new FormData();
    // formData.append('image', this.image);
    // //const imgData = this.addTraineeForm.get('imgUpload').value;
    // //data1.image = formData;
    console.log("Data:",data1);
    try {
      this.EmployeesService.addEmployee(data1)
        .pipe(takeUntil(this.destroyed$))
        .subscribe((res: ResponseData) => {
          this.loading = false;
          const { statusCode, data, message } = res;
          if (statusCode == 200) {
            //Adding all the values to temporary array and then pushing new value to it, to display new value added.
            let tempTrainee = this.trainees$.value;
            console.log("Temp trainee data",tempTrainee);
            tempTrainee.unshift(data1);
            console.log("Temp trainee data",tempTrainee);

            //Passing value to the behaviour subject
            this.trainees$.next(tempTrainee);          

            console.log("VALUES",this.trainees$);
            this.ngxLoaderService.stop();
            this.toasterService.success("Successfully entered the data:")
            this.closeTraineeModal();  
          //  this.getTraineesList();
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
  updateTrainee() {}
  deleteTrainee() {
    try {
      this.EmployeesService.deleteEmployee(this.selectedEmployeeId).pipe(
        takeUntil(this.destroyed$)
      ).subscribe((result: ResponseData) => {
        this.loading = false;
        const { statusCode, message } = result;
        console.log("id",this.selectedEmployeeId);
      //   if (statusCode === 200) {
      //     let employeesClone = this.asyncPipe.transform(this.trainees$);
      //     const deletedEmployee = employeesClone.find(employee => employee._id === this.selectedEmployeeId);
      //     const index = employeesClone.indexOf(deletedEmployee);
      //     if(index>-1){
      //       employeesClone.splice(index, 1);
      //       this.trainees$.next(employeesClone)
      //     }
      //     this.closeConfirmationModal();
      //     this.toasterService.success(message)
      //   } else {

      //   }
       });
    } catch (err) {
      console.log('err', err);
    }
  }
  closeConfirmationModal() {
    this.submitted=false;
    this.addTraineeForm.reset();
    this.confirmationModal.hide();
  }
  onSubmit() {
    this.submitted = true;
    if (this.addTraineeForm.invalid) {
      return false;
    }
    this.submitted=false;
    this.addTrainee();   
    // this.isEdit ? this.updateTrainee() : this.addTrainee();
  }


  closeTraineeModal() {
    this.imageUrl='';
    this.submitted=false;
    this.addTraineeForm.reset();
    this.traineeModal.hide();
  }
  
  uploadFile(event){
    //this.submitted=false;
    this.addTraineeForm.reset();
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
        //this.editFile = false;
        //this.removeUpload = true;
      }
      // ChangeDetectorRef since file is loading outside the zone
      // this.cd.markForCheck();        
    }
    console.log("Reader value:",fReader.result);
  }
  
}
