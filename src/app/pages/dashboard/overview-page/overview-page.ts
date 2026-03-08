import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ClusterService } from '../../../services/cluster.service';
import {RefreshButtonComponent} from '../../../components/refresh-button-component/refresh-button-component';

@Component({
  selector: 'app-overview-page',
  imports: [CommonModule, RefreshButtonComponent],
  templateUrl: './overview-page.html',
  styleUrl: './overview-page.css',
})
export class OverviewPage implements OnInit {
  private clusterService = inject(ClusterService);

  status$ = this.clusterService.status$;
  health$ = this.clusterService.health$;
  statistics$ = this.clusterService.statistics$;
  isLoading = false;

  ngOnInit(): void {
    this.load();
  }

  load(): void {
    this.isLoading = true;
    this.clusterService.refresh().subscribe({
      complete: () => this.isLoading = false,
      error: () => this.isLoading = false,
    });
  }

  refresh(): void {
    this.load();
  }
}
