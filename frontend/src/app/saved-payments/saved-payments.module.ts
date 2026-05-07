import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { IonicModule } from '@ionic/angular';

import { SavedPaymentsPageRoutingModule } from './saved-payments-routing.module';
import { SavedPaymentsPage } from './saved-payments.page';

@NgModule({
  imports: [CommonModule, FormsModule, IonicModule, SavedPaymentsPageRoutingModule],
  declarations: [SavedPaymentsPage],
})
export class SavedPaymentsPageModule {}
