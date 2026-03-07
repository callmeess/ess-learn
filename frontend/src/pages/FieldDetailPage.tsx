import { useQuery, useQueryClient, useMutation } from '@tanstack/react-query';
import { useParams, Link } from 'react-router-dom';
import { getField, getPlaylists, deletePlaylist } from '../services/api';
import { progressPercent, formatHours } from '../services/utils';
import ProgressBar from '../components/ProgressBar';
import { ArrowLeft, ListVideo, Trash2 } from 'lucide-react';

export default function FieldDetailPage() {
  const { id } = useParams<{ id: string }>();
  const fieldId = Number(id);
  const qc = useQueryClient();

  const { data: field } = useQuery({ queryKey: ['fields', fieldId], queryFn: () => getField(fieldId) });
  const { data: playlists, isLoading } = useQuery({ queryKey: ['playlists', fieldId], queryFn: () => getPlaylists(fieldId) });

  const deleteMut = useMutation({
    mutationFn: deletePlaylist,
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['playlists', fieldId] });
      qc.invalidateQueries({ queryKey: ['fields'] });
      qc.invalidateQueries({ queryKey: ['dashboard'] });
    },
  });

  if (isLoading) return <div className="animate-pulse h-40 bg-gray-900 rounded-xl" />;

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3">
        <Link to="/fields" className="text-gray-500 hover:text-gray-300"><ArrowLeft className="w-5 h-5" /></Link>
        <div className="flex items-center gap-3">
          {field && <div className="w-3 h-3 rounded-full" style={{ backgroundColor: field.color }} />}
          <h1 className="text-2xl font-bold">{field?.name ?? 'Field'}</h1>
        </div>
      </div>

      {playlists && playlists.length === 0 && (
        <div className="text-center py-16">
          <ListVideo className="w-12 h-12 text-gray-700 mx-auto mb-4" />
          <h2 className="text-lg font-medium text-gray-400">No playlists yet</h2>
          <p className="text-sm text-gray-600">
            <Link to="/import" className="text-indigo-400 hover:underline">Import a YouTube playlist</Link> into this field.
          </p>
        </div>
      )}

      <div className="space-y-3">
        {playlists?.map(p => {
          const pct = progressPercent(p.completedVideos, p.totalVideos);
          return (
            <Link
              key={p.id}
              to={`/playlists/${p.id}`}
              className="group flex items-center gap-4 bg-gray-900 border border-gray-800 rounded-xl p-4 hover:border-gray-700 transition-all"
            >
              {p.thumbnailUrl && (
                <img src={p.thumbnailUrl} alt="" className="w-40 h-22 rounded-lg object-cover flex-shrink-0" />
              )}
              <div className="flex-1 min-w-0">
                <div className="font-semibold truncate">{p.title}</div>
                {p.channelTitle && <div className="text-xs text-gray-500 mt-0.5">{p.channelTitle}</div>}
                <div className="flex items-center gap-4 text-xs text-gray-400 mt-2">
                  <span>{p.totalVideos} videos</span>
                  <span>{formatHours(p.totalDurationSeconds)}</span>
                  <span>{p.completedVideos}/{p.totalVideos} completed</span>
                </div>
                <div className="mt-2">
                  <ProgressBar value={pct} color={field?.color} size="sm" />
                </div>
              </div>
              <div className="flex items-center gap-3 flex-shrink-0">
                <span className="text-lg font-bold text-gray-400">{pct}%</span>
                <button
                  onClick={e => { e.preventDefault(); if (confirm(`Delete "${p.title}"?`)) deleteMut.mutate(p.id); }}
                  className="opacity-0 group-hover:opacity-100 text-gray-600 hover:text-red-400 transition-all p-1"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            </Link>
          );
        })}
      </div>
    </div>
  );
}
