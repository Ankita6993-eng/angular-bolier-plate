import { Injectable } from '@angular/core';
import { Router, CanActivate } from '@angular/router';
import { Observable, of } from 'rxjs';
import { StorageService } from '../services/storage.service';
import { ToastrService } from 'ngx-toastr';

@Injectable({ providedIn: 'root' })
export class UnAuthGuard implements CanActivate {
  constructor(
    private router: Router,
  ) { }

  canActivate(): Observable<boolean> {
    const storedToken = StorageService.getData('token');
    if (storedToken) {
      return this.navigateToDashboard();
    } else {
      return of(true);
    }
  }

  navigateToDashboard() {
    this.router.navigate(['/employees']);
    return of(false);
  }
}
