import { Router, CanActivate } from '@angular/router';
import { Injectable } from '@angular/core';
import { ToastrService } from 'ngx-toastr';
import { Observable, of } from 'rxjs';
import { StorageService } from '../services/storage.service';

@Injectable({ providedIn: 'root' })
export class AuthGuard implements CanActivate {

    constructor(
        private router: Router,
        private toaster: ToastrService,
    ) { }

    canActivate(): Observable<boolean> {
      const storedToken = StorageService.getData('token');
      if (storedToken) {
        return of(true);
      } else {
        return this.navigateToLogin();
      }
    }

    navigateToLogin() {
        this.toaster.info('Please login ...!');
        this.router.navigate(['/login']);
        return of(false);
    }
}
