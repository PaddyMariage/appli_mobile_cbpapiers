import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

import { IonicModule } from '@ionic/angular';

import { OrderValidationPageRoutingModule } from './order-validation-routing.module';

import { OrderValidationPage } from './order-validation.page';

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    IonicModule,
    OrderValidationPageRoutingModule
  ]
})
export class OrderValidationPageModule {}
