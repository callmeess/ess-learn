import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { ApiService } from '../api.service';
import { DashboardDto } from '../models';

@Injectable({ providedIn: 'root' })
export class DashboardService {
  constructor(private readonly api: ApiService) {}

  getDashboard(range?: string): Observable<DashboardDto> {
    return this.api.getDashboard(range);
  }
}
