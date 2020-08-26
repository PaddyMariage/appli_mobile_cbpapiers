import {NgModule} from '@angular/core';
import {CommonModule} from '@angular/common';
import {FormsModule} from '@angular/forms';

import {IonicModule} from '@ionic/angular';

import {AddAccPageRoutingModule} from './add-acc-routing.module';

import {AddAccPage} from './add-acc.page';

@NgModule({
    imports: [
        CommonModule,
        FormsModule,
        IonicModule,
        AddAccPageRoutingModule
    ],
    declarations: [AddAccPage]
})
export class AddAccPageModule {
}
