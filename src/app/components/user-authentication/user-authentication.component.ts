import { Component } from '@angular/core';
import { NavbarComponent } from '../navbar/navbar.component';

@Component({
  selector: 'app-user-authentication',
  standalone: true,
  imports: [NavbarComponent],
  templateUrl: './user-authentication.component.html',
 styleUrl: './user-authentication.component.scss'
})
export class UserAuthenticationComponent {

}
