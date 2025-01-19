import { GuardService } from './services/guard-service/guard.service';
import { user } from '@angular/fire/auth';
import { AuthService } from './services/auth-service/auth.service';
import { Component, OnInit } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { DataBaseFacadeService } from './services/data-base-facade-service/data-base-facade.service';
import { Injectable, inject } from '@angular/core';

@Injectable({
  providedIn: 'root'
})
@Component({
  selector: 'app-root',
  standalone: true,
  imports: [RouterOutlet],
  templateUrl: './app.component.html',
  styleUrl: './app.component.scss'
})
export class AppComponent implements OnInit {
  title = 'consulting-app';
  authService = inject(AuthService);
  dbFacade = inject(DataBaseFacadeService);
  guard = inject(GuardService);
  ngOnInit(): void {
    this.authService.user$.subscribe(async (user) => {
      if (user) {
        try {
          const userData = await this.dbFacade.getUserById(user.uid);
          if (userData) {
            this.authService.currentUserSig.set(userData);
            console.log('User data:', userData);
          } else {
            this.authService.currentUserSig.set(null);
          }
        } catch (error) {
          console.error('Error fetching user data:', error);
          this.authService.currentUserSig.set(null);
        }
      } else {
        //User is signed out
        this.authService.currentUserSig.set(null);
      }
    });
  }
  
}
