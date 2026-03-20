import { CommonModule } from '@angular/common';
import { HTTP_INTERCEPTORS, HttpClientModule } from '@angular/common/http';
import { APP_INITIALIZER, ErrorHandler, ModuleWithProviders, NgModule, Optional, SkipSelf, Type } from '@angular/core';
import { RouteReuseStrategy, RouterModule, TitleStrategy } from '@angular/router';
import { LAZYLOAD_IMAGE_HOOKS } from 'ng-lazyload-image';

import { environment } from '@env/environment';
import { SharedModule } from '@shared/shared.module';

import {
  ContentComponent,
  FooterComponent,
  HeaderComponent,
  NavbarComponent
} from './components';
import { EnsureModuleLoadedOnce } from './guards';
import { GlobalErrorHandler } from './handlers';
import { HttpErrorInterceptor } from './interceptors';
import { UserLayoutComponent } from './layouts/user-layout/user-layout.component';
import { AppInitializer } from './services';
import { AppUpdater } from './services/app-updater.service';
import { CustomPageTitleStrategy, CustomRouteReuseStrategy } from './strategies';
import { CustomLazyLoadImageStrategy } from './strategies/custom-lazyload-image.strategy';
import { APP_NAME } from './tokens/app-name';
import { ToastComponent } from './toast/toast.component';
import { JwtInterceptor } from './interceptors/jwt.interceptor';

const SHARED_ITEMS: Type<any>[] = [FooterComponent, HeaderComponent, ContentComponent, NavbarComponent];

const initializeApplication = (appInitializer: AppInitializer) => (): Promise<any> => appInitializer.initialize();


@NgModule({
  declarations: [
    // User Components
    ...SHARED_ITEMS,

    // Layouts
    UserLayoutComponent,
    NavbarComponent,

    // Toast Notification
    ToastComponent
  ],
  imports: [
    // Angular modules
    CommonModule,
    RouterModule,
    HttpClientModule,

    // Shared modules
    SharedModule
  ],
  exports: [HttpClientModule, ...SHARED_ITEMS]
})
export class CoreModule extends EnsureModuleLoadedOnce {
  constructor(@Optional() @SkipSelf() parentModule: CoreModule, private appUpdater: AppUpdater) {
    super(parentModule as NgModule);
    this.appUpdater.handleAppUpdates();
  }

  static forRoot(): ModuleWithProviders<CoreModule> {
    return {
      ngModule: CoreModule,
      providers: [
        {
          provide: APP_NAME,
          useValue: environment.appName
        },
        {
          provide: APP_INITIALIZER,
          useFactory: initializeApplication,
          deps: [AppInitializer],
          multi: true
        },
        {
          provide: ErrorHandler,
          useClass: GlobalErrorHandler
        },
        {
          provide: HTTP_INTERCEPTORS,
          useClass: JwtInterceptor,  
          multi: true
        },
        { provide: HTTP_INTERCEPTORS, 
          useClass: HttpErrorInterceptor, 
          multi: true 
        },
        {
          provide: RouteReuseStrategy,
          useClass: CustomRouteReuseStrategy
        },
        {
          provide: TitleStrategy,
          useClass: CustomPageTitleStrategy
        },
        {
          provide: LAZYLOAD_IMAGE_HOOKS,
          useClass: CustomLazyLoadImageStrategy
        }
      ]
    };
  }
}
