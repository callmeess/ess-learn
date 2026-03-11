import { useState } from "react";
import {
  BarChart,
  Bar,
  PieChart,
  Pie,
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  Cell,
} from "recharts";
import { Clock, TrendingUp, Video, CheckCircle2, Target, Calendar } from "lucide-react";
import { Card } from "../components/ui/card";
import { Badge } from "../components/ui/badge";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "../components/ui/select";

// Mock data for topics/categories
const topicData = [
  { topic: "React", hours: 45.5, videos: 28, color: "#3b82f6" },
  { topic: "TypeScript", hours: 32.3, videos: 18, color: "#8b5cf6" },
  { topic: "Docker & DevOps", hours: 28.7, videos: 15, color: "#06b6d4" },
  { topic: "Database Design", hours: 25.2, videos: 12, color: "#10b981" },
  { topic: "System Design", hours: 18.4, videos: 10, color: "#f59e0b" },
  { topic: "Clean Code", hours: 15.8, videos: 9, color: "#ef4444" },
  { topic: "Algorithms", hours: 12.3, videos: 8, color: "#ec4899" },
  { topic: "Web Security", hours: 10.5, videos: 6, color: "#6366f1" },
];

// Weekly activity data
const weeklyData = [
  { day: "Mon", hours: 3.2, videos: 2 },
  { day: "Tue", hours: 4.5, videos: 3 },
  { day: "Wed", hours: 2.8, videos: 2 },
  { day: "Thu", hours: 5.1, videos: 4 },
  { day: "Fri", hours: 3.7, videos: 2 },
  { day: "Sat", hours: 6.3, videos: 5 },
  { day: "Sun", hours: 4.9, videos: 3 },
];

// Monthly trend data
const monthlyData = [
  { month: "Sep", hours: 85.2 },
  { month: "Oct", hours: 92.5 },
  { month: "Nov", hours: 78.3 },
  { month: "Dec", hours: 105.8 },
  { month: "Jan", hours: 118.4 },
  { month: "Feb", hours: 142.7 },
  { month: "Mar", hours: 188.5 },
];

// Learning goals
const goals = [
  {
    id: "1",
    topic: "React",
    target: 50,
    current: 45.5,
    deadline: "2026-03-31",
  },
  {
    id: "2",
    topic: "TypeScript",
    target: 40,
    current: 32.3,
    deadline: "2026-03-31",
  },
  {
    id: "3",
    topic: "System Design",
    target: 30,
    current: 18.4,
    deadline: "2026-04-15",
  },
];

