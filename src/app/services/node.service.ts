import { inject, Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { NodeApiService, GetClusterStatusResponse, MultiResponseLocalGetNodeInfoResponse,
  WorkerApiService, MultiResponseLocalGetWorkerInfoResponse, MultiResponseLocalListWorkersResponse,
  MultiResponseLocalCreateMetadataSnapshotResponse } from '../generated/';
import { GarageDataService } from './garage-data.service';

@Injectable({ providedIn: 'root' })
export class NodeService {
  private data = inject(GarageDataService);
  private nodeApi = inject(NodeApiService);
  private workerApi = inject(WorkerApiService);

  readonly clusterStatus$ = this.data.clusterStatus$;

  refresh(): Observable<GetClusterStatusResponse> {
    return this.data.refreshClusterStatus();
  }

  getNodeInfoById(id: string): Observable<MultiResponseLocalGetNodeInfoResponse> {
    return this.data.getNodeInfo(id);
  }

  getNodeInfoById$(id: string): Observable<MultiResponseLocalGetNodeInfoResponse | null> {
    return this.data.getNodeInfo$(id);
  }

  createMetadataSnapshot(nodeId = '*'): Observable<MultiResponseLocalCreateMetadataSnapshotResponse> {
    return this.nodeApi.createMetadataSnapshot({ node: nodeId });
  }

  listWorkers(nodeId = '*', busyOnly?: boolean, errorOnly?: boolean): Observable<MultiResponseLocalListWorkersResponse> {
    return this.workerApi.listWorkers({
      node: nodeId,
      body: { busyOnly, errorOnly }
    });
  }

  getWorkerInfo(nodeId: string, workerId: number): Observable<MultiResponseLocalGetWorkerInfoResponse> {
    return this.workerApi.getWorkerInfo({
      node: nodeId,
      body: { id: workerId }
    });
  }
}
