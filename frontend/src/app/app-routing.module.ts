import { NgModule } from '@angular/core';
import { RouterModule, Routes, } from '@angular/router';
import { UserLayoutComponent } from './core/layouts/user-layout/user-layout.component';
import { CustomRoutePreloadingStrategy } from './core/strategies';
import { ErrorComponent } from './shared/components/error/error.component';

/**
 * t(routes.default.title, routes.default.description)
 * t(routes.welcome.title, routes.welcome.description)
 * t(routes.jokes.title, routes.jokes.description)
 */
const routes: Routes = [
  // {
  //   path: '',
  //   component: UserLayoutComponent,
  //   loadChildren: () => import('./features/home/home.module').then(m => m.HomeModule),
  //   data: {
  //     meta: {
  //       titleKey: 'routes.welcome.title',
  //       descriptionKey: 'routes.welcome.description'
  //     }
  //   }
  // },
  {
    path: 'auth',
    component: UserLayoutComponent,
    loadChildren: () => import('./features/auth/auth.module').then(m => m.AuthModule)
  },
  {
    path: 'danh-muc',
    component: UserLayoutComponent,
    loadChildren: () => import('./features/study/study.module').then(m => m.StudyModule),
  },
  {
    path: 'blog',
    component: UserLayoutComponent,
    loadChildren: () => import('./features/blog/blog.module').then(m => m.BlogModule)
  },
  {
    path: '**',
    component: ErrorComponent,
    data: {
      revalidate: 0
    }
  }
];

@NgModule({
  imports: [
    RouterModule.forRoot(
      routes,
      {
        initialNavigation: 'enabledBlocking',
        scrollPositionRestoration: 'enabled',
        preloadingStrategy: CustomRoutePreloadingStrategy
      }
    )
  ],
  exports: [RouterModule]
})
export class AppRoutingModule {}
