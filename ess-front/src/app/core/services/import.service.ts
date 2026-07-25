import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { ApiService } from '../api.service';
import { ImportVideoDto, ImportPlaylistDto, ImportResultDto } from '../models';

@Injectable({ providedIn: 'root' })
export class ImportService {
  constructor(private readonly api: ApiService) {}

  importVideo(dto: ImportVideoDto): Observable<ImportResultDto> {
    return this.api.importVideo(dto);
  }

  importPlaylist(dto: ImportPlaylistDto): Observable<ImportResultDto> {
    return this.api.importPlaylist(dto);
  }
}
