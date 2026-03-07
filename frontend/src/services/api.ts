import axios from 'axios';
import type {
  FieldDto,
  CreateFieldDto,
  PlaylistDto,
  PlaylistDetailDto,
  VideoDto,
  UpdateProgressDto,
  ProgressDto,
  ImportPlaylistDto,
  ImportResultDto,
  DashboardDto,
} from '../types';

const api = axios.create({
  baseURL: '/api',
});

// Fields
export const getFields = () => api.get<FieldDto[]>('/fields').then(r => r.data);
export const getField = (id: number) => api.get<FieldDto>(`/fields/${id}`).then(r => r.data);
export const createField = (dto: CreateFieldDto) => api.post<FieldDto>('/fields', dto).then(r => r.data);
export const updateField = (id: number, dto: CreateFieldDto) => api.put<FieldDto>(`/fields/${id}`, dto).then(r => r.data);
export const deleteField = (id: number) => api.delete(`/fields/${id}`);

// Playlists
export const getPlaylists = (fieldId?: number) =>
  api.get<PlaylistDto[]>('/playlists', { params: fieldId ? { fieldId } : {} }).then(r => r.data);
export const getPlaylist = (id: number) => api.get<PlaylistDetailDto>(`/playlists/${id}`).then(r => r.data);
export const deletePlaylist = (id: number) => api.delete(`/playlists/${id}`);

// Videos
export const getVideo = (id: number) => api.get<VideoDto>(`/videos/${id}`).then(r => r.data);
export const updateProgress = (videoId: number, dto: UpdateProgressDto) =>
  api.put<ProgressDto>(`/videos/${videoId}/progress`, dto).then(r => r.data);
export const getProgress = (videoId: number) =>
  api.get<ProgressDto>(`/videos/${videoId}/progress`).then(r => r.data);

// Import
export const importPlaylist = (dto: ImportPlaylistDto) =>
  api.post<ImportResultDto>('/import/playlist', dto).then(r => r.data);

// Dashboard
export const getDashboard = () => api.get<DashboardDto>('/dashboard').then(r => r.data);
