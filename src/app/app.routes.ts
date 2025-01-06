
import { Routes } from '@angular/router';
import { CalendarMenuComponent } from './components/calendar-menu/calendar-menu.component';
import { UserAuthenticationComponent } from './components/user-authentication/user-authentication.component';
import { HomePageComponent } from './components/home-page/home-page.component';
import { PageNotFoundComponent } from './components/page-not-found/page-not-found.component';
import { ShoppingBasketComponent } from './components/shopping-basket/shopping-basket.component';
import { AdminPanelComponent } from './components/admin-panel/admin-panel.component';
export const routes: Routes = [
    { path: '', component: HomePageComponent },
    { path: 'calendar-menu', component: CalendarMenuComponent },
    { path: 'user-authentication', component: UserAuthenticationComponent },
    { path: 'shopping-basket' , component: ShoppingBasketComponent},
    { path: 'admin-panel' , component: AdminPanelComponent},
    { path: '**', component: PageNotFoundComponent } 
];
