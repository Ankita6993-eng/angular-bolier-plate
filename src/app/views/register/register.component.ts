import { Component } from "@angular/core";
import { FormBuilder, FormGroup, Validators } from "@angular/forms";
import { Router } from "@angular/router";
import { ToastrService } from "ngx-toastr";
import { AuthService } from "../../services/auth.service";

@Component({
  selector: "app-dashboard",
  templateUrl: "register.component.html",
})
export class RegisterComponent {
  registerForm: FormGroup;
  emailPattern =
    "^[a-zA-Z0-9.!#$%&'*+/=?^_`{|}~-]+@[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?(?:.[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?)*$";
  submitted = false;

  constructor(
    private formBuilder: FormBuilder,
    private auth: AuthService,
    private toaster: ToastrService,
    private router: Router
  ) {
    this.registerForm = this.formBuilder.group(
      {
        first_name: ["", [Validators.required]],
        last_name: ["", [Validators.required]],
        email: [
          "",
          [
            Validators.required,
            Validators.email,
            Validators.pattern(this.emailPattern),
          ],
        ],
        role: ["", [Validators.required]],
        dob: ["", [Validators.required]],
        password: ["", [Validators.required, Validators.minLength(6)]],
        confirmPassword: ["", [Validators.required, Validators.minLength(6)]],
        gender: [""],
      },
      {
        validator: this.mustMatch("password", "confirmPassword"),
      }
    );
  }
  mustMatch(controlName: string, matchingControlName: string) {
    return (formGroup: FormGroup) => {
      const control = formGroup.controls[controlName];
      const matchingControl = formGroup.controls[matchingControlName];
      if (matchingControl.errors && !matchingControl.errors.mustMatch) {
        // return if another validator has already found an error on the matchingControl
        return;
      }
      // set error on matchingControl if validation fails
      if (control.value !== matchingControl.value) {
        matchingControl.setErrors({ mustMatch: true });
      } else {
        matchingControl.setErrors(null);
      }
    };
  }

  submit() {
    this.submitted = true;
    if (this.registerForm.invalid) {
      return false;
    }
    const tempData = this.registerForm.value;
    delete tempData.confirmPassword;

    tempData.dob = tempData.dob.split("-").join("/");

    this.auth.register(tempData).subscribe(
      (response: any) => {
        if (response.statusCode === 200) {
          this.toaster.success("Welcome Employee");
          this.router.navigate(["/login"]);
        } else {
          this.toaster.error(response.message);
        }
      },
      (error) => {
        console.log(error);
        this.toaster.error("Oops something went wrong.");
      }
    );
    this.submitted = false;
    this.registerForm.reset();
  }
}
