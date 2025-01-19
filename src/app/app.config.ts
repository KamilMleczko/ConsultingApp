import { ApplicationConfig, provideZoneChangeDetection } from '@angular/core';
import { provideRouter } from '@angular/router';
import { provideFirebaseApp, initializeApp } from '@angular/fire/app';
import { getFirestore, provideFirestore } from '@angular/fire/firestore';
import { environment } from '../enviroments/enviroment';
import { getAuth, provideAuth } from '@angular/fire/auth';


import { routes } from './app.routes';
import { provideClientHydration } from '@angular/platform-browser';



export const appConfig: ApplicationConfig = {
  providers: [provideZoneChangeDetection({ eventCoalescing: true }), provideRouter(routes), provideClientHydration(),
    provideFirebaseApp(() => initializeApp( environment.firebaseConfig )),
    provideFirestore(() => getFirestore()),
    provideAuth(() => getAuth())

  ]
};
