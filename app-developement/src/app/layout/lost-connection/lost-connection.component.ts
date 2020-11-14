import { Component, OnInit, OnDestroy, Input } from '@angular/core';
import { ConnectionBrokenService } from 'src/app/services/connection-broken.service';
import { ConnectionProblem } from 'src/app/types/custom.types';

@Component({
  selector: 'app-lost-connection',
  templateUrl: './lost-connection.component.html',
  styleUrls: ['./lost-connection.component.scss']
})
export class LostConnectionComponent implements OnInit, OnDestroy {

  _cause;
  @Input() set cause(val: ConnectionProblem) {
    if (val === 'connection broken') {
      this._cause = 'connection broken'
      this.errorText = 'Connection with the server was lost, please try reconnecting by reloading the page.'
    } else if (val === "session expired") {
      this._cause = 'session expired'
      this.errorText = 'Your session expired, please reload the page to relogin.'
    }
  };
  errorText: string;
  secondsLeft = 20;
  pendingTimer;


  constructor(private connectionLostService: ConnectionBrokenService) {}

  ngOnInit() {
    // this.pendingTimer = setInterval(() => {
    //   this.secondsLeft--;
    //   if (this.secondsLeft === 0) {
    //     window.location.reload();
    //   }
    // }, 1000)
  }

  //not used yet/anymore:
  onCancelReconnection () {
    this.connectionLostService.onReconnectionCanceled()
  }

  ngOnDestroy(): void {
    //important especially if component gets destroyed on reconnection canceled button
    if (this.pendingTimer) clearInterval(this.pendingTimer);
  }
}
