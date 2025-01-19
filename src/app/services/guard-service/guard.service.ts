import { Router, ActivatedRouteSnapshot } from '@angular/router';
import { Injectable, OnInit, inject } from "@angular/core";
import { CanActivate, RouterStateSnapshot } from '@angular/router';
import { AuthService } from '../auth-service/auth.service';
import { Observable } from 'rxjs';
import { map, take, tap } from 'rxjs/operators';

/*
export const routes: Routes = [
    { path: '', component: HomePageComponent },
    { path: 'calendar-menu', component: CalendarMenuComponent },
    { path: 'shopping-basket' , component: ShoppingBasketComponent, canActivate: [GuardService]},
    { path: 'admin-panel' , component: AdminPanelComponent, canActivate: [GuardService]},
    { path: 'login', component: LoginComponent},
    { path: 'register', component: RegisterComponent},
    { path: '**', component: PageNotFoundComponent } 
];*/

@Injectable({
    providedIn: 'root'
})
export class GuardService implements CanActivate {
    authService: AuthService = inject(AuthService);
    router: Router = inject(Router);
  
    async canActivate(route: ActivatedRouteSnapshot, state: RouterStateSnapshot): Promise<boolean> {
      const routeName = route.routeConfig?.path;
      switch (routeName) {
        case 'admin-panel':
          return await this.canActivateAdminPanel();
        case 'login':
          return await this.canActivateLoginPage();
        case 'register':
            return await this.canActivateRegisterPage();
        case 'shopping-basket':
            return await this.canActivateShoppingBasket();
        case 'calendar-menu':
            return await this.canActivateCalendarMenu();
        default:
          return  await this.canActivateDefault();
      }
    }
  
    async canActivateAdminPanel(): Promise<boolean> {
      const user = await this.authService.currentUserSig();
      if (user && user.role === 'admin') {
        return true;
      } else {
        this.router.navigate(['/']);
        return false;
      }
    }
  
    async canActivateLoginPage(): Promise<boolean> {
      const user = await this.authService.firebaseAuth.currentUser; 
      if (user) {
        this.router.navigate(['/']);
        return false;
      } else {
        return true;
      }
    }

    async canActivateRegisterPage(): Promise<boolean> {
        const user = await this.authService.currentUserSig();
        if (user) {
          this.router.navigate(['/']);
          return false;
        } else {
          return true;
        }
      }
      async canActivateShoppingBasket(): Promise<boolean> {
        const user = await this.authService.currentUserSig();
        if (user && user.role !== 'doctor') {
          return true;
        } else {
          this.router.navigate(['/']);
          return false;
        }
      }

      async canActivateCalendarMenu(): Promise<boolean> {
        const user = await this.authService.currentUserSig();
        if (user) {
          return true;
        } else {
          this.router.navigate(['/']);
          return false;
        }
      }

  
    async canActivateDefault(): Promise<boolean> {
      return true;
    }

  }