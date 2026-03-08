import { Routes } from '@angular/router';
import { DashboardPage } from './dashboard-page';
import { OverviewPage } from '../dashboard/overview-page/overview-page';
import { BucketsPage } from '../dashboard/buckets-page/buckets-page';
import { BucketDetailPage } from '../dashboard/buckets-page/bucket-detail-page/bucket-detail-page';
import { KeysPage } from '../dashboard/keys-page/keys-page';
import { KeyDetailPage } from '../dashboard/keys-page/key-detail-page/key-detail-page';
import { AdminTokensPage } from '../dashboard/admin-tokens-page/admin-tokens-page';
import { NodesPage } from '../dashboard/nodes-page/nodes-page';
import { NodeDetailPage } from '../dashboard/nodes-page/node-detail-page/node-detail-page';

export const dashboardRoutes: Routes = [
  {
    path: 'dashboard',
    component: DashboardPage,
    children: [
      {
        path: '',
        redirectTo: 'overview',
        pathMatch: 'full'
      },
      {
        path: 'overview',
        component: OverviewPage
      },
      {
        path: 'buckets',
        component: BucketsPage
      },
      {
        path: 'buckets/:id',
        component: BucketDetailPage
      },
      {
        path: 'keys',
        component: KeysPage
      },
      {
        path: 'keys/:id',
        component: KeyDetailPage
      },
      {
        path: 'token',
        component: AdminTokensPage
      },
      {
        path: 'nodes',
        component: NodesPage
      },
      {
        path: 'nodes/:id',
        component: NodeDetailPage
      }
    ]
  }
];
