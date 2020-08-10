import { Injectable } from '@angular/core';
import { Subject } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class ConnectionBrokenService {

  displayLostConnectionSubject: Subject<boolean>;
  numberOfCalls = 0;

  constructor() { 
    this.displayLostConnectionSubject = new Subject<boolean>();
  }

  onConnectionBroken() {
    //inform layout component which renders overlay which atempts reconnection
    if (this.numberOfCalls === 0) { //do so only on first call
      this.displayLostConnectionSubject.next(true)
    }
    this.numberOfCalls++;
  }

  onReconnectionCanceled() {
    //destroys connection lost graphic overlay:
    this.displayLostConnectionSubject.next(false)
    this.numberOfCalls = 0; // expect future disconnects
  }

}
