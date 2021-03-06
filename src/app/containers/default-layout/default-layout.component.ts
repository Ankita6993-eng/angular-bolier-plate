import {Component} from '@angular/core';
import { AuthService } from '../../services/auth.service';
import { navItems } from '../../_nav';

@Component({
  selector: 'app-dashboard',
  templateUrl: './default-layout.component.html'
})
export class DefaultLayoutComponent {
  public sidebarMinimized = false;
  public navItems = navItems;

  constructor(
    private authService: AuthService
  ) {}

  toggleMinimize(e) {
    this.sidebarMinimized = e;
  }

  logout() {
    this.authService.signOut();
  }
}
