import { Component, ElementRef, OnInit, ViewChild } from "@angular/core";
import { AsyncPipe, formatDate } from "@angular/common";
import { takeUntil } from "rxjs/operators";
import { BehaviorSubject, ReplaySubject } from "rxjs";
import {
  EmployeesService,
  ResponseData,
} from "../../../services/employees.service";
import { ModalDirective } from "ngx-bootstrap/modal";
import { FormBuilder, FormGroup, Validators } from "@angular/forms";
import { ToastrService } from "ngx-toastr";
import { ActivatedRoute } from "@angular/router";
import { NgxUiLoaderService, SPINNER } from "ngx-ui-loader";
@Component({
  selector: "app-trainee-list",
  templateUrl: "./trainee-list.component.html",
  styleUrls: ["./trainee-list.component.scss"],
  providers: [AsyncPipe],
})
export class TraineeListComponent implements OnInit {
  @ViewChild("traineeModal") public traineeModal: ModalDirective;
  @ViewChild("confirmationModal") public confirmationModal: ModalDirective;
  @ViewChild("fileInput") el: ElementRef;
  selectedTraineeId: string = null;
  addTraineeForm: FormGroup;
  loading: boolean = false;
  isEdit: boolean = false;
  destroyed$: ReplaySubject<boolean> = new ReplaySubject(1);
  trainees$ = new BehaviorSubject<any[]>([]);
  role: string = null;
  data1;
  totalPages: 0;
  paginationControl = [];
  currentPage = 1;
  nextprevPageLink: string = "";
  spinnerType = SPINNER.threeStrings;
  submitted = false;
  imageUrl: any = "";
  image: File;
  selectedEmployeeId: string;
  totPages;
  emailPattern = "^[a-zA-Z0-9.!#$%&'*+/=?^_`{|}~-]+@[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?(?:.[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?)*$";
  constructor(
    private formBuilder: FormBuilder,
    private toasterService: ToastrService,
    private asyncPipe: AsyncPipe,
    private route: ActivatedRoute,
    private EmployeesService: EmployeesService,
    private ngxLoaderService: NgxUiLoaderService
  ) 
  {
    this.role = this.route.snapshot.data.title;
    this.addTraineeForm = this.formBuilder.group({
      first_name: ["", [Validators.required]],
      last_name: ["", [Validators.required]],
      email: ["", [Validators.required, Validators.pattern(this.emailPattern)]],
      dob: ["", [Validators.required]],
      password: ["", [Validators.required, Validators.minLength(6)]],
      gender: [""],
      status:[""]
    });
  }

  ngOnInit(): void {
    const list = this.route.snapshot.data.list;
    console.log(list);
    this.trainees$.next(list.data);
    this.totalPages = list.totalPages;
    this.currentPage = list.currentPage;
    console.log(this.currentPage);
    console.log(this.totalPages);

    this.totPages = this.totalPages;
    for (let i = 0; i <= this.totalPages; i++) {
        if (i < 3) {
          this.paginationControl.push(i + 1);
        }
      }
  }

