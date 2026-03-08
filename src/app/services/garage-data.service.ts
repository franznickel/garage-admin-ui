import { inject, Injectable } from '@angular/core';
import { BehaviorSubject, forkJoin, Observable } from 'rxjs';
import { tap } from 'rxjs/operators';
import { ClusterApiService, ClusterLayoutApiService, BucketApiService, AccessKeyApiService, NodeApiService,
  AdminApiTokenApiService, GetClusterStatusResponse, GetClusterHealthResponse, GetClusterStatisticsResponse,
  GetClusterLayoutResponse, ListBucketsResponse, ListKeysResponse, GetBucketInfoResponse, GetKeyInfoResponse,
  ListAdminTokensResponse, MultiResponseLocalGetNodeInfoResponse } from '../generated/';

@Injectable({ providedIn: 'root' })
export class GarageDataService {
  private clusterApi = inject(ClusterApiService);
  private clusterLayoutApi = inject(ClusterLayoutApiService);
  private bucketApi = inject(BucketApiService);
  private accessKeyApi = inject(AccessKeyApiService);
  private nodeApi = inject(NodeApiService);
  private adminTokenApi = inject(AdminApiTokenApiService);

  // Cluster
  private _clusterStatus = new BehaviorSubject<GetClusterStatusResponse | null>(null);
  private _clusterHealth = new BehaviorSubject<GetClusterHealthResponse | null>(null);
  private _clusterStatistics = new BehaviorSubject<GetClusterStatisticsResponse | null>(null);
  private _clusterLayout = new BehaviorSubject<GetClusterLayoutResponse | null>(null);

  // Buckets
  private _buckets = new BehaviorSubject<ListBucketsResponse | null>(null);
  private _bucketDetails = new Map<string, BehaviorSubject<GetBucketInfoResponse | null>>();

  // Keys
  private _keys = new BehaviorSubject<ListKeysResponse | null>(null);
  private _keyDetails = new Map<string, BehaviorSubject<GetKeyInfoResponse | null>>();

  // Nodes
  private _nodeInfos = new Map<string, BehaviorSubject<MultiResponseLocalGetNodeInfoResponse | null>>();

  // Admin Tokens
  private _adminTokens = new BehaviorSubject<ListAdminTokensResponse | null>(null);

  // Timestamps
  private timestamps = new Map<string, number>();

  readonly clusterStatus$ = this._clusterStatus.asObservable();
  readonly clusterHealth$ = this._clusterHealth.asObservable();
  readonly clusterStatistics$ = this._clusterStatistics.asObservable();
  readonly clusterLayout$ = this._clusterLayout.asObservable();
  readonly buckets$ = this._buckets.asObservable();
  readonly keys$ = this._keys.asObservable();
  readonly adminTokens$ = this._adminTokens.asObservable();

  // Dashboard Initial Load

  loadDashboard(): Observable<{
    status: GetClusterStatusResponse;
    health: GetClusterHealthResponse;
    statistics: GetClusterStatisticsResponse;
    buckets: ListBucketsResponse;
    keys: ListKeysResponse;
  }> {
    return forkJoin({
      status: this.clusterApi.getClusterStatus().pipe(
        tap(data => this._clusterStatus.next(data))
      ),
      health: this.clusterApi.getClusterHealth().pipe(
        tap(data => this._clusterHealth.next(data))
      ),
      statistics: this.clusterApi.getClusterStatistics().pipe(
        tap(data => this._clusterStatistics.next(data))
      ),
      buckets: this.bucketApi.listBuckets().pipe(
        tap(data => this._buckets.next(data))
      ),
      keys: this.accessKeyApi.listKeys().pipe(
        tap(data => this._keys.next(data))
      ),
    }).pipe(
      tap(() => this.timestamps.set('dashboard', Date.now()))
    );
  }

  // Gezielte Refreshes

  refreshCluster(): Observable<{
    status: GetClusterStatusResponse;
    health: GetClusterHealthResponse;
    statistics: GetClusterStatisticsResponse;
  }> {
    return forkJoin({
      status: this.clusterApi.getClusterStatus().pipe(
        tap(data => this._clusterStatus.next(data))
      ),
      health: this.clusterApi.getClusterHealth().pipe(
        tap(data => this._clusterHealth.next(data))
      ),
      statistics: this.clusterApi.getClusterStatistics().pipe(
        tap(data => this._clusterStatistics.next(data))
      ),
    }).pipe(
      tap(() => this.timestamps.set('cluster', Date.now()))
    );
  }

