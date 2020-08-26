import {NgModule} from '@angular/core';
import {RouterModule, Routes} from '@angular/router';

import {HistoryPage} from './history.page';
import {AuthGuard} from "../../security/auth-guard.guard";

const routes: Routes = [
    {
        path: '',
        component: HistoryPage
    },
    {
        path: 'single-order',
        loadChildren: () => import('../single-order/single-order.module').then(m => m.SingleOrderPageModule),
        canActivate: [AuthGuard]
    }
];

@NgModule({
    imports: [RouterModule.forChild(routes)],
    exports: [RouterModule],
})
export class HistoryPageRoutingModule {
}
