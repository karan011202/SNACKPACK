import { NgModule } from '@angular/core';
import { PreloadAllModules, RouterModule, Routes } from '@angular/router';
import {AuthGuard} from './guards/auth.guard';

const routes: Routes = [
  {
    path: 'home',
    loadChildren: () => import('./home/home.module').then( m => m.HomePageModule)
  },
  {
    path: 'make-your-own-pizza',
    loadChildren: () => import('./make-your-own-pizza/make-your-own-pizza.module').then( m => m.MakeYourOwnPizzaPageModule)
  },
  {
    path: 'checkout',
    loadChildren: () => import('./checkout/checkout.module').then( m => m.CheckoutPageModule)
  },
  {
    path: 'login',
    loadChildren: () => import('./login/login.module').then( m => m.LoginPageModule)
  },
  {
    path: 'order-history',
    canActivate: [AuthGuard],
    loadChildren: () => import('./order-history/order-history.module').then( m => m.OrderHistoryPageModule)
  },
  {
    path: 'order-confirmation/:orderId',
    loadChildren: () => import('./order-confirmation/order-confirmation.module').then( m => m.OrderConfirmationPageModule)
  },
  {
    path: 'saved-payments',
    canActivate: [AuthGuard],
    loadChildren: () => import('./saved-payments/saved-payments.module').then( m => m.SavedPaymentsPageModule)
  },
  {
    path: 'loyalty-points',
    canActivate: [AuthGuard],
    loadChildren: () => import('./loyalty-points/loyalty-points.module').then( m => m.LoyaltyPointsPageModule)
  },
  {
    path: '',
    redirectTo: 'home',
    pathMatch: 'full'
  },
];

@NgModule({
  imports: [
    RouterModule.forRoot(routes, { preloadingStrategy: PreloadAllModules })
  ],
  exports: [RouterModule]
})
export class AppRoutingModule { }
