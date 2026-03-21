import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { LogoComponent } from '../../components/logo-component/logo-component';
import { AuthService } from '../../services/auth.service';
import { AdminApiTokenApiService } from '../../generated/services/admin-api-token-api.service';
import { inject } from '@angular/core';
import { environment } from '../../../environments/environment';

@Component({
  selector: 'app-login-page',
  imports: [CommonModule, ReactiveFormsModule, LogoComponent],
  templateUrl: './login-page.html',
  styleUrl: './login-page.css',
})
export class LoginPage implements OnInit {
  private fb = inject(FormBuilder);
  private router = inject(Router);
  private authService = inject(AuthService);
  private adminTokenApi = inject(AdminApiTokenApiService);
  private cdr = inject(ChangeDetectorRef);

  loginForm!: FormGroup;
  isLoading = false;
  showPassword = false;
  errorMessage = '';
  version = environment.version;

  ngOnInit(): void {
    this.loginForm = this.fb.group({
      url: ['', [Validators.required]],
      token: ['', [Validators.required]],
    });
  }

  onSubmit(): void {
    if (this.loginForm.invalid) {
      this.loginForm.markAllAsTouched();
      return;
    }

    this.isLoading = true;
    this.errorMessage = '';

    const { url, token } = this.loginForm.value;

    this.authService.login(url, token);

    this.adminTokenApi.getCurrentAdminTokenInfo().subscribe({
      next: () => {
        this.router.navigate(['/dashboard']);
      },
      error: (e) => {
        this.authService.logout();
        this.errorMessage = e?.status === 401
          ? 'Invalid token.'
          : e?.status === 0
            ? 'API not reachable. Check URL.'
            : 'Connection failed.';
        this.isLoading = false;
        this.cdr.detectChanges();
      }
    });
  }

  togglePassword(): void {
    this.showPassword = !this.showPassword;
  }
}
