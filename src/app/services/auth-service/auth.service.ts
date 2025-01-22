import { Injectable, OnInit, inject } from '@angular/core';
import {Auth, createUserWithEmailAndPassword, updateProfile, signInWithEmailAndPassword, 
  user, signOut, getAuth, deleteUser, browserSessionPersistence, browserLocalPersistence,
  inMemoryPersistence, Persistence, onAuthStateChanged, User as FirebaseUser } from '@angular/fire/auth';
import { User } from '../../interfaces/firestoreTypes';
import { from, Observable, switchMap } from 'rxjs';
import { signal } from '@angular/core';
import { Firestore, doc, setDoc } from '@angular/fire/firestore';
import { DataBaseFacadeService } from '../data-base-facade-service/data-base-facade.service';
import { map } from 'rxjs';
@Injectable({
  providedIn: 'root'
})
export class AuthService {
    firebaseAuth = inject(Auth);
    dbFacade = inject(DataBaseFacadeService);
    user$ = user(this.firebaseAuth);
    currentUserSig = signal<User | null | undefined>(undefined);
   
    private readonly persistenceMap = {
      'LOCAL': browserLocalPersistence,
      'SESSION': browserSessionPersistence,
      'NONE': inMemoryPersistence
    };
   
    constructor() {
      const globalPersistence = typeof window !== 'undefined' ? localStorage?.getItem('authPersistence') as 'LOCAL' | 'SESSION' | 'NONE' || 'LOCAL' : null;
      if (globalPersistence) {
        this.setPersistence(globalPersistence);
      }
    }

    async setPersistence(persistenceType: 'LOCAL' | 'SESSION' | 'NONE'): Promise<void> {
      await this.firebaseAuth.setPersistence(this.persistenceMap[persistenceType]);
      localStorage.setItem('authPersistence', persistenceType);
    }

    register(
        email: string,
        password: string,
        userData: Omit<User, 'createdAt'>
      ): Observable<void> {
        return from(createUserWithEmailAndPassword(
          this.firebaseAuth,
          email,
          password
        )).pipe(
          switchMap(async (credential) => {
            await Promise.all([
              updateProfile(credential.user, { displayName: userData.displayName }),
              this.dbFacade.addUserWithId(credential.user.uid, userData)
            ]);
          })
        );
      }


      
    login(
        email: string,
        password: string
    ): Observable<void> {
        const promise = signInWithEmailAndPassword(
            this.firebaseAuth,
            email, 
            password
        ).then(() => {}); 
        return from(promise);
        
    }


    logout(): Observable<void> {
        const promise = signOut(this.firebaseAuth)
        return from(promise);
    }

    
  
    
}