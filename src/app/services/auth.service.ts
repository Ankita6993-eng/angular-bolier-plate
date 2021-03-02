import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { ToastrService } from 'ngx-toastr';
import { Router } from '@angular/router';

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  constructor(
    private http: HttpClient,
    private toastr: ToastrService,
    private route: Router
  ) { }

  adminLogin(admin) {
    return this.http.post('/auth/login', admin);
  }

  register(admin) {
    return this.http.post('/auth/signup', admin);
  }

  signOut() {
    localStorage.clear();
    this.toastr.success('Logout Success!');
    this.route.navigate(['']) // redirect after signout later
  }
}
