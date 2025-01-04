import { Component } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { AsyncPipe } from '@angular/common';
import { Injectable, inject } from '@angular/core';
import { Firestore, collection, collectionData } from '@angular/fire/firestore';
import { Observable } from 'rxjs';
import { DocumentData } from '@firebase/firestore-types';


@Component({
  selector: 'app-root',
  standalone: true,
  imports: [RouterOutlet, AsyncPipe],
  templateUrl: './app.component.html',
  styleUrl: './app.component.scss'
})
export class AppComponent {
  // firestore: Firestore = inject(Firestore);
  // items$: Observable<any[]>;

  // constructor() {
  //   const aCollection = collection(this.firestore, 'users')
  //   this.items$ = collectionData(aCollection);
  // }
  
}
