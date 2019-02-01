import { enableProdMode } from '@angular/core';
import { platformBrowserDynamic } from '@angular/platform-browser-dynamic';

import { AppModule } from './app/app.module';
import { environment } from './environments/environment';

import { AppFrontEndModule } from './app-frontend/app.module';


if (environment.production) {
  enableProdMode();
}
// platformBrowserDynamic().bootstrapModule(AppFrontEndModule)
// .catch(err => console.error(err));

platformBrowserDynamic().bootstrapModule(AppModule)
  .catch(err => console.error(err));



