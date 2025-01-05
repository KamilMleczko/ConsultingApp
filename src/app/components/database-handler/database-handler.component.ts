import { Component } from '@angular/core';
import { Observable } from 'rxjs';
import { DocumentData } from '@firebase/firestore-types';
import { Firestore, collection, addDoc, doc, setDoc } from '@angular/fire/firestore';
import { DataBaseInitService } from '../../services/data-base-init/data-base-init.service';
import { Injectable, inject } from '@angular/core';
import { NavbarComponent } from "../navbar/navbar.component";

@Injectable({
  providedIn: 'root'
})
@Component({
  selector: 'app-database-handler',
  standalone: true,
  imports: [NavbarComponent],
  templateUrl: './database-handler.component.html',
  styleUrl: './database-handler.component.scss'
})
export class DatabaseHandlerComponent {
  firestore: Firestore = inject(Firestore);
  // items$: Observable<any[]>;

  // constructor() {
  //   const aCollection = collection(this.firestore, 'users')
  //   this.items$ = collectionData(aCollection);
  // }
  dbInit = inject(DataBaseInitService);
  async initializeDatabase() {
    console.log('Initializing database...');
    try {
      await this.dbInit.createSampleData();
      console.log('Sample data created successfully');
      alert('Sample data created successfully');
    } catch (error) {
      console.error('Error creating sample data:', error);
      alert('Error creating sample data');
    }
  }

  async deleteAllData() {
    console.log('Deleting all data...');
    try {
      await this.dbInit.deleteAllData();
      console.log('All data deleted successfully');
      alert('All data deleted successfully');
    } catch (error) {
      console.error('Error deleting data:', error);
      alert('Error deleting data');
    }
  }
}