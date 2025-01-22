import { Injectable } from '@angular/core';
import { Subject } from 'rxjs';

@Injectable({ providedIn: 'root' })
export class CommunicationService {
  private functionCallSource = new Subject<void>();
  functionCalled$ = this.functionCallSource.asObservable();

  notifyFunctionCall() {
    this.functionCallSource.next();
  }
}