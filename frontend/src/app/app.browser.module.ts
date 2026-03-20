import { NgModule } from '@angular/core';
import { ServiceWorkerModule } from '@angular/service-worker';
import { StateTransferInitializerModule } from '@nguniversal/common';
import { environment } from '@env/environment';

import { AppComponent } from './app.component';
import { AppModule } from './app.module';

@NgModule({
  imports: [
    // Application NgModule
    AppModule,

    // SSR - Angular Universal
    StateTransferInitializerModule,

    // PWA - Service Worker
    ServiceWorkerModule.register('ngsw-worker.js', {
      enabled: environment.production,
      registrationStrategy: 'registerWhenStable:30000'
    })
  ],
  bootstrap: [AppComponent]
})
export class AppBrowserModule {}
