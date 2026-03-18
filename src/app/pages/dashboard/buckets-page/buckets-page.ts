import { Component, OnInit, inject, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { HttpErrorResponse } from '@angular/common/http';
import { switchMap } from 'rxjs';
import { RefreshButtonComponent } from '../../../components/refresh-button-component/refresh-button-component';
import { BucketCardComponent } from '../../../components/bucket-card-component/bucket-card-component';
import { GarageDataService } from '../../../services/garage-data.service';
import { BucketApiService } from '../../../generated/';

@Component({
  selector: 'app-buckets-page',
  imports: [CommonModule, FormsModule, RefreshButtonComponent, BucketCardComponent],
  templateUrl: './buckets-page.html',
  styleUrl: './buckets-page.css',
})
export class BucketsPage implements OnInit {
  private garageDataService = inject(GarageDataService);
  private bucketApi = inject(BucketApiService);
  private cdr = inject(ChangeDetectorRef);

  buckets$ = this.garageDataService.buckets$;

  isLoading = false;

  createOpen = false;
  isCreating = false;
  createAlias = '';
  createError = '';

  deleteId: string | null = null;
  isDeleting = false;
  deleteError = '';

  ngOnInit(): void {
    this.load();
  }

  load(): void {
    this.isLoading = true;
    this.garageDataService.refreshBuckets().subscribe({
      complete: () => this.isLoading = false,
      error: () => this.isLoading = false,
    });
  }

  refresh(): void {
    this.load();
  }

  toggleCreatePanel(): void {
    this.createOpen = !this.createOpen;
    this.createAlias = '';
    this.createError = '';
  }

  submitCreate(): void {
    if (!this.createAlias.trim()) {
      this.createError = 'Bitte einen Namen eingeben.';
      return;
    }

    this.isCreating = true;
    this.createError = '';

    this.bucketApi.createBucket({ body: { globalAlias: this.createAlias.trim() } }).pipe(
      switchMap(() => this.garageDataService.refreshBuckets())
    ).subscribe({
      next: () => {
        this.isCreating = false;
        this.createOpen = false;
        this.createAlias = '';
        this.cdr.detectChanges();
      },
      error: (e: HttpErrorResponse) => {
        if (e.status === 409) {
          this.createError = 'Ein Bucket mit diesem Namen existiert bereits.';
        } else {
          this.createError = 'Fehler beim Erstellen des Buckets.';
        }
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

    this.bucketApi.deleteBucket({ id: this.deleteId }).pipe(
      switchMap(() => this.garageDataService.refreshBuckets())
    ).subscribe({
      next: () => {
        this.isDeleting = false;
        this.deleteId = null;
        this.cdr.detectChanges();
      },
      error: (e: HttpErrorResponse) => {
        if (e.status === 400) {
          this.deleteError = 'Bucket ist nicht leer und kann nicht gelöscht werden.';
        } else if (e.status === 404) {
          this.deleteError = 'Bucket nicht gefunden.';
        } else {
          this.deleteError = 'Fehler beim Löschen des Buckets.';
        }
        this.isDeleting = false;
        this.cdr.detectChanges();
      }
    });
  }
}
