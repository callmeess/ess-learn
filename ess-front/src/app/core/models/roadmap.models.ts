export interface RoadmapListItemDto {
  id: number;
  name: string;
  description: string | null;
  category: string;
  color: string;
  icon: string | null;
  tags: string[];
  totalNodes: number;
  completedNodes: number;
  estimatedHours: number;
  progress: number;
  createdAt: string;
}

export interface RoadmapDetailDto {
  id: number;
  name: string;
  description: string | null;
  color: string;
  nodes: RoadmapNodeDto[];
}

export interface RoadmapNodeDto {
  id: number;
  title: string;
  description: string | null;
  status: string;
  duration: string | null;
  mediaType: string;
  resourceCount: number;
  prerequisites: number[];
  positionX: number;
  positionY: number;
}

export interface CreateRoadmapDto {
  name: string;
  description?: string;
  category?: string;
  color?: string;
  icon?: string;
  tags?: string[];
}

export interface CreateRoadmapNodeDto {
  title: string;
  description?: string;
  duration?: string;
  mediaType: string;
  resourceCount: number;
  status?: string;
  prerequisiteIds?: number[];
  followingNodeId?: number;
  besideNodeId?: number;
  positionX?: number;
  positionY?: number;
}

export interface UpdateNodeStatusDto {
  status: string;
}

export interface UpdateRoadmapDto {
  name?: string;
  description?: string;
  category?: string;
  color?: string;
  icon?: string;
  tags?: string[];
}

export interface UpdateRoadmapNodeDto {
  title?: string;
  description?: string;
  duration?: string;
  mediaType?: string;
  resourceCount?: number;
}

export interface AddPlaylistToRoadmapDto {
  playlistId: number;
  afterNodeId?: number;
}
