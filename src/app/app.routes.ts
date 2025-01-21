
import { Routes } from '@angular/router';
import { CalendarMenuComponent } from './components/calendar-menu/calendar-menu.component';
import { HomePageComponent } from './components/home-page/home-page.component';
import { PageNotFoundComponent } from './components/page-not-found/page-not-found.component';
import { ShoppingBasketComponent } from './components/shopping-basket/shopping-basket.component';
import { AdminPanelComponent } from './components/admin-panel/admin-panel.component';
import { LoginComponent } from './components/login/login.component';
import { RegisterComponent } from './components/register/register.component';
import { GuardService } from './services/guard-service/guard.service';
import { DoctorsListComponent } from './components/doctors-list/doctors-list.component';

export const routes: Routes = [
    { path: '', component: HomePageComponent},
    { path: 'calendar-menu', component: CalendarMenuComponent, canActivate: [GuardService] },
    { path: 'shopping-basket' , component: ShoppingBasketComponent, canActivate: [GuardService]},
    { path: 'admin-panel' , component: AdminPanelComponent, canActivate: [GuardService]},
    { path: 'login', component: LoginComponent, canActivate: [GuardService]},
    { path: 'register', component: RegisterComponent, canActivate: [GuardService]},
    { path: 'doctors-list', component: DoctorsListComponent, canActivate: [GuardService]},
    { path: '**', component: PageNotFoundComponent} 
];
