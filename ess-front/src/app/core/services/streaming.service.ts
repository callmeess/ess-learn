import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { ApiService } from '../api.service';
import { StreamingStatusDto, TranscodeResultDto } from '../models';

@Injectable({ providedIn: 'root' })
export class StreamingService {
  constructor(private readonly api: ApiService) {}

  getStatus(videoId: number): Observable<StreamingStatusDto> {
    return this.api.getStreamingStatus(videoId);
  }

  forceTranscode(videoId: number): Observable<TranscodeResultDto> {
    return this.api.forceTranscode(videoId);
  }
}
