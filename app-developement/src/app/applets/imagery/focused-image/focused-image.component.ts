import { Component, Input, OnDestroy, OnInit } from '@angular/core';
import { DomSanitizer } from '@angular/platform-browser';
import { Subscription } from 'rxjs';
import { FocusedImageService } from 'src/app/services/focused-image.service';
import { UtilitiesService } from 'src/app/services/utilities.service';
import { TelemetryCachePoint } from 'src/app/types/custom.types';
import { CurrentBrowserService } from 'src/app/services/current-browser.service';

@Component({
  selector: 'app-focused-image',
  templateUrl: './focused-image.component.html',
  styleUrls: ['./focused-image.component.scss']
})
export class FocusedImageComponent implements OnInit, OnDestroy {

  @Input() telemetryCache: TelemetryCachePoint[];
  timestamp: string;
  imageUrl: string;
  focusedImageSubscription: Subscription;
  userSelected = false;

  constructor(
    private sanitizer: DomSanitizer,
    private focusedImageService: FocusedImageService,
    private utils: UtilitiesService,
    public currentBrowserService: CurrentBrowserService
  ) {}

  ngOnInit() {
    this.focusedImageSubscription= this.focusedImageService.focusedImageSubject.subscribe(data => {
      this.userSelected = data.userSelected;
      this._renderImage(data.point); //null on app bootup
    })
  }

  onResume(event: Event) {
    event.stopPropagation()
    // on resume button, notify self and thumbnails with the most recent telemetry image:
    this.focusedImageService.focusedImageSubject.next({point: this.telemetryCache[0], userSelected: false})
  }

  private _renderImage (data) {
    if(this.imageUrl) {
      URL.revokeObjectURL(this.imageUrl)
    } //free memory from previous image
    if (!data) {
      this.imageUrl = '';
      this.timestamp = '';
    }
    else {
      // bypass cross origin errors:
      if (this.currentBrowserService.browser !== 'mozzila') {
        this.imageUrl = this.sanitizer.bypassSecurityTrustUrl(URL.createObjectURL(data[1])) as string
      } else {
        this.imageUrl = URL.createObjectURL(data[1])
      }
      let timestamp = this.utils.timestampEpochnumberToDateTime(data[0], '24')
      this.timestamp = timestamp.date + ' ' + timestamp.time;
    }
  }

  ngOnDestroy() {    
    if(this.imageUrl) {
      // as per documentation requirement:
      URL.revokeObjectURL(this.imageUrl)
    }
    if (this.focusedImageSubscription && this.focusedImageSubscription.unsubscribe) {
      this.focusedImageSubscription.unsubscribe()
    }
  }


}
