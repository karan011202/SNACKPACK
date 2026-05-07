import {NgModule} from '@angular/core';
import {CommonModule} from '@angular/common';
import {IonicModule} from '@ionic/angular';

import {OrderConfirmationPageRoutingModule} from './order-confirmation-routing.module';
import {OrderConfirmationPage} from './order-confirmation.page';

@NgModule({
  imports: [CommonModule, IonicModule, OrderConfirmationPageRoutingModule],
  declarations: [OrderConfirmationPage],
})
export class OrderConfirmationPageModule {}
