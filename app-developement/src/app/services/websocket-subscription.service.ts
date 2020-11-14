import { Injectable } from '@angular/core';
import { Observable, Subscription } from 'rxjs';
import { share } from 'rxjs/operators';
import { webSocket } from 'rxjs/webSocket';
import { TelemetryModel } from '../models/telemetry.model';
import { WebsocketMessageModel } from '../models/websocket-message.model';
import { TelemetrySource } from '../types/custom.types';
import { environment } from '../../environments/environment';
import { ConnectionBrokenService } from './connection-broken.service';

@Injectable({
  providedIn: 'root'
})
export class WebsocketSubscriptionService {

  static _collectors = {}; //{sourceName: collector}
  static subscriptors: { [key: string]: Observable<any> } = {}; //{sourceName: subscriptor}

  ws = webSocket({
    url: environment.serverWsUrl, //in dev: 'ws://localhost:5000/'
    binaryType: 'arraybuffer',
    /*receive binary data as arraybuffer, instead of blob.
    Useful so that we can decode timestamp and name encoded in that binary data
    without the additional Blob -> Blob.arrayBuffer() conversion*/
    deserializer: message => {
      //deserialize to object of type {name, timestamp, value} no matter the initial type
      return this.websocketMessageModel.unwrapMessageBasedOnType(message.data)
    },
    openObserver: {
      next: open => {
        // console.info("Realtime socket open.", open);
      }
    },
    closeObserver: {
      next: close => {
        if (close.code === 4001) {
          this.connectionLostService.onExpiredSession()
        }
      }
    }
  })

  subscribers = 0;
  captainSubscriber: Subscription; //dummy subscriber to ws that is
  // opening/closing the socket by subscribing/unsub. first
  UNSUB_DELAY = 3000;
  pendingCloser; //setTimeout timer

  constructor(
    private websocketMessageModel: WebsocketMessageModel,
    private telemetryModel: TelemetryModel,
    private connectionLostService: ConnectionBrokenService
  ) {

    for (let sourceName of this.telemetryModel.getAllSourceNames().concat('allPoints')) {
      /* multiplex makes it possible to have only one server connection serving multiple 'customers'.
      Each telemetry source has its own subscribe message and unsubscribe message which is delivered
      to the server on sub/unsub of that source to the socket. Messages served by the server are then
      filtered and served to each telemtrySource customer separately: */

      /*(allPoints = all sources 'telemetrySource' are always requested for table/graph applet for simplicity,
      single source functionality is available but not needed because the amount of data is very small to be
      bothered requesting them separately)*/

      WebsocketSubscriptionService.subscriptors[sourceName] = this.ws.multiplex(
        () => ({ subscribe: sourceName }), //source specific subscription message to send to server:
        () => ({ unsubscribe: sourceName }), //source specific unsubscription message to send to server on teardown
        message => message.name === sourceName //filtering logic by which received messages are handed to subscribers (applets)
      )
        //finalize is called on observable complete/error.
        // .pipe(finalize(() => console.log('Multiplex complete on:', sourceName)))

        // share operator shares this telemetrySource data stream with other applets interested in
        // the same source. There is therefore no need for multiple connections!
        .pipe(share())
    }
  }

  subscribe(sourceName: TelemetrySource | 'allPoints', callback) {
    this._socketSubscriptionManager('add')
    // subscribe to realtime websocket
    let sub = WebsocketSubscriptionService.subscriptors[sourceName].subscribe(
      callback,
      error => {
        // error.code === 1006 on realtime disconnect,
        console.error("Error, disconnected from realtime update.", error)
        this.connectionLostService.onConnectionBroken()
      }
    )
    sub.add(() => { // rxjs function adds teardown function that will be called on unsubscription
      this._socketSubscriptionManager('remove')
    })
    return sub;
  }

  // keeps count of subscribers and subs/unsubs captain subscriber
  private _socketSubscriptionManager(action: 'add' | 'remove') {
    const UNSUB_DELAY = 3000;
    if (action === 'add') {
      //we have new subscriber, so cancel pending unsubscription (if there is any)
      if (this.pendingCloser) {
        clearInterval(this.pendingCloser)
        this.pendingCloser = null;
      }
      if (!this.captainSubscriber) { //means there is no connection, so open it by subscribing the captain:
        // console.log("Subscribing captain subscriber, it's suppose to be on fresh connection!")
        this.captainSubscriber = this.ws.subscribe() //just a dummy subscription to open socket connection
        // this.captainSubscriber.add(() => { console.log("No subscriber on the socket for some time, closing the socket.") })
      }
      this.subscribers++;
    }
    if (action === 'remove') {
      if (--this.subscribers < 0) { console.error("No subscriber to pop from list. There was suppose to be at least one!") }
      if (this.subscribers === 0) { //if this was the last subscriber, then we will close the socket in few seconds
        // (if no other subscriber comes back in a meanwhile)
        // this delay is important because otherwise dropped connection prematuraly was causing problems
        this.pendingCloser = setTimeout(() => {
          this.captainSubscriber.unsubscribe()
          this.captainSubscriber = null; //for if test
        }, UNSUB_DELAY)
      }
    }
  }
}
