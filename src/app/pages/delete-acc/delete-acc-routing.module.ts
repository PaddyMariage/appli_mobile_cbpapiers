import {NgModule} from '@angular/core';
import {RouterModule, Routes} from '@angular/router';

import {DeleteAccPage} from './delete-acc.page';

const routes: Routes = [
    {
        path: '',
        component: DeleteAccPage
    }
];

@NgModule({
    imports: [RouterModule.forChild(routes)],
    exports: [RouterModule],
})
export class DeleteAccPageRoutingModule {
}
