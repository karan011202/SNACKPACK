import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { MakeYourOwnPizzaPage } from './make-your-own-pizza.page';

const routes: Routes = [
  {
    path: '',
    component: MakeYourOwnPizzaPage,
  },
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class MakeYourOwnPizzaPageRoutingModule {}
