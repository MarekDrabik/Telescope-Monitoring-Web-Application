import { Injectable } from '@angular/core';
import { Subject } from 'rxjs';
import { ConnectionProblem } from '../types/custom.types';

@Injectable({
  providedIn: 'root'
})
export class ConnectionBrokenService {

  displayLostConnectionSubject: Subject<[boolean, ConnectionProblem]>;
  numberOfCalls = 0;

  constructor() {
    this.displayLostConnectionSubject = new Subject<[boolean, ConnectionProblem]>();
  }

  onConnectionBroken() {
    //inform layout component which renders overlay which atempts reconnection
    if (this.numberOfCalls === 0) { //do so only on first call
      this.displayLostConnectionSubject.next([true, 'connection broken'])
    }
    this.numberOfCalls++;
  }

  onExpiredSession () {
    this.displayLostConnectionSubject.next([true, 'session expired'])
  }

  onReconnectionCanceled() {
    //destroys connection lost graphic overlay:
    this.displayLostConnectionSubject.next([false, 'connection broken'])
    this.numberOfCalls = 0; // expect future disconnects
  }

}
