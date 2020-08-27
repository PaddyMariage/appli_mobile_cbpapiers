import {NgModule} from '@angular/core';
import {RouterModule, Routes} from '@angular/router';

import {SingleOrderPage} from './single-order.page';

const routes: Routes = [
    {
        path: '',
        component: SingleOrderPage
    }
];

@NgModule({
    imports: [RouterModule.forChild(routes)],
    exports: [RouterModule],
})
export class SingleOrderPageRoutingModule {
}
