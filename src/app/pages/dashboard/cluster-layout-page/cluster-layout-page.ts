import { ChangeDetectorRef, Component, inject, OnInit } from '@angular/core';
import { AsyncPipe, DecimalPipe } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RefreshButtonComponent } from '../../../components/refresh-button-component/refresh-button-component';
import { InfoCardComponent } from '../../../components/info-card-component/info-card-component';
import { RoleCardComponent } from '../../../components/role-card-component/role-card-component';
import { combineLatest, switchMap } from 'rxjs';
import { GarageDataService } from '../../../services/garage-data.service';
import { NodeResp, ClusterLayoutApiService, UpdateClusterLayoutRequest, NodeRoleChangeRequest, ApplyClusterLayoutRequest } from '../../../generated/';
import { HttpErrorResponse } from '@angular/common/http';

interface NodeConfig {
  id: string;
  hostname: string;
  addr: string;
  zone: string;
  capacityGb: number;
  tagsRaw: string;
  inLayout: boolean;
  removeFromLayout: boolean;
}

@Component({
  selector: 'app-cluster-layout-page',
  imports: [AsyncPipe, FormsModule, RefreshButtonComponent, InfoCardComponent, DecimalPipe, RoleCardComponent],
  templateUrl: './cluster-layout-page.html',
  styleUrl: './cluster-layout-page.css',
})
export class ClusterLayoutPage implements OnInit {
  private garageDataService = inject(GarageDataService);
  private clusterLayoutApi = inject(ClusterLayoutApiService);
  private cdr = inject(ChangeDetectorRef);

  status$ = this.garageDataService.clusterStatus$;
  layout$ = this.garageDataService.clusterLayout$;
  combined$ = combineLatest({
    layout: this.layout$,
    status: this.status$
  });

  isLoading = false;
  setupOpen = false;
  isSubmitting = false;
  setupError = '';
  zoneRedundancy = 1;
  nodeConfigs: NodeConfig[] = [];

  ngOnInit(): void {
    this.load();
  }

  load(): void {
    this.isLoading = true;
    this.garageDataService.refreshLayoutAndStatus().subscribe({
      complete: () => this.isLoading = false,
      error: () => this.isLoading = false,
    });
  }

  refresh(): void {
    this.load();
  }

  getNodeForRole(roleId: string, nodes: NodeResp[] | undefined) {
    return nodes?.find(n => n.id === roleId);
  }

  openSetupDialog(): void {
    this.load();
    const status = this.garageDataService.getClusterStatusSnapshot();
    const layout = this.garageDataService.getClusterLayoutSnapshot();

    const layoutNodeIds = new Set((layout?.roles ?? []).map(r => r.id));
    // @ts-expect-error Weil das Format so stimmt.
    this.nodeConfigs = (status?.nodes ?? []).map(node => ({
      id: node.id,
      hostname: node.hostname,
      addr: node.addr,
      zone: node.role?.zone ?? '',
      capacityGb: node.role?.capacity ? Math.floor(node.role.capacity / 1_000_000_000) : 100,
      tagsRaw: node.role?.tags?.join(', ') ?? '',
      inLayout: layoutNodeIds.has(node.id),
      removeFromLayout: !layoutNodeIds.has(node.id),
    }));

    const zr = layout?.parameters.zoneRedundancy;
    if (typeof zr === 'string') {
      this.zoneRedundancy = this.nodeConfigs.length;
    } else {
      this.zoneRedundancy = zr?.atLeast ?? 1;
    }
    this.setupError = '';
    this.setupOpen = true;
  }

  closeSetupDialog(): void {
    this.setupOpen = false;
    this.setupError = '';
  }

  submitSetup(currentVersion: number): void {
    const hasInvalidActive = this.nodeConfigs
      .filter(n => !n.removeFromLayout)
      .some(n => !n.zone || n.capacityGb < 1);

    if (hasInvalidActive) {
      this.setupError = 'Set capacity and and zone for every active Node please.';
      return;
    }

    this.isSubmitting = true;
    this.setupError = '';

    const roles: NodeRoleChangeRequest[] = this.nodeConfigs
      .filter(n => n.inLayout || !n.removeFromLayout) // only send relevant nodes
      .map(n => {
        if (n.removeFromLayout && n.inLayout) {
          return { id: n.id, remove: true };
        }
        return {
          id: n.id,
          zone: n.zone,
          capacity: n.capacityGb * 1_000_000_000,
          tags: n.tagsRaw ? n.tagsRaw.split(',').map(t => t.trim()).filter(Boolean) : [],
        };
      });

    const updateClusterLayoutRequest: UpdateClusterLayoutRequest = {
      roles: roles,
      parameters: { zoneRedundancy: { atLeast: this.zoneRedundancy } },
    };

    const applyClusterLayoutRequest: ApplyClusterLayoutRequest = {
      version: currentVersion + 1,
    };

    this.clusterLayoutApi.updateClusterLayout({
      body: updateClusterLayoutRequest,
    }).pipe(
      switchMap(() => this.clusterLayoutApi.applyClusterLayout({ body: applyClusterLayoutRequest })),
      switchMap(() => this.garageDataService.refreshLayout()),
    ).subscribe({
      next: () => {
        this.isSubmitting = false;
        this.setupOpen = false;
        this.cdr.detectChanges();
      },
      error: (e: HttpErrorResponse) => {
        if (e.status === 400) {
          this.setupError = 'Invalid Configuration. Please check input.';
        } else if (e.status === 409) {
          this.setupError = 'Version conflict. Please reload Page.';
        } else {
          this.setupError = 'Error while creating Layout.';
        }
        this.isSubmitting = false;
        this.cdr.detectChanges();
      },
    });
  }
}
