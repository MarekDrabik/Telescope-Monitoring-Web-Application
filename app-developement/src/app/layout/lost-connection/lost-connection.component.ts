import { Component, OnInit, OnDestroy } from '@angular/core';
import { ConnectionBrokenService } from 'src/app/services/connection-broken.service';

@Component({
  selector: 'app-lost-connection',
  templateUrl: './lost-connection.component.html',
  styleUrls: ['./lost-connection.component.scss']
})
export class LostConnectionComponent implements OnInit, OnDestroy {

  secondsLeft = 20;
  pendingTimer;

  constructor(private connectionLostService: ConnectionBrokenService) {}

  ngOnInit() {
    this.pendingTimer = setInterval(() => {
      this.secondsLeft--;
      if (this.secondsLeft === 0) {
        window.location.reload();
      }
    }, 1000)
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
