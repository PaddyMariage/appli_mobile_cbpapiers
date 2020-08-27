import {NgModule} from '@angular/core';
import {RouterModule, Routes} from '@angular/router';

import {OrderValidationPage} from './order-validation.page';

const routes: Routes = [
    {
        path: '',
        component: OrderValidationPage
    }
];

@NgModule({
    imports: [RouterModule.forChild(routes)],
    exports: [RouterModule],
})
export class OrderValidationPageRoutingModule {
}
