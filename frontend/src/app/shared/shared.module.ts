import { CommonModule } from '@angular/common';
import { ModuleWithProviders, NgModule, Type } from '@angular/core';
import { LazyLoadImageModule } from 'ng-lazyload-image';

import { IconsModule } from './modules/icons/icons.module';
import { ErrorComponent } from './components/error/error.component';

const SHARED_ITEMS: Type<any>[] = [ ErrorComponent];

@NgModule({
  declarations: [...SHARED_ITEMS],
  imports: [CommonModule],
  exports: [IconsModule, LazyLoadImageModule, ...SHARED_ITEMS]
})
export class SharedModule {
  constructor() {}

  static forRoot(): ModuleWithProviders<SharedModule> {
    return { ngModule: SharedModule, providers: [] };
  }
}
