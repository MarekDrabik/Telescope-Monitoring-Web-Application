import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';
import { TelemetryCachePoint } from '../types/custom.types';

@Injectable() // provided for each imagery component separately
export class FocusedImageService {
  // this subject serves image to the FocusImageComponent and informs all thumbnails
  // about currently focused image at the same time
  focusedImageSubject = new BehaviorSubject<{ point: TelemetryCachePoint, userSelected: boolean }>({ point: null, userSelected: false });
}
