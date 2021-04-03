import { Component } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { AuthService } from '../../services/auth.service';
import { StorageService } from '../../services/storage.service';
import { ToastrService } from 'ngx-toastr';
import { Router } from '@angular/router';
@Component({
  selector: 'app-dashboard',
  templateUrl: 'login.component.html'
})
export class LoginComponent {
  loginForm: FormGroup;
  emailPattern = "^[a-zA-Z0-9.!#$%&'*+/=?^_`{|}~-]+@[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?(?:\.[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?)*$";
  constructor(
    public formBuilder: FormBuilder,
    private auth: AuthService,
    private toaster: ToastrService,
    private router: Router
    ) {
    this.loginForm = this.formBuilder.group({
      'email': ['', [Validators.required, Validators.email, Validators.pattern(this.emailPattern)]],
      'password': ['', Validators.compose([Validators.required, Validators.minLength(6)])]
    });
  }

  public onLoginFormSubmit() {
    if (this.loginForm.valid) {
      const formData = this.loginForm.value;
      this.auth.adminLogin(formData).subscribe((res: any) => {
        if (res.statusCode === 200) {
          StorageService.setData('token', res.data.token);
          StorageService.setData('adminId', res.data._id);
          StorageService.setData('role',res.data.role);
          setTimeout(() => {
            this.toaster.success('Welcome Admin!');
            this.router.navigate(['/employees'])
          }, 500);
        } else {
          this.toaster.error(res.message);
        }
      })
      this.loginForm.reset();
    }
  }
}
