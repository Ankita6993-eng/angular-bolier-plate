import {
  Component,
  OnDestroy,
  OnInit,
  ViewChild,
  ChangeDetectorRef,
} from "@angular/core";
import {
  EmployeesService,
  ResponseData,
} from "../../services/employees.service";
import { takeUntil } from "rxjs/operators";
import { BehaviorSubject, ReplaySubject } from "rxjs";
import { ModalDirective } from "ngx-bootstrap/modal";
import { FormBuilder, FormGroup, Validators } from "@angular/forms";
import { ToastrService } from "ngx-toastr";
import { AsyncPipe } from "@angular/common";
import { NgxUiLoaderService } from "ngx-ui-loader";
import { ActivatedRoute } from "@angular/router";

@Component({
  selector: "app-mangement",
  templateUrl: "./mangement.component.html",
  styleUrls: ["./mangement.component.scss"],
  providers: [AsyncPipe],
})
export class MangementComponent implements OnInit, OnDestroy {
  @ViewChild(ModalDirective) public managementModal: ModalDirective;
  @ViewChild(ModalDirective) public confirmationModal: ModalDirective;

  select_management_id: string = null;
  addManagementForm: FormGroup;
  loading: boolean = false;
  isEdit: boolean = false;
  destroyed$: ReplaySubject<boolean> = new ReplaySubject(1);
  management$ = new BehaviorSubject<any[]>([]);
  management1$: Array<any> = [];
  eml_pat =
    "^[a-zA-Z0-9.!#$%&'*+/=?^_`{|}~-]+@[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?(?:.[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?)*$";
  pagenation: Array<any> = [];
  currentpage: number;
  total_pages: number;
  imageUrl: any = " ";
  imgfile: File = null;
  role: string;
  role_value: Array<any> = [];
  selected: any;
  submitted: boolean = false;

  constructor(
    private management_service: EmployeesService,
    private formBuilder: FormBuilder,
    private toasterService: ToastrService,
    private asyncPipe: AsyncPipe,
    private ngxService: NgxUiLoaderService,
    private cd: ChangeDetectorRef,
    private route: ActivatedRoute
  ) {
    this.role = this.route.snapshot.data.title;
    this.addManagementForm = this.formBuilder.group({
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
      status: [""],
      dob: ["", Validators.required],
      gender: ["", Validators.required],
      image: [""],
    });
  }

  ngOnInit(): void {
    this.ngxService.start();
    const list = this.route.snapshot.data.list;
    var len = list.data;
    for (var i = 0; i < len.length; i++) {
      this.management1$ = list.dat;
    }

    this.ngxService.stop();
    this.total_pages = list.totalPages;
    this.currentpage = list.currentPage;
    for (let i = 0; i <= this.total_pages; i++) {
      if (i < 3) {
        this.pagenation.push(i + 1);
      }
    }

    this.get_ManagementList();
  }
  ngOnDestroy(): void {
    this.destroyed$.next(true);
    this.destroyed$.complete();
  }
  //upload image with preview
  uploadFile(event: any) {
    this.imgfile = event.target.files[0];
    const file = event.target.files[0];
    const reader = new FileReader();
    if (event.target.files && event.target.files[0]) {
      reader.readAsDataURL(file);
      reader.onload = () => {
        this.imageUrl = reader.result;
      };
    }
  }

  get_ManagementList(page?) {
    const data = { role: this.role };
    this.ngxService.start();
    try {
      this.management_service
        .getUser(data, page)
        .pipe(takeUntil(this.destroyed$))
        .subscribe((result: any) => {
          const { statusCode, message, data } = result;

          if (statusCode === 200) {
            this.management1$ = result.data;
            this.ngxService.stop();
            this.toasterService.success("Recored list successfully generted ");
          } else {
            this.toasterService.error(message);
            this.ngxService.stop();
          }
        });
    } catch (err) {
      console.log("err.message", err.message);
      this.ngxService.stop();
    }
  }

