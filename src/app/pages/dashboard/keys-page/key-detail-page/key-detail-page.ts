import { Component, OnInit, inject, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute } from '@angular/router';
import { switchMap } from 'rxjs';
import { InfoCardComponent } from '../../../../components/info-card-component/info-card-component';
import { RefreshButtonComponent } from '../../../../components/refresh-button-component/refresh-button-component';
import { BucketCardComponent } from '../../../../components/bucket-card-component/bucket-card-component';
import { GarageDataService } from '../../../../services/garage-data.service';
import { AccessKeyApiService, PermissionApiService } from '../../../../generated/';

@Component({
  selector: 'app-key-detail-page',
  imports: [CommonModule, FormsModule, InfoCardComponent, RefreshButtonComponent, BucketCardComponent],
  templateUrl: './key-detail-page.html',
  styleUrl: './key-detail-page.css',
})
export class KeyDetailPage implements OnInit {
  private route = inject(ActivatedRoute);
  private garageDataService = inject(GarageDataService);
  private accessKeyApi = inject(AccessKeyApiService);
  private permissionApi = inject(PermissionApiService);
  private cdr = inject(ChangeDetectorRef);

  readonly keyId = this.route.snapshot.params['id'];
  key$ = this.garageDataService.getKeyDetail$(this.keyId);
  buckets$ = this.garageDataService.buckets$;
  isLoading = false;

  // Name bearbeiten
  nameOpen = false;
  isSavingName = false;
  nameError = '';
  newName = '';

  // Secret Key
  secretKey: string | null = null;
  isLoadingSecret = false;

  // Bucket Berechtigungen
  permOpen = false;
  isSavingPerm = false;
  permError = '';
  selectedBucketId = '';
  permRead = false;
  permWrite = false;
  permOwner = false;

  ngOnInit(): void {
    this.load();
    this.garageDataService.refreshBuckets().subscribe();
  }

  load(): void {
    this.isLoading = true;
    this.garageDataService.getKeyDetail(this.keyId).subscribe({
      complete: () => this.isLoading = false,
      error: () => this.isLoading = false,
    });
  }

  refresh(): void {
    this.secretKey = null;
    this.load();
  }

  // Name
  openName(currentName: string): void {
    this.newName = currentName;
    this.nameError = '';
    this.nameOpen = true;
  }

  closeName(): void {
    this.nameOpen = false;
    this.nameError = '';
  }

  submitName(): void {
    if (!this.newName.trim()) {
      this.nameError = 'Bitte einen Namen eingeben.';
      return;
    }

    this.isSavingName = true;
    this.nameError = '';

    this.accessKeyApi.updateKey({
      id: this.keyId,
      body: { name: this.newName.trim() }
    }).pipe(
      switchMap(() => this.garageDataService.getKeyDetail(this.keyId))
    ).subscribe({
      next: () => {
        this.isSavingName = false;
        this.nameOpen = false;
        this.cdr.detectChanges();
      },
      error: () => {
        this.nameError = 'Fehler beim Speichern des Namens.';
        this.isSavingName = false;
        this.cdr.detectChanges();
      }
    });
  }

  // Secret Key
  loadSecretKey(): void {
    this.isLoadingSecret = true;
    this.accessKeyApi.getKeyInfo({ id: this.keyId, showSecretKey: true }).subscribe({
      next: (data) => {
        this.secretKey = data.secretAccessKey ?? null;
        this.isLoadingSecret = false;
        this.cdr.detectChanges();
      },
      error: () => {
        this.isLoadingSecret = false;
        this.cdr.detectChanges();
      }
    });
  }

  hideSecretKey(): void {
    this.secretKey = null;
  }

  // Bucket Berechtigungen
  openPerm(): void {
    this.selectedBucketId = '';
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

  onBucketSelected(bucketId: string, key: any): void {
    this.selectedBucketId = bucketId;
    const existing = key.buckets?.find((b: any) => b.id === bucketId);
    this.permRead = existing?.permissions?.read ?? false;
    this.permWrite = existing?.permissions?.write ?? false;
    this.permOwner = existing?.permissions?.owner ?? false;
  }

  submitPerm(): void {
    if (!this.selectedBucketId) {
      this.permError = 'Bitte einen Bucket auswählen.';
      return;
    }

    this.isSavingPerm = true;
    this.permError = '';

    this.permissionApi.allowBucketKey({
      body: {
        bucketId: this.selectedBucketId,
        accessKeyId: this.keyId,
        permissions: {
          read: this.permRead,
          write: this.permWrite,
          owner: this.permOwner,
        }
      }
    }).pipe(
      switchMap(() => this.garageDataService.getKeyDetail(this.keyId))
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

  denyPerm(bucketId: string): void {
    this.permissionApi.denyBucketKey({
      body: {
        bucketId,
        accessKeyId: this.keyId,
        permissions: { read: true, write: true, owner: true }
      }
    }).pipe(
      switchMap(() => this.garageDataService.getKeyDetail(this.keyId))
    ).subscribe({
      next: () => this.cdr.detectChanges(),
    });
  }
}
