import { Component, inject } from '@angular/core';
import { LogoComponent } from '../../components/logo-component/logo-component';
import { Router, RouterLink, RouterLinkActive, RouterOutlet } from '@angular/router';
import { GarageDataService } from '../../services/garage-data.service';
import { AuthService } from '../../services/auth.service';
import { environment } from '../../../environments/environment';

@Component({
  selector: 'app-dashboard-page',
  imports: [
    LogoComponent,
    RouterLink,
    RouterOutlet,
    RouterLinkActive
  ],
  templateUrl: './dashboard-page.html',
  styleUrl: './dashboard-page.css',
})
export class DashboardPage {
  private authService = inject(AuthService);
  private garageDataService = inject(GarageDataService);
  private router = inject(Router);

  version = environment.version;

  logout(): void {
    this.garageDataService.clearAll();
    this.authService.logout();
    this.router.navigate(['/login']);
  }
}
