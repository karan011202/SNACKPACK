import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { RouteReuseStrategy } from '@angular/router';
import {HTTP_INTERCEPTORS, HttpClientModule} from '@angular/common/http';
import { IonicModule, IonicRouteStrategy } from '@ionic/angular';

import { AppComponent } from './app.component';
import { CartModalComponent } from './cart-modal/cart-modal.component';
import { AppRoutingModule } from './app-routing.module';
import {AuthTokenInterceptor} from './services/auth-token.interceptor';

@NgModule({
  declarations: [AppComponent],
  imports: [BrowserModule, HttpClientModule, IonicModule.forRoot(), AppRoutingModule, CartModalComponent],
  providers: [
    {provide: RouteReuseStrategy, useClass: IonicRouteStrategy},
    {provide: HTTP_INTERCEPTORS, useClass: AuthTokenInterceptor, multi: true},
  ],
  bootstrap: [AppComponent],
})
export class AppModule {}
