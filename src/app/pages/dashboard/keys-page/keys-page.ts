import { Component, OnInit, inject, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { HttpErrorResponse } from '@angular/common/http';
import { switchMap } from 'rxjs';
import { KeyCardComponent } from '../../../components/key-card-component/key-card-component';
import { RefreshButtonComponent } from '../../../components/refresh-button-component/refresh-button-component';
import { GarageDataService } from '../../../services/garage-data.service';
import { AccessKeyApiService } from '../../../generated/';

@Component({
  selector: 'app-keys-page',
  imports: [CommonModule, FormsModule, KeyCardComponent, RefreshButtonComponent],
  templateUrl: './keys-page.html',
  styleUrl: './keys-page.css',
})
export class KeysPage implements OnInit {
  private garageDataService = inject(GarageDataService);
  private accessKeyApi = inject(AccessKeyApiService);
  private cdr = inject(ChangeDetectorRef);

  keys$ = this.garageDataService.keys$;

  isLoading = false;

  createOpen = false;
  isCreating = false;
  createName = '';
  createError = '';

  deleteId: string | null = null;
  isDeleting = false;
  deleteError = '';

  ngOnInit(): void {
    this.load();
  }

  load(): void {
    this.isLoading = true;
    this.garageDataService.refreshKeys().subscribe({
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
      this.createError = 'Bitte einen Namen eingeben.';
      return;
    }

    this.isCreating = true;
    this.createError = '';

    this.accessKeyApi.createKey({ body: { name: this.createName.trim() } }).pipe(
      switchMap(() => this.garageDataService.refreshKeys())
    ).subscribe({
      next: () => {
        this.isCreating = false;
        this.createOpen = false;
        this.createName = '';
        this.cdr.detectChanges();
      },
      error: (e: HttpErrorResponse) => {
        this.createError = 'Fehler beim Erstellen des Keys.';
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

    this.accessKeyApi.deleteKey({ id: this.deleteId }).pipe(
      switchMap(() => this.garageDataService.refreshKeys())
    ).subscribe({
      next: () => {
        this.isDeleting = false;
        this.deleteId = null;
        this.cdr.detectChanges();
      },
      error: (e: HttpErrorResponse) => {
        this.deleteError = 'Fehler beim Löschen des Keys.';
        this.isDeleting = false;
        this.cdr.detectChanges();
      }
    });
  }
}
