import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Link } from 'react-router-dom';
import { getFields, createField, deleteField } from '../services/api';
import { progressPercent, formatHours } from '../services/utils';
import ProgressBar from '../components/ProgressBar';
import { Plus, Trash2, FolderOpen } from 'lucide-react';
import { useState } from 'react';

export default function FieldsPage() {
  const qc = useQueryClient();
  const { data: fields, isLoading } = useQuery({ queryKey: ['fields'], queryFn: getFields });
  const [showCreate, setShowCreate] = useState(false);
  const [name, setName] = useState('');
  const [color, setColor] = useState('#6366f1');

  const createMut = useMutation({
    mutationFn: createField,
    onSuccess: () => { qc.invalidateQueries({ queryKey: ['fields'] }); setShowCreate(false); setName(''); },
  });

  const deleteMut = useMutation({
    mutationFn: deleteField,
    onSuccess: () => { qc.invalidateQueries({ queryKey: ['fields'] }); qc.invalidateQueries({ queryKey: ['dashboard'] }); },
  });

  if (isLoading) return <div className="animate-pulse space-y-4">{[1, 2, 3].map(i => <div key={i} className="h-20 bg-gray-900 rounded-xl" />)}</div>;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Learning Fields</h1>
          <p className="text-gray-500 text-sm mt-1">Organize your playlists by topic</p>
        </div>
        <button
          onClick={() => setShowCreate(!showCreate)}
          className="flex items-center gap-2 bg-indigo-600 hover:bg-indigo-500 text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors"
        >
          <Plus className="w-4 h-4" /> New Field
        </button>
      </div>

      {showCreate && (
        <form
          onSubmit={e => { e.preventDefault(); if (name.trim()) createMut.mutate({ name: name.trim(), color }); }}
          className="flex items-end gap-3 bg-gray-900 border border-gray-800 rounded-xl p-4"
        >
          <div className="flex-1">
            <label className="block text-xs text-gray-500 mb-1">Name</label>
            <input
              value={name}
              onChange={e => setName(e.target.value)}
              placeholder="e.g. Machine Learning"
              className="w-full bg-gray-800 border border-gray-700 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-indigo-500"
              autoFocus
            />
          </div>
          <div>
            <label className="block text-xs text-gray-500 mb-1">Color</label>
            <input type="color" value={color} onChange={e => setColor(e.target.value)} className="w-10 h-9 rounded cursor-pointer bg-transparent" />
          </div>
          <button type="submit" disabled={createMut.isPending} className="bg-indigo-600 hover:bg-indigo-500 text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors disabled:opacity-50">
            {createMut.isPending ? 'Creating...' : 'Create'}
          </button>
        </form>
      )}

      {fields && fields.length === 0 && !showCreate && (
        <div className="text-center py-20">
          <FolderOpen className="w-12 h-12 text-gray-700 mx-auto mb-4" />
          <h2 className="text-lg font-medium text-gray-400">No fields yet</h2>
          <p className="text-sm text-gray-600">Create a field to start organizing your playlists.</p>
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
        {fields?.map(f => {
          const pct = progressPercent(f.completedVideos, f.videoCount);
          return (
            <Link
              key={f.id}
              to={`/fields/${f.id}`}
              className="group bg-gray-900 border border-gray-800 rounded-xl p-5 hover:border-gray-700 transition-all"
            >
              <div className="flex items-start justify-between mb-4">
                <div className="flex items-center gap-3">
                  <div className="w-3 h-3 rounded-full" style={{ backgroundColor: f.color }} />
                  <span className="font-semibold">{f.name}</span>
                </div>
                <button
                  onClick={e => { e.preventDefault(); if (confirm(`Delete "${f.name}"?`)) deleteMut.mutate(f.id); }}
                  className="opacity-0 group-hover:opacity-100 text-gray-600 hover:text-red-400 transition-all p-1"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                </button>
              </div>
              <div className="grid grid-cols-3 gap-3 text-center mb-4">
                <div>
                  <div className="text-lg font-bold">{f.playlistCount}</div>
                  <div className="text-xs text-gray-500">Playlists</div>
                </div>
                <div>
                  <div className="text-lg font-bold">{f.videoCount}</div>
                  <div className="text-xs text-gray-500">Videos</div>
                </div>
                <div>
                  <div className="text-lg font-bold">{formatHours(f.totalDurationSeconds)}</div>
                  <div className="text-xs text-gray-500">Duration</div>
                </div>
              </div>
              <div className="flex justify-between text-xs text-gray-500 mb-1.5">
                <span>{f.completedVideos}/{f.videoCount} completed</span>
                <span>{pct}%</span>
              </div>
              <ProgressBar value={pct} color={f.color} size="md" />
            </Link>
          );
        })}
      </div>
    </div>
  );
}
