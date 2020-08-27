import {NgModule} from '@angular/core';
import {CommonModule} from '@angular/common';
import {FormsModule} from '@angular/forms';

import {IonicModule} from '@ionic/angular';

import {AccChoicePageRoutingModule} from './acc-choice-routing.module';

import {AccChoicePage} from './acc-choice.page';

@NgModule({
    imports: [
        CommonModule,
        FormsModule,
        IonicModule,
        AccChoicePageRoutingModule
    ],
    declarations: [AccChoicePage]
})
export class AccChoicePageModule {
}
