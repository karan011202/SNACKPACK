import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { IonicModule } from '@ionic/angular';
import { FormsModule } from '@angular/forms';
import { HttpClientModule } from '@angular/common/http';
import { HomePage } from './home.page';
import { CartModalComponent } from '../cart-modal/cart-modal.component';

import { HomePageRoutingModule } from './home-routing.module';


@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    HttpClientModule,
    IonicModule,
    CartModalComponent,
    HomePageRoutingModule
  ],
  declarations: [HomePage]
})
export class HomePageModule {}
