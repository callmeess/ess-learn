import { useQuery } from '@tanstack/react-query';
import { Link } from 'react-router-dom';
import { getDashboard } from '../services/api';
import { formatHours, progressPercent } from '../services/utils';
import StatCard from '../components/StatCard';
import ProgressBar from '../components/ProgressBar';
import { BookOpen, ListVideo, Play, CheckCircle, Clock, TrendingUp } from 'lucide-react';

export default function DashboardPage() {
  const { data, isLoading, error } = useQuery({ queryKey: ['dashboard'], queryFn: getDashboard });

  if (isLoading) return <LoadingSkeleton />;
  if (error || !data) return <div className="text-red-400">Failed to load dashboard.</div>;

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-2xl font-bold">Dashboard</h1>
        <p className="text-gray-500 text-sm mt-1">Your learning progress at a glance</p>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-4">
        <StatCard label="Fields" value={data.totalFields} icon={<BookOpen className="w-4 h-4" />} />
        <StatCard label="Playlists" value={data.totalPlaylists} icon={<ListVideo className="w-4 h-4" />} />
        <StatCard label="Videos" value={data.totalVideos} icon={<Play className="w-4 h-4" />} />
        <StatCard label="Completed" value={data.completedVideos} icon={<CheckCircle className="w-4 h-4" />} />
        <StatCard label="Watch Time" value={formatHours(data.watchedSeconds)} icon={<Clock className="w-4 h-4" />} sub={`of ${formatHours(data.totalDurationSeconds)}`} />
        <StatCard label="Progress" value={`${data.overallProgress}%`} icon={<TrendingUp className="w-4 h-4" />} />
      </div>

      {/* Fields Progress */}
      {data.fields.length > 0 && (
        <section>
          <h2 className="text-lg font-semibold mb-4">Fields Progress</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
            {data.fields.map(f => (
              <Link
                key={f.id}
                to={`/fields/${f.id}`}
                className="bg-gray-900 border border-gray-800 rounded-xl p-5 hover:border-gray-700 transition-colors"
              >
                <div className="flex items-center gap-3 mb-3">
                  <div className="w-3 h-3 rounded-full" style={{ backgroundColor: f.color }} />
                  <span className="font-medium">{f.name}</span>
                </div>
                <div className="flex justify-between text-sm text-gray-400 mb-2">
                  <span>{f.playlistCount} playlists · {f.videoCount} videos</span>
                  <span>{f.progress}%</span>
                </div>
                <ProgressBar value={f.progress} color={f.color} size="md" />
              </Link>
            ))}
          </div>
        </section>
      )}

      {/* Recently Watched */}
      {data.recentlyWatched.length > 0 && (
        <section>
          <h2 className="text-lg font-semibold mb-4">Recently Watched</h2>
          <div className="space-y-2">
            {data.recentlyWatched.map(v => (
              <div key={v.videoId} className="flex items-center gap-4 bg-gray-900 border border-gray-800 rounded-lg p-3">
                {v.thumbnailUrl && (
                  <img src={v.thumbnailUrl} alt="" className="w-28 h-16 rounded object-cover flex-shrink-0" />
                )}
                <div className="flex-1 min-w-0">
                  <div className="font-medium text-sm truncate">{v.title}</div>
                  <div className="text-xs text-gray-500 mt-0.5">{v.playlistTitle}</div>
                </div>
                <div className="text-xs text-gray-500 flex-shrink-0">
                  {formatHours(v.watchedSeconds)} / {formatHours(v.durationSeconds)}
                </div>
              </div>
            ))}
          </div>
        </section>
      )}

      {data.totalFields === 0 && (
        <div className="text-center py-20">
          <BookOpen className="w-12 h-12 text-gray-700 mx-auto mb-4" />
          <h2 className="text-lg font-medium text-gray-400">No learning fields yet</h2>
          <p className="text-gray-600 text-sm mt-1">
            <Link to="/import" className="text-indigo-400 hover:underline">Import a YouTube playlist</Link> to get started.
          </p>
        </div>
      )}
    </div>
  );
}

function LoadingSkeleton() {
  return (
    <div className="space-y-8 animate-pulse">
      <div><div className="h-8 w-40 bg-gray-800 rounded" /></div>
      <div className="grid grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-4">
        {Array.from({ length: 6 }).map((_, i) => (
          <div key={i} className="bg-gray-900 border border-gray-800 rounded-xl p-5 h-24" />
        ))}
      </div>
    </div>
  );
}
