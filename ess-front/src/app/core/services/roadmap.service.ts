import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { ApiService } from '../api.service';
import {
  RoadmapListItemDto,
  RoadmapDetailDto,
  RoadmapNodeDto,
  CreateRoadmapDto,
  UpdateRoadmapDto,
  AddPlaylistToRoadmapDto,
  UpdateRoadmapNodeDto,
  UpdateNodeStatusDto,
  CreateRoadmapNodeDto
} from '../models';

@Injectable({ providedIn: 'root' })
export class RoadmapService {
  constructor(private readonly api: ApiService) {}

  getRoadmaps(): Observable<RoadmapListItemDto[]> {
    return this.api.getRoadmaps();
  }

  getRoadmap(id: number): Observable<RoadmapDetailDto> {
    return this.api.getRoadmap(id);
  }

  createRoadmap(dto: CreateRoadmapDto): Observable<RoadmapListItemDto> {
    return this.api.createRoadmap(dto);
  }

  updateRoadmap(id: number, dto: UpdateRoadmapDto): Observable<RoadmapListItemDto> {
    return this.api.updateRoadmap(id, dto);
  }

  deleteRoadmap(id: number): Observable<void> {
    return this.api.deleteRoadmap(id);
  }

  addPlaylistToRoadmap(roadmapId: number, dto: AddPlaylistToRoadmapDto): Observable<RoadmapNodeDto> {
    return this.api.addPlaylistToRoadmap(roadmapId, dto);
  }

  addRoadmapNode(roadmapId: number, dto: CreateRoadmapNodeDto): Observable<RoadmapNodeDto> {
    return this.api.addRoadmapNode(roadmapId, dto);
  }

  updateNodeStatus(roadmapId: number, nodeId: number, dto: UpdateNodeStatusDto): Observable<RoadmapNodeDto> {
    return this.api.updateNodeStatus(roadmapId, nodeId, dto);
  }

  updateRoadmapNode(roadmapId: number, nodeId: number, dto: UpdateRoadmapNodeDto): Observable<RoadmapNodeDto> {
    return this.api.updateRoadmapNode(roadmapId, nodeId, dto);
  }

  deleteRoadmapNode(roadmapId: number, nodeId: number): Observable<void> {
    return this.api.deleteRoadmapNode(roadmapId, nodeId);
  }
}
