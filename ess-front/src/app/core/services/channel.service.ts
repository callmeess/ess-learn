import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { ApiService } from '../api.service';
import { ChannelListItemDto } from '../models';

@Injectable({ providedIn: 'root' })
export class ChannelService {
  constructor(private readonly api: ApiService) {}

  getChannels(): Observable<ChannelListItemDto[]> {
    return this.api.getChannels();
  }
}