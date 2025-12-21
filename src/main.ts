import { bootstrapApplication } from '@angular/platform-browser';
import { provideRouter } from '@angular/router';
import { provideAppHttp } from './app/core/http/http-client.provider';
import { routes } from './app/core/routing/app.routes';
import { AppComponent } from './app/app.component';

bootstrapApplication(AppComponent, {
  providers: [
    provideRouter(routes),
    provideAppHttp(),
  ],
}).catch(console.error);