  onSubmit() {
    this.submitted = true;
    if (this.addManagementForm.invalid) {
      return;
    }
    if (this.isEdit) {
      this.update_management();
    } else {
      this.add_managenemt();
    }
  }
  management_modal() {
    const formdata = new FormData();
    Object.keys(this.addManagementForm.value).forEach((key) => {
      if (key != "image") {
        formdata.append(key, this.addManagementForm.value[key]);
      }
    });
    formdata.append("role", this.role);
    if (this.imgfile) {
      formdata.append("image", this.imgfile);
    }
    this.imgfile = null;
    return formdata;
  }

  add_managenemt() {
    let temp_data = this.addManagementForm.value;

    delete temp_data["status"];
    try {
      const tmp_data = this.management1$;
      this.ngxService.start();
      let data = this.management_modal();
      this.management_service
        .addUser(data)
        .pipe(takeUntil(this.destroyed$))
        .subscribe((result: any) => {
          const { statusCode, message, data } = result;
          if (statusCode === 200) {
            tmp_data.unshift(data);
            this.toasterService.success("Recored successfully created");
            this.ngxService.stop();
            tmp_data.pop();
            this.closeManagementModal();
          } else {
            this.toasterService.error(message);
            this.ngxService.stop();
          }
        });
    } catch (err) {
      console.log("err.message", err.message);
    }
  }

  click_next_page() {
    this.currentpage = this.currentpage + 1;
    this.get_ManagementList(this.currentpage);
    try {
      if (this.pagenation[2] != this.total_pages) {
        let last_ele = this.pagenation[2];
        this.pagenation.push(last_ele + 1);
        this.pagenation.shift();
      }
    } catch (err) {
      console.log("err", err);
    }
  }

  clickpage(page) {
    this.currentpage = page;
    console.log("this.currentpage", this.currentpage);
    this.get_ManagementList(this.currentpage);
  }

  click_prev_page() {
    this.currentpage = this.currentpage - 1;
    this.get_ManagementList(this.currentpage);
    try {
      if (this.pagenation[0] != 1) {
        let first_ele = this.pagenation[0];
        this.pagenation.unshift(first_ele - 1);
        this.pagenation.pop();
      }
    } catch (err) {
      console.log("err", err);
    }
  }

  OpenUpdaterecorde(management: any) {
    var date = management.dob;
    var role1 = management.role;
    var date1 = new Date(date);
    this.addManagementForm.patchValue({
      first_name: management.first_name,
      last_name: management.last_name,
      email: management.email,
      dob: date1.toLocaleDateString("en-CA"),
      status: management.status,
      role: management.role,
      gender: management.gender,
    });
    this.imageUrl = management.profile_pic;
    this.select_management_id = management._id;
    this.managementModal.show();
    this.isEdit = true;
  }

  update_management() {
    try {
      let data = this.management_modal();
      this.ngxService.start();
      this.management_service
        .updateUser(data, this.select_management_id)
        .pipe(takeUntil(this.destroyed$))
        .subscribe((result: ResponseData) => {
          const { statusCode, message, data } = result;

          if (statusCode === 200) {
            let tmp_data = this.management1$;
            const updaterecored = tmp_data.find(
              (management) => management._id === data._id
            );
            const index = tmp_data.indexOf(updaterecored);

            if (index > -1) {
              tmp_data.splice(index, 1, data);
            }

            this.closeManagementModal();
            this.addManagementForm.reset();
            this.toasterService.success("Recored successfully updated");
            this.ngxService.stop();
          } else {
            this.toasterService.error(message);
            this.ngxService.stop();
          }
        });
    } catch (err) {
      console.log("err.message", err.message);
      this.ngxService.stop();
    }
  }

  closeManagementModal() {
    this.managementModal.hide();
    if (this.select_management_id) {
      this.select_management_id = null;
    }
    this.addManagementForm.reset();
    this.submitted = false;
    this.isEdit = false;
    this.imageUrl = " ";
  }
}
