import { Component, Input, OnDestroy, OnInit } from '@angular/core';
import { DomSanitizer } from '@angular/platform-browser';
import { Subscription } from 'rxjs';
import { FocusedImageService } from 'src/app/services/focused-image.service';
import { UtilitiesService } from 'src/app/services/utilities.service';
import { TelemetryCachePoint } from 'src/app/types/custom.types';

@Component({
  selector: 'app-thumbnail',
  templateUrl: './thumbnail.component.html',
  styleUrls: ['./thumbnail.component.scss']
})
export class ThumbnailComponent implements OnInit, OnDestroy {
  @Input() telemetry: TelemetryCachePoint;
  datePart = '';
  timePart = '';
  imageUrl: string;
  selected = false;
  focuseImageSubscription: Subscription;

  constructor(
    private sanitizer: DomSanitizer,
    private utilitiesService: UtilitiesService,
    //parent's instance focusedImageService (this one imagery app), not root instance
    private focusedImageService: FocusedImageService 
  ) { }

  ngOnInit() {
    this._renderImage()
    this.focuseImageSubscription = this.focusedImageService.focusedImageSubject.subscribe(data => {
      if (data.point) { //null/undefined on init and when no image available
        if(+data.point[0] === +this.telemetry[0]){
          this.selected = true;
        }
        else {
          this.selected = false;
        } // unselect all other thumbnails
      }
    })
  }

  onClick(event: Event) {
    event.stopPropagation()
    //focus this thumbnail on user cklick
    this.focusedImageService.focusedImageSubject.next({
      point: this.telemetry, userSelected: true
    })
  }

  private _renderImage() {
    this.imageUrl = this.sanitizer.bypassSecurityTrustUrl(URL.createObjectURL(this.telemetry[1])) as string;
    let timestamp = this.utilitiesService.timestampEpochnumberToDateTime(+this.telemetry[0], '24');
    this.datePart = timestamp.date
    this.timePart = timestamp.time
  }

  ngOnDestroy() {
    URL.revokeObjectURL(this.imageUrl)
    if (this.focuseImageSubscription && this.focuseImageSubscription.unsubscribe) {
      this.focuseImageSubscription.unsubscribe()
    }
  }
}
