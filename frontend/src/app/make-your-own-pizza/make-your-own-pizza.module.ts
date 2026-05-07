import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { IonicModule } from '@ionic/angular';

import { MakeYourOwnPizzaPageRoutingModule } from './make-your-own-pizza-routing.module';
import { MakeYourOwnPizzaPage } from './make-your-own-pizza.page';

@NgModule({
  imports: [CommonModule, FormsModule, IonicModule, MakeYourOwnPizzaPageRoutingModule],
  declarations: [MakeYourOwnPizzaPage],
})
export class MakeYourOwnPizzaPageModule {}
