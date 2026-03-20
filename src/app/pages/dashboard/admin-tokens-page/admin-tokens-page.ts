import { Component, OnInit, inject, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { HttpErrorResponse } from '@angular/common/http';
import { switchMap } from 'rxjs';
import { TokenCardComponent } from '../../../components/token-card-component/token-card-component';
import { RefreshButtonComponent } from '../../../components/refresh-button-component/refresh-button-component';
import { GarageDataService } from '../../../services/garage-data.service';
import { AdminApiTokenApiService } from '../../../generated/';

@Component({
  selector: 'app-admin-tokens-page',
  imports: [CommonModule, FormsModule, TokenCardComponent, RefreshButtonComponent],
  templateUrl: './admin-tokens-page.html',
  styleUrl: './admin-tokens-page.css',
})
export class AdminTokensPage implements OnInit {
  private garageDataService = inject(GarageDataService);
  private adminTokenApi = inject(AdminApiTokenApiService);
  private cdr = inject(ChangeDetectorRef);

  adminTokens$ = this.garageDataService.adminTokens$;

  isLoading = false;

  createOpen = false;
  isCreating = false;
  createError = '';
  createName = '';
  createScopeAll = true;
  createScopeCustom = '';

  deleteId: string | null = null;
  isDeleting = false;
  deleteError = '';

  ngOnInit(): void {
    this.load();
  }

  load(): void {
    this.isLoading = true;
    this.garageDataService.refreshAdminTokens().subscribe({
      complete: () => this.isLoading = false,
      error: () => this.isLoading = false,
    });
  }

  refresh(): void {
    this.load();
  }

  toggleCreatePanel(): void {
    this.createOpen = !this.createOpen;
    this.createName = '';
    this.createError = '';
  }

  submitCreate(): void {
    if (!this.createName.trim()) {
      this.createError = 'Please insert Name.';
      return;
    }

    this.isCreating = true;
    this.createError = '';

    const scope = this.createScopeAll
      ? ['*']
      : this.createScopeCustom.split(',').map(s => s.trim()).filter(Boolean);

    this.adminTokenApi.createAdminToken({
      body: {
        name: this.createName.trim(),
        scope,
      }
    }).pipe(
      switchMap(() => this.garageDataService.refreshAdminTokens())
    ).subscribe({
      next: () => {
        this.isCreating = false;
        this.createOpen = false;
        this.createName = '';
        this.createScopeAll = true;
        this.createScopeCustom = '';
        this.cdr.detectChanges();
      },
      error: (e: HttpErrorResponse) => {
        this.createError = 'Error while creating Token.';
        this.isCreating = false;
        this.cdr.detectChanges();
      }
    });
  }

  confirmDelete(id: string): void {
    this.deleteId = id;
    this.deleteError = '';
  }

  cancelDelete(): void {
    this.deleteId = null;
    this.deleteError = '';
  }

  submitDelete(): void {
    if (!this.deleteId) return;

    this.isDeleting = true;
    this.deleteError = '';

    this.adminTokenApi.deleteAdminToken({ id: this.deleteId }).pipe(
      switchMap(() => this.garageDataService.refreshAdminTokens())
    ).subscribe({
      next: () => {
        this.isDeleting = false;
        this.deleteId = null;
        this.cdr.detectChanges();
      },
      error: (e: HttpErrorResponse) => {
        this.deleteError = 'Error while deleting Token.';
        this.isDeleting = false;
        this.cdr.detectChanges();
      }
    });
  }
}
