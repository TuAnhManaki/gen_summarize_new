import { NgModule } from '@angular/core';
import { ServerModule } from '@angular/platform-server';
import { NgxIsrModule } from 'ngx-isr';


import { AppComponent } from './app.component';
import { AppModule } from './app.module';

@NgModule({
  imports: [
    // Application NgModule
    AppModule,

    // SSR - Angular Universal
    ServerModule,
    NgxIsrModule.forRoot()
  ],
  bootstrap: [AppComponent]
})
export class AppServerModule {}