  refreshLayout(): Observable<GetClusterLayoutResponse> {
    return this.clusterLayoutApi.getClusterLayout().pipe(
      tap(data => {
        this._clusterLayout.next(data);
        this.timestamps.set('layout', Date.now());
      })
    );
  }

  refreshBuckets(): Observable<ListBucketsResponse> {
    return this.bucketApi.listBuckets().pipe(
      tap(data => {
        this._buckets.next(data);
        this.timestamps.set('buckets', Date.now());
      })
    );
  }

  refreshKeys(): Observable<ListKeysResponse> {
    return this.accessKeyApi.listKeys().pipe(
      tap(data => {
        this._keys.next(data);
        this.timestamps.set('keys', Date.now());
      })
    );
  }

  refreshAdminTokens(): Observable<ListAdminTokensResponse> {
    return this.adminTokenApi.listAdminTokens().pipe(
      tap(data => {
        this._adminTokens.next(data);
        this.timestamps.set('adminTokens', Date.now());
      })
    );
  }

  refreshClusterStatus(): Observable<GetClusterStatusResponse> {
    return this.clusterApi.getClusterStatus().pipe(
      tap(data => {
        this._clusterStatus.next(data);
        this.timestamps.set('clusterStatus', Date.now());
      })
    );
  }

  // On-Demand Detail-Loads

  getBucketDetail(id: string): Observable<GetBucketInfoResponse> {
    if (!this._bucketDetails.has(id)) {
      this._bucketDetails.set(id, new BehaviorSubject<GetBucketInfoResponse | null>(null));
    }
    return this.bucketApi.getBucketInfo({ id }).pipe(
      tap(data => this._bucketDetails.get(id)!.next(data))
    );
  }

  getBucketDetail$(id: string): Observable<GetBucketInfoResponse | null> {
    if (!this._bucketDetails.has(id)) {
      this._bucketDetails.set(id, new BehaviorSubject<GetBucketInfoResponse | null>(null));
    }
    return this._bucketDetails.get(id)!.asObservable();
  }

  getKeyDetail(id: string): Observable<GetKeyInfoResponse> {
    if (!this._keyDetails.has(id)) {
      this._keyDetails.set(id, new BehaviorSubject<GetKeyInfoResponse | null>(null));
    }
    return this.accessKeyApi.getKeyInfo({ id }).pipe(
      tap(data => this._keyDetails.get(id)!.next(data))
    );
  }

  getKeyDetail$(id: string): Observable<GetKeyInfoResponse | null> {
    if (!this._keyDetails.has(id)) {
      this._keyDetails.set(id, new BehaviorSubject<GetKeyInfoResponse | null>(null));
    }
    return this._keyDetails.get(id)!.asObservable();
  }

  getNodeInfo(id: string): Observable<MultiResponseLocalGetNodeInfoResponse> {
    if (!this._nodeInfos.has(id)) {
      this._nodeInfos.set(id, new BehaviorSubject<MultiResponseLocalGetNodeInfoResponse | null>(null));
    }
    return this.nodeApi.getNodeInfo({ node: id }).pipe(
      tap(data => this._nodeInfos.get(id)!.next(data))
    );
  }

  getNodeInfo$(id: string): Observable<MultiResponseLocalGetNodeInfoResponse | null> {
    if (!this._nodeInfos.has(id)) {
      this._nodeInfos.set(id, new BehaviorSubject<MultiResponseLocalGetNodeInfoResponse | null>(null));
    }
    return this._nodeInfos.get(id)!.asObservable();
  }

  // Cache leeren

  clearAll(): void {
    this._clusterStatus.next(null);
    this._clusterHealth.next(null);
    this._clusterStatistics.next(null);
    this._clusterLayout.next(null);
    this._buckets.next(null);
    this._keys.next(null);
    this._adminTokens.next(null);
    this._bucketDetails.clear();
    this._keyDetails.clear();
    this.timestamps.clear();
  }
}
