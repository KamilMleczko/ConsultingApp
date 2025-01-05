import { Component } from '@angular/core';
import { RouterOutlet } from '@angular/router';

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
export class AppComponent {
}
