import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { ApiService } from '../api.service';
import { FieldDto, CreateFieldDto, UpdateFieldDto } from '../models';

@Injectable({ providedIn: 'root' })
export class FieldService {
  constructor(private readonly api: ApiService) {}

  getFields(): Observable<FieldDto[]> {
    return this.api.getFields();
  }

  getField(id: number): Observable<FieldDto> {
    return this.api.getField(id);
  }

  createField(dto: CreateFieldDto): Observable<FieldDto> {
    return this.api.createField(dto);
  }

  updateField(id: number, dto: UpdateFieldDto): Observable<FieldDto> {
    return this.api.updateField(id, dto);
  }

  deleteField(id: number): Observable<void> {
    return this.api.deleteField(id);
  }
}