export function AnalyticsPage() {
  const [timeRange, setTimeRange] = useState<string>("all");

  const totalHours = topicData.reduce((sum, item) => sum + item.hours, 0);
  const totalVideos = topicData.reduce((sum, item) => sum + item.videos, 0);
  const completedVideos = 115;
  const avgWatchTime = (totalHours / totalVideos).toFixed(1);

  return (
    <div className="p-4 md:p-6 max-w-7xl mx-auto">
      {/* Header */}
      <div className="mb-6 flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Analytics</h1>
          <p className="text-gray-500">Track your learning progress and insights</p>
        </div>

        <Select value={timeRange} onValueChange={setTimeRange}>
          <SelectTrigger className="w-[180px]">
            <SelectValue placeholder="Time Range" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="week">This Week</SelectItem>
            <SelectItem value="month">This Month</SelectItem>
            <SelectItem value="quarter">This Quarter</SelectItem>
            <SelectItem value="year">This Year</SelectItem>
            <SelectItem value="all">All Time</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Stats Overview */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        <Card className="p-6">
          <div className="flex items-center justify-between mb-4">
            <div className="p-3 bg-blue-100 rounded-lg">
              <Clock className="w-6 h-6 text-blue-600" />
            </div>
            <Badge className="bg-blue-100 text-blue-700">
              <TrendingUp className="w-3 h-3 mr-1" />
              +12%
            </Badge>
          </div>
          <p className="text-3xl font-bold text-gray-900">{totalHours.toFixed(1)}h</p>
          <p className="text-sm text-gray-500 mt-1">Total Watch Time</p>
        </Card>

        <Card className="p-6">
          <div className="flex items-center justify-between mb-4">
            <div className="p-3 bg-purple-100 rounded-lg">
              <Video className="w-6 h-6 text-purple-600" />
            </div>
            <Badge className="bg-purple-100 text-purple-700">
              <TrendingUp className="w-3 h-3 mr-1" />
              +8%
            </Badge>
          </div>
          <p className="text-3xl font-bold text-gray-900">{totalVideos}</p>
          <p className="text-sm text-gray-500 mt-1">Videos Watched</p>
        </Card>

        <Card className="p-6">
          <div className="flex items-center justify-between mb-4">
            <div className="p-3 bg-green-100 rounded-lg">
              <CheckCircle2 className="w-6 h-6 text-green-600" />
            </div>
            <Badge className="bg-green-100 text-green-700">
              <TrendingUp className="w-3 h-3 mr-1" />
              +15%
            </Badge>
          </div>
          <p className="text-3xl font-bold text-gray-900">{completedVideos}</p>
          <p className="text-sm text-gray-500 mt-1">Completed Videos</p>
        </Card>

        <Card className="p-6">
          <div className="flex items-center justify-between mb-4">
            <div className="p-3 bg-orange-100 rounded-lg">
              <Target className="w-6 h-6 text-orange-600" />
            </div>
          </div>
          <p className="text-3xl font-bold text-gray-900">{avgWatchTime}h</p>
          <p className="text-sm text-gray-500 mt-1">Avg. Video Duration</p>
        </Card>
      </div>

      {/* Charts Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
        {/* Hours by Topic - Bar Chart */}
        <Card className="p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">
            Learning Hours by Topic
          </h3>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={topicData}>
              <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
              <XAxis
                dataKey="topic"
                angle={-45}
                textAnchor="end"
                height={80}
                tick={{ fontSize: 12 }}
              />
              <YAxis tick={{ fontSize: 12 }} />
              <Tooltip
                contentStyle={{
                  backgroundColor: "#fff",
                  border: "1px solid #e5e7eb",
                  borderRadius: "8px",
                }}
              />
              <Bar dataKey="hours" fill="#3b82f6" radius={[8, 8, 0, 0]}>
                {topicData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={entry.color} />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </Card>

        {/* Topic Distribution - Pie Chart */}
        <Card className="p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">
            Topic Distribution
          </h3>
          <ResponsiveContainer width="100%" height={300}>
            <PieChart>
              <Pie
                data={topicData}
                cx="50%"
                cy="50%"
                labelLine={false}
                label={({ topic, hours }) => `${topic}: ${hours}h`}
                outerRadius={90}
                fill="#8884d8"
                dataKey="hours"
              >
                {topicData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={entry.color} />
                ))}
              </Pie>
              <Tooltip
                contentStyle={{
                  backgroundColor: "#fff",
                  border: "1px solid #e5e7eb",
                  borderRadius: "8px",
                }}
              />
            </PieChart>
          </ResponsiveContainer>
        </Card>

        {/* Weekly Activity */}
        <Card className="p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">
            This Week's Activity
          </h3>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={weeklyData}>
              <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
              <XAxis dataKey="day" tick={{ fontSize: 12 }} />
              <YAxis tick={{ fontSize: 12 }} />
              <Tooltip
                contentStyle={{
                  backgroundColor: "#fff",
                  border: "1px solid #e5e7eb",
                  borderRadius: "8px",
                }}
              />
              <Legend />
              <Bar dataKey="hours" fill="#3b82f6" radius={[8, 8, 0, 0]} name="Hours" />
              <Bar dataKey="videos" fill="#8b5cf6" radius={[8, 8, 0, 0]} name="Videos" />
            </BarChart>
          </ResponsiveContainer>
        </Card>

        {/* Monthly Trend */}
        <Card className="p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Learning Trend</h3>
          <ResponsiveContainer width="100%" height={300}>
            <LineChart data={monthlyData}>
              <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
              <XAxis dataKey="month" tick={{ fontSize: 12 }} />
              <YAxis tick={{ fontSize: 12 }} />
              <Tooltip
                contentStyle={{
                  backgroundColor: "#fff",
                  border: "1px solid #e5e7eb",
                  borderRadius: "8px",
                }}
              />
              <Legend />
              <Line
                type="monotone"
                dataKey="hours"
                stroke="#3b82f6"
                strokeWidth={3}
                dot={{ r: 4 }}
                name="Hours"
              />
            </LineChart>
          </ResponsiveContainer>
        </Card>
      </div>

      {/* Topic Breakdown Table */}
      <Card className="p-6 mb-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">
          Detailed Topic Breakdown
        </h3>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-gray-200">
                <th className="text-left py-3 px-4 text-sm font-semibold text-gray-700">
                  Topic
                </th>
                <th className="text-right py-3 px-4 text-sm font-semibold text-gray-700">
                  Total Hours
                </th>
                <th className="text-right py-3 px-4 text-sm font-semibold text-gray-700">
                  Videos
                </th>
                <th className="text-right py-3 px-4 text-sm font-semibold text-gray-700">
                  Avg Duration
                </th>
                <th className="text-right py-3 px-4 text-sm font-semibold text-gray-700">
                  Percentage
                </th>
              </tr>
            </thead>
            <tbody>
              {topicData.map((topic) => (
                <tr key={topic.topic} className="border-b border-gray-100 hover:bg-gray-50">
                  <td className="py-3 px-4">
                    <div className="flex items-center gap-2">
                      <div
                        className="w-3 h-3 rounded-full"
                        style={{ backgroundColor: topic.color }}
                      />
                      <span className="font-medium text-gray-900">{topic.topic}</span>
                    </div>
                  </td>
                  <td className="text-right py-3 px-4 text-gray-700">
                    {topic.hours.toFixed(1)}h
                  </td>
                  <td className="text-right py-3 px-4 text-gray-700">
                    {topic.videos}
                  </td>
                  <td className="text-right py-3 px-4 text-gray-700">
                    {(topic.hours / topic.videos).toFixed(1)}h
                  </td>
                  <td className="text-right py-3 px-4">
                    <Badge variant="secondary">
                      {((topic.hours / totalHours) * 100).toFixed(1)}%
                    </Badge>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Card>

      {/* Learning Goals */}
      <Card className="p-6">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold text-gray-900">Learning Goals</h3>
          <Calendar className="w-5 h-5 text-gray-400" />
        </div>
        <div className="space-y-4">
          {goals.map((goal) => {
            const progress = (goal.current / goal.target) * 100;
            const daysLeft = Math.ceil(
              (new Date(goal.deadline).getTime() - new Date().getTime()) /
                (1000 * 60 * 60 * 24)
            );

            return (
              <div key={goal.id} className="border-b border-gray-100 last:border-0 pb-4 last:pb-0">
                <div className="flex items-center justify-between mb-2">
                  <div>
                    <p className="font-medium text-gray-900">{goal.topic}</p>
                    <p className="text-sm text-gray-500">
                      {goal.current}h / {goal.target}h • {daysLeft} days left
                    </p>
                  </div>
                  <Badge
                    className={
                      progress >= 100
                        ? "bg-green-100 text-green-700"
                        : progress >= 75
                        ? "bg-blue-100 text-blue-700"
                        : progress >= 50
                        ? "bg-orange-100 text-orange-700"
                        : "bg-red-100 text-red-700"
                    }
                  >
                    {progress.toFixed(0)}%
                  </Badge>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2">
                  <div
                    className={`h-2 rounded-full ${
                      progress >= 100
                        ? "bg-green-500"
                        : progress >= 75
                        ? "bg-blue-500"
                        : progress >= 50
                        ? "bg-orange-500"
                        : "bg-red-500"
                    }`}
                    style={{ width: `${Math.min(progress, 100)}%` }}
                  />
                </div>
              </div>
            );
          })}
        </div>
      </Card>
    </div>
  );
}
