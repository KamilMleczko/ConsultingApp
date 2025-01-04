import { ApplicationConfig, provideZoneChangeDetection } from '@angular/core';
import { provideRouter } from '@angular/router';
import { provideFirebaseApp, initializeApp } from '@angular/fire/app';
import { getFirestore, provideFirestore } from '@angular/fire/firestore';


import { routes } from './app.routes';
import { provideClientHydration } from '@angular/platform-browser';

const firebaseConfig = {
  apiKey: "AIzaSyBbJPUEyFu-RjvuM6YPfFY51-F3C6xA1-E",
  authDomain: "find-a-doc-77b45.firebaseapp.com",
  projectId: "find-a-doc-77b45",
  storageBucket: "find-a-doc-77b45.firebasestorage.app",
  messagingSenderId: "74683426240",
  appId: "1:74683426240:web:e6c708894a5ce6b5b31425"
};

export const appConfig: ApplicationConfig = {
  providers: [provideZoneChangeDetection({ eventCoalescing: true }), provideRouter(routes), provideClientHydration(),
    provideFirebaseApp(() => initializeApp( firebaseConfig )),
    provideFirestore(() => getFirestore())

  ]
};
