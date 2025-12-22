import { ApplicationConfig } from '@angular/core';
import { provideRouter } from '@angular/router';

import { routes } from './app.routes';
import {authBearerInterceptor} from "./core/http/http-client.provider";
import {provideHttpClient, withInterceptors} from "@angular/common/http";

export const appConfig: ApplicationConfig = {
  providers: [provideRouter(routes),

    // AQUÍ ESTÁ LA SOLUCIÓN DEL 401:
    // Debes registrar el interceptor explícitamente
    provideHttpClient(
      withInterceptors([authBearerInterceptor])
    ),]
};
