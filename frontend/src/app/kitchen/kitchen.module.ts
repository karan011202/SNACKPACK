import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { IonicModule } from '@ionic/angular';
import { KitchenComponent } from './kitchen.component';
import { KitchenRoutingModule } from './kitchen-routing.module';
import { HttpClientModule } from '@angular/common/http';

@NgModule({
  imports: [CommonModule, IonicModule, KitchenRoutingModule, HttpClientModule, KitchenComponent],
})
export class KitchenPageModule {}
