import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useParams, Link, useSearchParams } from 'react-router-dom';
import { getPlaylist, updateProgress } from '../services/api';
import { formatDuration, progressPercent } from '../services/utils';
import ProgressBar from '../components/ProgressBar';
import { ArrowLeft, CheckCircle, Play, Circle } from 'lucide-react';
import { Enums } from '../types';
import ReactPlayer from 'react-player';
import { useRef, useCallback, useState, useEffect } from 'react';
import type { VideoDto } from '../types';

export default function PlaylistPage() {
  const { id } = useParams<{ id: string }>();
  const playlistId = Number(id);
  const [searchParams, setSearchParams] = useSearchParams();
  const qc = useQueryClient();

  const { data, isLoading } = useQuery({ queryKey: ['playlist', playlistId], queryFn: () => getPlaylist(playlistId) });

  const activeVideoId = searchParams.get('v') ? Number(searchParams.get('v')) : null;
  const activeVideo = data?.videos.find(v => v.id === activeVideoId) ?? null;

  const selectVideo = (v: VideoDto) => setSearchParams({ v: String(v.id) });

  const progressMut = useMutation({
    mutationFn: (p: { videoId: number; watchedSeconds: number; status: Enums.VideoStatus }) =>
      updateProgress(p.videoId, { watchedSeconds: p.watchedSeconds, status: p.status }),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['playlist', playlistId] });
      qc.invalidateQueries({ queryKey: ['dashboard'] });
    },
  });

  if (isLoading) return <div className="animate-pulse h-96 bg-gray-900 rounded-xl" />;
  if (!data) return <div className="text-red-400">Playlist not found.</div>;

  const { playlist, videos } = data;
  const pct = progressPercent(playlist.completedVideos, playlist.totalVideos);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-start gap-4">
        <Link to={`/fields/${playlist.fieldId}`} className="text-gray-500 hover:text-gray-300 mt-1">
          <ArrowLeft className="w-5 h-5" />
        </Link>
        <div className="flex-1">
          <h1 className="text-2xl font-bold">{playlist.title}</h1>
          {playlist.channelTitle && <p className="text-sm text-gray-500 mt-0.5">{playlist.channelTitle}</p>}
          <div className="flex items-center gap-2 mt-2">
            <span className="text-sm text-gray-400">{playlist.completedVideos}/{playlist.totalVideos} completed</span>
            <span className="text-sm text-gray-600">·</span>
            <span className="text-sm text-gray-400">{pct}%</span>
          </div>
          <div className="mt-2 max-w-md"><ProgressBar value={pct} size="md" /></div>
        </div>
      </div>

      <div className="flex gap-6">
        {/* Player */}
        <div className="flex-1">
          {activeVideo ? (
            <VideoPlayer
              video={activeVideo}
              onProgress={(secs) => progressMut.mutate({ videoId: activeVideo.id, watchedSeconds: secs, status: Enums.VideoStatus.InProgress })}
              onEnded={() => {
                progressMut.mutate({ videoId: activeVideo.id, watchedSeconds: activeVideo.durationSeconds, status: Enums.VideoStatus.Completed });
                // Auto-advance
                const idx = videos.findIndex(v => v.id === activeVideo.id);
                if (idx < videos.length - 1) selectVideo(videos[idx + 1]);
              }}
            />
          ) : (
            <div className="aspect-video bg-gray-900 border border-gray-800 rounded-xl flex items-center justify-center">
              <div className="text-center">
                <Play className="w-12 h-12 text-gray-700 mx-auto mb-2" />
                <p className="text-gray-500 text-sm">Select a video to start watching</p>
              </div>
            </div>
          )}
        </div>

        {/* Video List */}
        <div className="w-80 flex-shrink-0 space-y-1 max-h-[calc(100vh-200px)] overflow-y-auto">
          {videos.map((v, i) => {
            const isActive = v.id === activeVideoId;
            return (
              <button
                key={v.id}
                onClick={() => selectVideo(v)}
                className={`w-full flex items-start gap-3 p-2.5 rounded-lg text-left transition-colors ${
                  isActive ? 'bg-indigo-500/15 border border-indigo-500/30' : 'hover:bg-gray-900 border border-transparent'
                }`}
              >
                <span className="text-xs text-gray-600 mt-1 w-5 text-right flex-shrink-0">{i + 1}</span>
                <div className="relative flex-shrink-0">
                  {v.thumbnailUrl && <img src={v.thumbnailUrl} alt="" className="w-24 h-14 rounded object-cover" />}
                  <span className="absolute bottom-0.5 right-0.5 bg-black/80 text-[10px] px-1 rounded">
                    {formatDuration(v.durationSeconds)}
                  </span>
                </div>
                <div className="flex-1 min-w-0">
                  <div className="text-xs font-medium leading-tight line-clamp-2">{v.title}</div>
                  <div className="flex items-center gap-1.5 mt-1">
                    {v.status === Enums.VideoStatus.Completed ? (
                      <CheckCircle className="w-3 h-3 text-green-500" />
                    ) : v.status === Enums.VideoStatus.InProgress ? (
                      <Play className="w-3 h-3 text-indigo-400" />
                    ) : (
                      <Circle className="w-3 h-3 text-gray-700" />
                    )}
                    <span className="text-[10px] text-gray-500">
                      {v.status === Enums.VideoStatus.Completed ? 'Completed' : v.watchedSeconds > 0 ? formatDuration(v.watchedSeconds) : ''}
                    </span>
                  </div>
                </div>
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
}

function VideoPlayer({ video, onProgress, onEnded }: {
  video: VideoDto;
  onProgress: (seconds: number) => void;
  onEnded: () => void;
}) {
  const playerRef = useRef<ReactPlayer & { seekTo: (seconds: number, type?: string) => void }>(null);
  const lastSaved = useRef(0);
  const [ready, setReady] = useState(false);

  // Seek to saved position on mount/video change
  useEffect(() => {
    setReady(false);
    lastSaved.current = 0;
  }, [video.id]);

  const handleReady = useCallback(() => {
    if (video.watchedSeconds > 0 && video.status !== Enums.VideoStatus.Completed) {
      playerRef.current?.seekTo(video.watchedSeconds, 'seconds');
    }
    setReady(true);
  }, [video.watchedSeconds, video.status]);

  const handleProgress = useCallback((state: { playedSeconds: number }) => {
    const secs = Math.floor(state.playedSeconds);
    // Save every 10 seconds of real progress
    if (secs - lastSaved.current >= 10) {
      lastSaved.current = secs;
      onProgress(secs);
    }
  }, [onProgress]);

  const url = video.youtubeVideoId
    ? `https://www.youtube.com/watch?v=${video.youtubeVideoId}`
    : video.url;

  return (
    <div className="aspect-video bg-black rounded-xl overflow-hidden">
      <ReactPlayer
        ref={playerRef}
        url={url ?? ''}
        width="100%"
        height="100%"
        controls
        playing={ready}
        onReady={handleReady}
        onProgress={handleProgress as unknown as React.ReactEventHandler<HTMLVideoElement>}
        onEnded={onEnded}
        config={{
          youtube: {
            modestbranding: 1,
            rel: 0,
          },
        }}
      />
    </div>
  );
}
