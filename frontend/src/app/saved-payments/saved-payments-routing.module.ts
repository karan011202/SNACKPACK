import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { SavedPaymentsPage } from './saved-payments.page';

const routes: Routes = [
  {
    path: '',
    component: SavedPaymentsPage,
  },
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class SavedPaymentsPageRoutingModule {}