  getTraineesList(page?: any) {
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
            this.ngxLoaderService.stop();
          } else {
            this.ngxLoaderService.stop();
            this.toasterService.error(message);
          }
        });
    } catch (error) {
      console.log("Error", error);
      this.ngxLoaderService.stop();
    }
  }

  onPageChange(page) {
    console.log(page);
    console.log("Total pages",this.totalPages);
    this.currentPage = page;
    this.getTraineesList(this.currentPage);
  }
  onNext() {
    if (this.paginationControl[this.paginationControl.length - 1] != this.totalPages) {
      this.paginationControl.push(this.paginationControl[this.paginationControl.length - 1] + 1);
      this.paginationControl.shift();
    }
    this.currentPage += 1;
    this.getTraineesList(this.currentPage);
    console.log(this.currentPage);
  }
  onPrev() {
    if (this.paginationControl[0] != 1) {
      this.paginationControl.unshift([this.paginationControl[0] - 1]);
      this.paginationControl.pop();
    }
    this.currentPage -= 1;
    this.getTraineesList(this.currentPage);
  }
  
  formdata() {
    const data1 = this.addTraineeForm.value;
    data1.role = this.role;
  }

  addTrainee() {  
    this.ngxLoaderService.start();
    //Adding form values to temporary variable
    const data1 = this.addTraineeForm.value; 
    //Adding role explicitly
    data1.role = this.role;
    //Changing date format
    data1.dob = data1.dob.split("-").join("/");
    delete data1.status;
    //Adding image
    data1.image = this.image;

    //Adding image
    const formData = new FormData();
    Object.keys(data1).forEach((key) => {
      if (key != "image") {
        formData.append(key, data1[key]);
      }
    });
    if (this.image) {
      formData.append("image", this.image);
    }
    //So it does not take previous added records image.
    this.image = null;

    console.log("Data:", data1);
    try {
      this.EmployeesService.addEmployee(formData)
        .pipe(takeUntil(this.destroyed$))
        .subscribe((res: ResponseData) => {
          this.loading = false;

          const { statusCode, data, message } = res;
          if (statusCode == 200) {
            //Adding all the values to temporary array and then pushing new value to it, to display new value added.
            let tempTrainee = this.trainees$.value;
            tempTrainee.unshift(data);
            //Passing value to the behaviour subject
            //this.trainees$.next(tempTrainee);
            tempTrainee.pop();
            this.ngxLoaderService.stop();
            this.toasterService.success("Successfully entered the data:");
            this.closeTraineeModal();
          } else {
            this.ngxLoaderService.stop();
            this.toasterService.error(message);
          }
        });
    } catch (error) {
      this.ngxLoaderService.stop();
    }
  }
  openUpdateTraineeForm(trainee: any) {
    //Converting date format
    let date = formatDate(trainee.dob, "yyyy-MM-dd", "en-US");
    this.addTraineeForm.patchValue({
      first_name: trainee.first_name,
      last_name: trainee.last_name,
      email: trainee.email,
      dob: date,
      gender: trainee.gender,
      imageUrl: trainee.profile_pic,
      password: trainee.password,
      status: trainee.status
    });
    this.imageUrl = trainee.profile_pic;
    this.traineeModal.show();
    this.selectedTraineeId = trainee._id;
    this.isEdit = true;
  }

  updateTrainee() {
    let data2 = this.addTraineeForm.value;
    data2.role = this.role;
    data2.dob = data2.dob;
    data2.image = this.image;

    const formData = new FormData();
    Object.keys(data2).forEach((key) => {
      if (key != "image") {
        formData.append(key, data2[key]);
      }
    });
    if (this.image) {
      formData.append("image", this.image);
    }
    //So it does not take previous updated records image.
    this.image = null;

    this.EmployeesService.updateEmployee(formData, this.selectedTraineeId)
      .pipe(takeUntil(this.destroyed$))
      .subscribe((result: ResponseData) => {
        const { statusCode, message, data } = result;
        if (statusCode === 200) {
          let traineesClone = this.asyncPipe.transform(this.trainees$);
          const updatedEmployee = traineesClone.find(
            (trainee) => trainee._id === data._id
          );
          this.selectedTraineeId = updatedEmployee;
          const index = traineesClone.indexOf(updatedEmployee);
          if (index > -1) {
            traineesClone[index] = data;
            this.trainees$.next(traineesClone);
          }
          this.closeTraineeModal();
          this.addTraineeForm.reset();
          this.toasterService.success(message);
        } else {
          this.toasterService.error(message);
        }
      });
  }

  deleteTrainee() {
    this.EmployeesService.deleteEmployee(this.selectedTraineeId)
      .pipe(takeUntil(this.destroyed$))
      .subscribe((result: ResponseData) => {
        const { statusCode, message } = result;
        
        if (statusCode === 200) {
          let traineesClone = this.asyncPipe.transform(this.trainees$);
          const deletedEmployee = traineesClone.find(
            (trainee) => trainee._id === this.selectedTraineeId
          );
          const index = traineesClone.indexOf(deletedEmployee);
          if (index > -1) {
            traineesClone.splice(index,1);
            this.trainees$.next(traineesClone);
          }
          this.closeTraineeModal();
          this.toasterService.success(message);
        } else {
          this.toasterService.error(message);
        }
      });
  }
  openConfirmationModal(id:string){
    this.confirmationModal.show();
    this.selectedTraineeId = id;
  }
  closeConfirmationModal() {
    this.addTraineeForm.reset();
    this.confirmationModal.hide();
    this.selectedTraineeId = null;
  }
  onSubmit() {
    this.submitted = true;
    if (this.addTraineeForm.invalid) {
      return false;
    }
    this.submitted = false;
    this.isEdit ? this.updateTrainee() : this.addTrainee();
  }

  closeTraineeModal() {
    this.imageUrl = "";
    this.submitted = false;
    this.addTraineeForm.reset();
    this.traineeModal.hide();
    if (this.selectedTraineeId) {
      this.selectedTraineeId = null;
    }
    this.isEdit = false;
  }

  uploadFile(event) {
    let fReader = new FileReader();

    if (event.target.files && event.target.files[0]) {
      this.image = event.target.files[0];
      console.log(this.image);
      fReader.readAsDataURL(this.image);

      // When file uploads set it to file formcontrol
      fReader.onload = (): any => {
        this.imageUrl = fReader.result;
        this.addTraineeForm.patchValue({
          file: fReader.result,
        });
      };
    }
    console.log("Reader value:", fReader.result);
  }
}
