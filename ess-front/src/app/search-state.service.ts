import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';

@Injectable({ providedIn: 'root' })
export class SearchStateService {
  private readonly querySubject = new BehaviorSubject<string>('');
  readonly query$ = this.querySubject.asObservable();

  setQuery(query: string): void {
    this.querySubject.next(query);
  }
}
