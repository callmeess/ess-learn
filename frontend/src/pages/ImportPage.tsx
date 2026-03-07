import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { useState } from 'react';
import { importPlaylist, getFields, createField } from '../services/api';
import { Link } from 'react-router-dom';
import { Import as ImportIcon, CheckCircle, AlertCircle, Loader2, Plus } from 'lucide-react';

export default function ImportPage() {
  const qc = useQueryClient();
  const { data: fields } = useQuery({ queryKey: ['fields'], queryFn: getFields });
  const [url, setUrl] = useState('');
  const [source, setSource] = useState<'youtube' | 'offline'>('youtube');
  const [offlineManifestPath, setOfflineManifestPath] = useState('');
  const [fieldId, setFieldId] = useState<number | ''>('');
  const [newFieldName, setNewFieldName] = useState('');
  const [showNewField, setShowNewField] = useState(false);

  const createFieldMut = useMutation({
    mutationFn: createField,
    onSuccess: (field) => {
      qc.invalidateQueries({ queryKey: ['fields'] });
      setFieldId(field.id);
      setShowNewField(false);
      setNewFieldName('');
    },
  });

  const importMut = useMutation({
    mutationFn: importPlaylist,
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['fields'] });
      qc.invalidateQueries({ queryKey: ['playlists'] });
      qc.invalidateQueries({ queryKey: ['dashboard'] });
    },
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!fieldId) return;
    if (source === 'youtube' && !url.trim()) return;
    if (source === 'offline' && !offlineManifestPath.trim()) return;

    importMut.mutate({
      playlistUrl: source === 'youtube' ? url.trim() : undefined,
      fieldId: Number(fieldId),
      source,
      offlineManifestPath: source === 'offline' ? offlineManifestPath.trim() : undefined,
    });
  };

  return (
    <div className="max-w-2xl space-y-6">
      <div>
        <h1 className="text-2xl font-bold">Import Playlist</h1>
        <p className="text-gray-500 text-sm mt-1">
          Import metadata from YouTube or from an offline manifest file in the mounted volume.
        </p>
      </div>

      <form onSubmit={handleSubmit} className="bg-gray-900 border border-gray-800 rounded-xl p-6 space-y-5">
        <div>
          <label className="block text-sm font-medium text-gray-300 mb-1.5">Metadata Source</label>
          <select
            value={source}
            onChange={(e) => setSource(e.target.value as 'youtube' | 'offline')}
            className="w-full bg-gray-800 border border-gray-700 rounded-lg px-4 py-2.5 text-sm focus:outline-none focus:border-indigo-500"
          >
            <option value="youtube">Online YouTube metadata</option>
            <option value="offline">Offline manifest from mounted volume</option>
          </select>
        </div>

        {source === 'youtube' ? (
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-1.5">YouTube Playlist URL</label>
            <input
              value={url}
              onChange={e => setUrl(e.target.value)}
              placeholder="https://www.youtube.com/playlist?list=PL..."
              className="w-full bg-gray-800 border border-gray-700 rounded-lg px-4 py-2.5 text-sm focus:outline-none focus:border-indigo-500 transition-colors"
              required
            />
          </div>
        ) : (
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-1.5">Offline Manifest Path</label>
            <input
              value={offlineManifestPath}
              onChange={e => setOfflineManifestPath(e.target.value)}
              placeholder="playlists/my-course/manifest.json"
              className="w-full bg-gray-800 border border-gray-700 rounded-lg px-4 py-2.5 text-sm focus:outline-none focus:border-indigo-500 transition-colors"
              required
            />
            <p className="text-xs text-gray-500 mt-1.5">
              Path is relative to the API mounted volume root (default <code>/data</code> in Docker).
            </p>
          </div>
        )}

        <div>
          <label className="block text-sm font-medium text-gray-300 mb-1.5">Learning Field</label>
          {!showNewField ? (
            <div className="flex gap-2">
              <select
                value={fieldId}
                onChange={e => setFieldId(e.target.value ? Number(e.target.value) : '')}
                className="flex-1 bg-gray-800 border border-gray-700 rounded-lg px-4 py-2.5 text-sm focus:outline-none focus:border-indigo-500"
                required
              >
                <option value="">Select a field...</option>
                {fields?.map(f => <option key={f.id} value={f.id}>{f.name}</option>)}
              </select>
              <button
                type="button"
                onClick={() => setShowNewField(true)}
                className="flex items-center gap-1.5 bg-gray-800 border border-gray-700 hover:border-gray-600 rounded-lg px-3 py-2 text-sm text-gray-400 hover:text-gray-200 transition-colors"
              >
                <Plus className="w-4 h-4" /> New
              </button>
            </div>
          ) : (
            <div className="flex gap-2">
              <input
                value={newFieldName}
                onChange={e => setNewFieldName(e.target.value)}
                placeholder="e.g. Machine Learning"
                className="flex-1 bg-gray-800 border border-gray-700 rounded-lg px-4 py-2.5 text-sm focus:outline-none focus:border-indigo-500"
                autoFocus
              />
              <button
                type="button"
                onClick={() => { if (newFieldName.trim()) createFieldMut.mutate({ name: newFieldName.trim() }); }}
                disabled={createFieldMut.isPending}
                className="bg-indigo-600 hover:bg-indigo-500 text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors disabled:opacity-50"
              >
                Create
              </button>
              <button type="button" onClick={() => setShowNewField(false)} className="text-gray-500 hover:text-gray-300 px-2 text-sm">
                Cancel
              </button>
            </div>
          )}
        </div>

        <button
          type="submit"
          disabled={importMut.isPending || !fieldId || (source === 'youtube' ? !url.trim() : !offlineManifestPath.trim())}
          className="w-full flex items-center justify-center gap-2 bg-indigo-600 hover:bg-indigo-500 text-white py-2.5 rounded-lg text-sm font-medium transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {importMut.isPending ? (
            <>
              <Loader2 className="w-4 h-4 animate-spin" /> Importing...
            </>
          ) : (
            <>
              <ImportIcon className="w-4 h-4" /> Import Playlist
            </>
          )}
        </button>
      </form>

      {/* Success */}
      {importMut.isSuccess && importMut.data && (
        <div className="bg-green-500/10 border border-green-500/30 rounded-xl p-5 flex items-start gap-3">
          <CheckCircle className="w-5 h-5 text-green-400 mt-0.5 flex-shrink-0" />
          <div>
            <p className="font-medium text-green-400">Playlist imported successfully!</p>
            <p className="text-sm text-gray-400 mt-1">
              <strong>{importMut.data.title}</strong> — {importMut.data.videosImported} videos from {importMut.data.channelTitle}
            </p>
            <Link
              to={`/playlists/${importMut.data.playlistId}`}
              className="inline-block mt-3 text-sm text-indigo-400 hover:underline"
            >
              Go to playlist →
            </Link>
          </div>
        </div>
      )}

      {/* Error */}
      {importMut.isError && (
        <div className="bg-red-500/10 border border-red-500/30 rounded-xl p-5 flex items-start gap-3">
          <AlertCircle className="w-5 h-5 text-red-400 mt-0.5 flex-shrink-0" />
          <div>
            <p className="font-medium text-red-400">Import failed</p>
            <p className="text-sm text-gray-400 mt-1">
              {(importMut.error as { response?: { data?: { message?: string } } })?.response?.data?.message ?? 'Something went wrong. Check the playlist URL and try again.'}
            </p>
          </div>
        </div>
      )}
    </div>
  );
}
