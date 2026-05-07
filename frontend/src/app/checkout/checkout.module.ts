import { NgModule } from '@angular/core';
import { HttpClientModule } from '@angular/common/http';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { IonicModule } from '@ionic/angular';

import { CheckoutPageRoutingModule } from './checkout-routing.module';
import { CheckoutPage } from './checkout.page';

@NgModule({
  imports: [CommonModule, FormsModule, IonicModule, CheckoutPageRoutingModule, HttpClientModule],
  declarations: [CheckoutPage],
})
export class CheckoutPageModule {}