import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { IonicModule } from '@ionic/angular';

import { LoyaltyPointsPageRoutingModule } from './loyalty-points-routing.module';
import { LoyaltyPointsPage } from './loyalty-points.page';

@NgModule({
  imports: [CommonModule, FormsModule, IonicModule, LoyaltyPointsPageRoutingModule],
  declarations: [LoyaltyPointsPage],
})
export class LoyaltyPointsPageModule {}
