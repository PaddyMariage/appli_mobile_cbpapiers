import {NgModule} from '@angular/core';
import {CommonModule} from '@angular/common';
import {FormsModule} from '@angular/forms';

import {IonicModule} from '@ionic/angular';

import {DeleteAccPageRoutingModule} from './delete-acc-routing.module';

import {DeleteAccPage} from './delete-acc.page';

@NgModule({
    imports: [
        CommonModule,
        FormsModule,
        IonicModule,
        DeleteAccPageRoutingModule
    ],
    declarations: [DeleteAccPage]
})
export class DeleteAccPageModule {
}
