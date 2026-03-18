import { Component, OnInit, inject, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute } from '@angular/router';
import { HttpErrorResponse } from '@angular/common/http';
import { switchMap } from 'rxjs';
import { RefreshButtonComponent } from '../../../../components/refresh-button-component/refresh-button-component';
import { InfoCardComponent } from '../../../../components/info-card-component/info-card-component';
import { KeyCardComponent } from '../../../../components/key-card-component/key-card-component';
import { GarageDataService } from '../../../../services/garage-data.service';
import { BucketApiService, PermissionApiService } from '../../../../generated/';

@Component({
  selector: 'app-bucket-detail-page',
  imports: [CommonModule, FormsModule, RefreshButtonComponent, InfoCardComponent, KeyCardComponent],
  templateUrl: './bucket-detail-page.html',
  styleUrl: './bucket-detail-page.css',
})
export class BucketDetailPage implements OnInit {
  private route = inject(ActivatedRoute);
  private garageDataService = inject(GarageDataService);
  private bucketApi = inject(BucketApiService);
  private permissionApi = inject(PermissionApiService);
  private cdr = inject(ChangeDetectorRef);

  readonly bucketId = this.route.snapshot.params['id'];
  bucket$ = this.garageDataService.getBucketDetail$(this.bucketId);
  keys$ = this.garageDataService.keys$;
  isLoading = false;

  // Quotas
  quotaOpen = false;
  isSavingQuota = false;
  quotaError = '';
  quotaMaxObjects: number | null = null;
  quotaMaxBytes: number | null = null;

  // Key Berechtigungen
  permOpen = false;
  isSavingPerm = false;
  permError = '';
  selectedKeyId = '';
  permRead = false;
  permWrite = false;
  permOwner = false;

  ngOnInit(): void {
    this.load();
    this.garageDataService.refreshKeys().subscribe();
  }

  load(): void {
    this.isLoading = true;
    this.garageDataService.getBucketDetail(this.bucketId).subscribe({
      complete: () => this.isLoading = false,
      error: () => this.isLoading = false,
    });
  }

  refresh(): void {
    this.load();
  }

  formatBytes(bytes: number): string {
    if (!bytes) return '0 B';
    const units = ['B', 'KB', 'MB', 'GB', 'TB'];
    let i = 0;
    while (bytes >= 1024 && i < units.length - 1) { bytes /= 1024; i++; }
    return bytes.toFixed(1) + ' ' + units[i];
  }

  // Quotas
  openQuota(bucket: any): void {
    this.quotaMaxObjects = bucket.quotas?.maxObjects ?? null;
    this.quotaMaxBytes = bucket.quotas?.maxSize ?? null;
    this.quotaError = '';
    this.quotaOpen = true;
  }

  closeQuota(): void {
    this.quotaOpen = false;
    this.quotaError = '';
  }

  submitQuota(): void {
    this.isSavingQuota = true;
    this.quotaError = '';

    this.bucketApi.updateBucket({
      id: this.bucketId,
      body: {
        quotas: {
          maxObjects: this.quotaMaxObjects ?? undefined,
          maxSize: this.quotaMaxBytes ?? undefined,
        }
      }
    }).pipe(
      switchMap(() => this.garageDataService.getBucketDetail(this.bucketId))
    ).subscribe({
      next: () => {
        this.isSavingQuota = false;
        this.quotaOpen = false;
        this.cdr.detectChanges();
      },
      error: (e: HttpErrorResponse) => {
        this.quotaError = 'Fehler beim Speichern der Quotas.';
        this.isSavingQuota = false;
        this.cdr.detectChanges();
      }
    });
  }

  // Key Berechtigungen
  openPerm(): void {
    this.selectedKeyId = '';
    this.permRead = false;
    this.permWrite = false;
    this.permOwner = false;
    this.permError = '';
    this.permOpen = true;
  }

  closePerm(): void {
    this.permOpen = false;
    this.permError = '';
  }

  onKeySelected(keyId: string, bucket: any): void {
    this.selectedKeyId = keyId;
    const existing = bucket.keys?.find((k: any) => k.accessKeyId === keyId);
    this.permRead = existing?.permissions?.read ?? false;
    this.permWrite = existing?.permissions?.write ?? false;
    this.permOwner = existing?.permissions?.owner ?? false;
  }

  submitPerm(): void {
    if (!this.selectedKeyId) {
      this.permError = 'Bitte einen Key auswählen.';
      return;
    }

    this.isSavingPerm = true;
    this.permError = '';

    this.permissionApi.allowBucketKey({
      body: {
        bucketId: this.bucketId,
        accessKeyId: this.selectedKeyId,
        permissions: {
          read: this.permRead,
          write: this.permWrite,
          owner: this.permOwner,
        }
      }
    }).pipe(
      switchMap(() => this.garageDataService.getBucketDetail(this.bucketId))
    ).subscribe({
      next: () => {
        this.isSavingPerm = false;
        this.permOpen = false;
        this.cdr.detectChanges();
      },
      error: () => {
        this.permError = 'Fehler beim Speichern der Berechtigungen.';
        this.isSavingPerm = false;
        this.cdr.detectChanges();
      }
    });
  }

  denyPerm(keyId: string): void {
    this.permissionApi.denyBucketKey({
      body: {
        bucketId: this.bucketId,
        accessKeyId: keyId,
        permissions: { read: true, write: true, owner: true }
      }
    }).pipe(
      switchMap(() => this.garageDataService.getBucketDetail(this.bucketId))
    ).subscribe({
      next: () => this.cdr.detectChanges(),
    });
  }
}
