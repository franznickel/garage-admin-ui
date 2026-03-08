import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { NodeCardComponent } from '../../../components/node-card-component/node-card-component';
import { RefreshButtonComponent } from '../../../components/refresh-button-component/refresh-button-component';
import { NodeService } from '../../../services/node.service';

@Component({
  selector: 'app-nodes-page',
  imports: [CommonModule, NodeCardComponent, RefreshButtonComponent],
  templateUrl: './nodes-page.html',
  styleUrl: './nodes-page.css',
})
export class NodesPage implements OnInit {
  private nodeService = inject(NodeService);

  status$ = this.nodeService.clusterStatus$;
  isLoading = false;

  ngOnInit(): void {
    this.load();
  }

  load(): void {
    this.isLoading = true;
    this.nodeService.refresh().subscribe({
      complete: () => this.isLoading = false,
      error: () => this.isLoading = false,
    });
  }

  refresh(): void {
    this.load();
  }
}
