import { useState } from "react";
import { Calendar as CalendarIcon, ChevronLeft, ChevronRight, Plus, Clock, CheckCircle2, AlertCircle, Square, CheckSquare } from "lucide-react";
import { Button } from "../components/ui/button";
import { Card } from "../components/ui/card";
import { Badge } from "../components/ui/badge";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "../components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "../components/ui/select";
import { toast } from "sonner";
import { cn } from "../components/ui/utils";

interface ScheduledVideo {
  id: string;
  videoId: string;
  title: string;
  channel: string;
  duration: string;
  date: string;
  status: "completed" | "scheduled" | "missed";
  topic: string;
}

// Mock scheduled videos
const mockSchedule: ScheduledVideo[] = [
  {
    id: "1",
    videoId: "1",
    title: "React Hooks Deep Dive",
    channel: "Web Dev Simplified",
    duration: "1:45:30",
    date: "2026-03-08",
    status: "completed",
    topic: "React",
  },
  {
    id: "2",
    videoId: "2",
    title: "TypeScript Advanced Types",
    channel: "Matt Pocock",
    duration: "2:15:20",
    date: "2026-03-07",
    status: "completed",
    topic: "TypeScript",
  },
  {
    id: "3",
    videoId: "3",
    title: "Docker Compose Tutorial",
    channel: "TechWorld with Nana",
    duration: "1:30:45",
    date: "2026-03-09",
    status: "scheduled",
    topic: "DevOps",
  },
  {
    id: "4",
    videoId: "4",
    title: "System Design Basics",
    channel: "Gaurav Sen",
    duration: "0:55:20",
    date: "2026-03-10",
    status: "scheduled",
    topic: "System Design",
  },
  {
    id: "5",
    videoId: "5",
    title: "Database Indexing",
    channel: "Hussein Nasser",
    duration: "1:20:15",
    date: "2026-03-06",
    status: "missed",
    topic: "Database",
  },
  {
    id: "6",
    videoId: "6",
    title: "Clean Architecture Principles",
    channel: "Uncle Bob",
    duration: "2:00:00",
    date: "2026-03-11",
    status: "scheduled",
    topic: "Clean Code",
  },
];

// Mock available videos for scheduling
const availableVideos = [
  { id: "v1", title: "React Server Components", duration: "1:30:00", topic: "React" },
  { id: "v2", title: "Next.js 14 Tutorial", duration: "2:10:30", topic: "React" },
  { id: "v3", title: "Kubernetes Basics", duration: "1:45:20", topic: "DevOps" },
  { id: "v4", title: "PostgreSQL Performance", duration: "1:15:40", topic: "Database" },
];

export function SchedulePage() {
  const [currentDate, setCurrentDate] = useState(new Date());
  const [schedule, setSchedule] = useState<ScheduledVideo[]>(mockSchedule);
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [selectedDate, setSelectedDate] = useState<string>("");
  const [selectedVideo, setSelectedVideo] = useState<string>("");
  const [viewMode, setViewMode] = useState<"calendar" | "list">("calendar");
  const [calendarView, setCalendarView] = useState<"day" | "week" | "month">("month");

  // Get calendar days for current month
  const getCalendarDays = () => {
    const year = currentDate.getFullYear();
    const month = currentDate.getMonth();
    const firstDay = new Date(year, month, 1);
    const lastDay = new Date(year, month + 1, 0);
    const daysInMonth = lastDay.getDate();
    const startingDayOfWeek = firstDay.getDay();

    const days: (Date | null)[] = [];

    // Add empty slots for days before month starts
    for (let i = 0; i < startingDayOfWeek; i++) {
      days.push(null);
    }

    // Add all days in month
    for (let i = 1; i <= daysInMonth; i++) {
      days.push(new Date(year, month, i));
    }

    return days;
  };

  // Get days for week view
  const getWeekDays = () => {
    const curr = new Date(currentDate);
    const first = curr.getDate() - curr.getDay();
    const days: Date[] = [];
    
    for (let i = 0; i < 7; i++) {
      const date = new Date(curr.setDate(first + i));
      days.push(new Date(date));
    }
    
    return days;
  };

  // Get single day
  const getSingleDay = () => {
    return [new Date(currentDate)];
  };

  const getDaySchedule = (date: Date | null) => {
    if (!date) return [];
    const dateStr = date.toISOString().split("T")[0];
    return schedule.filter((item) => item.date === dateStr);
  };

  const handlePreviousMonth = () => {
    setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() - 1, 1));
  };

  const handleNextMonth = () => {
    setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 1));
  };

  const handleAddToSchedule = () => {
    if (!selectedVideo || !selectedDate) {
      toast.error("Please select a video and date");
      return;
    }

    const video = availableVideos.find((v) => v.id === selectedVideo);
    if (!video) return;

    const newScheduleItem: ScheduledVideo = {
      id: `schedule-${Date.now()}`,
      videoId: video.id,
      title: video.title,
      channel: "Channel Name",
      duration: video.duration,
      date: selectedDate,
      status: "scheduled",
      topic: video.topic,
    };

    setSchedule([...schedule, newScheduleItem]);
    setIsAddDialogOpen(false);
    setSelectedVideo("");
    setSelectedDate("");
    toast.success("Video added to schedule");
  };

  const handleMarkComplete = (id: string) => {
    setSchedule(
      schedule.map((item) =>
        item.id === id ? { ...item, status: "completed" as const } : item
      )
    );
    toast.success("Marked as completed");
  };

  const handleRemove = (id: string) => {
    setSchedule(schedule.filter((item) => item.id !== id));
    toast.success("Removed from schedule");
  };

  const monthYear = currentDate.toLocaleDateString("en-US", {
    month: "long",
    year: "numeric",
  });

  const today = new Date().toISOString().split("T")[0];

  const stats = {
    scheduled: schedule.filter((s) => s.status === "scheduled").length,
    completed: schedule.filter((s) => s.status === "completed").length,
    missed: schedule.filter((s) => s.status === "missed").length,
  };

  return (
    <div className="p-4 md:p-6 max-w-7xl mx-auto">
      {/* Header */}
      <div className="mb-6 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Learning Schedule</h1>
          <p className="text-gray-500">Plan and track your daily learning activities</p>
        </div>

        <div className="flex gap-2">
          <Button
            variant={viewMode === "calendar" ? "default" : "outline"}
            size="sm"
            onClick={() => setViewMode("calendar")}
          >
            <CalendarIcon className="w-4 h-4 mr-2" />
            Calendar
          </Button>
          <Button
            variant={viewMode === "list" ? "default" : "outline"}
            size="sm"
            onClick={() => setViewMode("list")}
          >
            List
          </Button>
          <Button onClick={() => setIsAddDialogOpen(true)}>
            <Plus className="w-4 h-4 mr-2" />
            Schedule Video
          </Button>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-6">
        <Card className="p-4">
          <div className="flex items-center gap-3">
            <div className="p-3 bg-blue-100 rounded-lg">
              <Clock className="w-6 h-6 text-blue-600" />
            </div>
            <div>
              <p className="text-2xl font-bold text-gray-900">{stats.scheduled}</p>
              <p className="text-sm text-gray-500">Scheduled</p>
            </div>
          </div>
        </Card>
        <Card className="p-4">
          <div className="flex items-center gap-3">
            <div className="p-3 bg-green-100 rounded-lg">
              <CheckCircle2 className="w-6 h-6 text-green-600" />
            </div>
            <div>
              <p className="text-2xl font-bold text-gray-900">{stats.completed}</p>
              <p className="text-sm text-gray-500">Completed</p>
            </div>
          </div>
        </Card>
        <Card className="p-4">
          <div className="flex items-center gap-3">
            <div className="p-3 bg-red-100 rounded-lg">
              <AlertCircle className="w-6 h-6 text-red-600" />
            </div>
            <div>
              <p className="text-2xl font-bold text-gray-900">{stats.missed}</p>
              <p className="text-sm text-gray-500">Missed</p>
            </div>
          </div>
        </Card>
      </div>

      {viewMode === "calendar" ? (
        <Card className="p-6">
          {/* Calendar Header */}
          <div className="flex flex-col gap-4 mb-6">
            <div className="flex items-center justify-between">
              <h2 className="text-xl font-semibold text-gray-900">{monthYear}</h2>
              <div className="flex gap-2">
                <Button variant="outline" size="sm" onClick={handlePreviousMonth}>
                  <ChevronLeft className="w-4 h-4" />
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setCurrentDate(new Date())}
                >
                  Today
                </Button>
                <Button variant="outline" size="sm" onClick={handleNextMonth}>
                  <ChevronRight className="w-4 h-4" />
                </Button>
              </div>
            </div>
            
            {/* View Toggle */}
            <div className="flex gap-2">
              <Button
                variant={calendarView === "day" ? "default" : "outline"}
                size="sm"
                onClick={() => setCalendarView("day")}
              >
                Day
              </Button>
              <Button
                variant={calendarView === "week" ? "default" : "outline"}
                size="sm"
                onClick={() => setCalendarView("week")}
              >
                Week
              </Button>
              <Button
                variant={calendarView === "month" ? "default" : "outline"}
                size="sm"
                onClick={() => setCalendarView("month")}
              >
                Month
              </Button>
            </div>
          </div>

          {/* Calendar Grid - Month View */}
          {calendarView === "month" && (
            <div className="grid grid-cols-7 gap-2">
              {/* Day headers */}
              {["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"].map((day) => (
                <div
                  key={day}
                  className="text-center text-sm font-semibold text-gray-600 py-2"
                >
                  {day}
                </div>
              ))}

              {/* Calendar days */}
              {getCalendarDays().map((date, index) => {
                const daySchedule = getDaySchedule(date);
                const dateStr = date?.toISOString().split("T")[0];
                const isToday = dateStr === today;
                const isPast = date && date < new Date(today);

                return (
                  <div
                    key={index}
                    className={cn(
                      "min-h-[100px] p-2 border rounded-lg",
                      date ? "bg-white hover:bg-gray-50" : "bg-gray-50",
                      isToday && "border-blue-500 border-2"
                    )}
                  >
                    {date && (
                      <>
                        <div className="text-right mb-2">
                          <span
                            className={cn(
                              "text-sm font-medium",
                              isToday
                                ? "bg-blue-500 text-white px-2 py-1 rounded-full"
                                : isPast
                                ? "text-gray-400"
                                : "text-gray-700"
                            )}
                          >
                            {date.getDate()}
                          </span>
                        </div>
                        <div className="space-y-1">
                          {daySchedule.map((item) => (
                            <div
                              key={item.id}
                              className={cn(
                                "text-xs p-1.5 rounded flex items-start gap-1",
                                item.status === "completed" &&
                                  "bg-green-100 text-green-800",
                                item.status === "scheduled" && "bg-blue-100 text-blue-800",
                                item.status === "missed" && "bg-red-100 text-red-800"
                              )}
                            >
                              <button
                                onClick={(e) => {
                                  e.stopPropagation();
                                  if (item.status !== "completed") {
                                    handleMarkComplete(item.id);
                                  }
                                }}
                                className="flex-shrink-0 mt-0.5 hover:opacity-70"
                              >
                                {item.status === "completed" ? (
                                  <CheckSquare className="w-3 h-3" />
                                ) : (
                                  <Square className="w-3 h-3" />
                                )}
                              </button>
                              <p className="font-medium truncate flex-1">{item.title}</p>
                            </div>
                          ))}
                        </div>
                      </>
                    )}
                  </div>
                );
              })}
            </div>
          )}

          {/* Week View */}
          {calendarView === "week" && (
            <div className="grid grid-cols-7 gap-3">
              {/* Day headers */}
              {getWeekDays().map((date) => {
                const daySchedule = getDaySchedule(date);
                const dateStr = date.toISOString().split("T")[0];
                const isToday = dateStr === today;
                const dayName = date.toLocaleDateString("en-US", { weekday: "short" });

                return (
                  <div key={dateStr} className="space-y-2">
                    <div
                      className={cn(
                        "text-center p-2 rounded-lg",
                        isToday && "bg-blue-500 text-white"
                      )}
                    >
                      <div className="text-sm font-semibold">{dayName}</div>
                      <div className="text-xl font-bold">{date.getDate()}</div>
                    </div>
                    <div className="space-y-2 min-h-[400px]">
                      {daySchedule.map((item) => (
                        <Card
                          key={item.id}
                          className={cn(
                            "p-3",
                            item.status === "completed" && "bg-green-50 border-green-200",
                            item.status === "scheduled" && "bg-blue-50 border-blue-200",
                            item.status === "missed" && "bg-red-50 border-red-200"
                          )}
                        >
                          <div className="flex items-start gap-2 mb-2">
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                if (item.status !== "completed") {
                                  handleMarkComplete(item.id);
                                }
                              }}
                              className="flex-shrink-0 mt-0.5 hover:opacity-70"
                            >
                              {item.status === "completed" ? (
                                <CheckSquare className="w-4 h-4 text-green-600" />
                              ) : (
                                <Square className="w-4 h-4 text-gray-400" />
                              )}
                            </button>
                            <div className="flex-1 min-w-0">
                              <p className="text-sm font-semibold text-gray-900 line-clamp-2">
                                {item.title}
                              </p>
                            </div>
                          </div>
                          <div className="ml-6 space-y-1">
                            <div className="flex items-center gap-1 text-xs text-gray-500">
                              <Clock className="w-3 h-3" />
                              <span>{item.duration}</span>
                            </div>
                            <Badge className="text-xs inline-block" variant="secondary">
                              {item.topic}
                            </Badge>
                          </div>
                        </Card>
                      ))}
                    </div>
                  </div>
                );
              })}
            </div>
          )}

          {/* Day View */}
          {calendarView === "day" && (
            <div className="space-y-3">
              {getSingleDay().map((date) => {
                const daySchedule = getDaySchedule(date);
                const dateStr = date.toISOString().split("T")[0];
                const isToday = dateStr === today;

                return (
                  <div key={dateStr}>
                    <div
                      className={cn(
                        "text-center p-4 rounded-lg mb-6",
                        isToday ? "bg-blue-500 text-white" : "bg-gray-100"
                      )}
                    >
                      <div className="text-lg font-semibold">
                        {date.toLocaleDateString("en-US", {
                          weekday: "long",
                          month: "long",
                          day: "numeric",
                          year: "numeric",
                        })}
                      </div>
                    </div>
                    <div className="space-y-3">
                      {daySchedule.length > 0 ? (
                        daySchedule.map((item) => (
                          <Card
                            key={item.id}
                            className={cn(
                              "p-4",
                              item.status === "completed" && "bg-green-50 border-green-200",
                              item.status === "scheduled" && "bg-blue-50 border-blue-200",
                              item.status === "missed" && "bg-red-50 border-red-200"
                            )}
                          >
                            <div className="flex items-start gap-4">
                              <button
                                onClick={(e) => {
                                  e.stopPropagation();
                                  if (item.status !== "completed") {
                                    handleMarkComplete(item.id);
                                  }
                                }}
                                className="flex-shrink-0 mt-1 hover:opacity-70"
                              >
                                {item.status === "completed" ? (
                                  <CheckSquare className="w-6 h-6 text-green-600" />
                                ) : (
                                  <Square className="w-6 h-6 text-gray-400" />
                                )}
                              </button>
                              <div className="flex-1 min-w-0">
                                <h3 className="font-semibold text-gray-900 mb-1">
                                  {item.title}
                                </h3>
                                <p className="text-sm text-gray-600 mb-3">{item.channel}</p>
                                <div className="flex flex-wrap items-center gap-3 text-sm text-gray-500">
                                  <div className="flex items-center gap-1">
                                    <Clock className="w-4 h-4" />
                                    <span>{item.duration}</span>
                                  </div>
                                  <Badge variant="secondary">{item.topic}</Badge>
                                  <Badge
                                    className={cn(
                                      item.status === "completed" &&
                                        "bg-green-100 text-green-700",
                                      item.status === "scheduled" &&
                                        "bg-blue-100 text-blue-700",
                                      item.status === "missed" && "bg-red-100 text-red-700"
                                    )}
                                  >
                                    {item.status.charAt(0).toUpperCase() + item.status.slice(1)}
                                  </Badge>
                                </div>
                              </div>
                            </div>
                          </Card>
                        ))
                      ) : (
                        <div className="text-center py-12 text-gray-500">
                          <CalendarIcon className="w-12 h-12 mx-auto mb-3 text-gray-300" />
                          <p>No videos scheduled for this day</p>
                        </div>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          )}

          {/* Legend */}
          <div className="flex flex-wrap items-center gap-4 mt-6 pt-6 border-t border-gray-200">
            <div className="flex items-center gap-2 text-sm">
              <div className="w-4 h-4 bg-blue-100 rounded" />
              <span className="text-gray-600">Scheduled</span>
            </div>
            <div className="flex items-center gap-2 text-sm">
              <div className="w-4 h-4 bg-green-100 rounded" />
              <span className="text-gray-600">Completed</span>
            </div>
            <div className="flex items-center gap-2 text-sm">
              <div className="w-4 h-4 bg-red-100 rounded" />
              <span className="text-gray-600">Missed</span>
            </div>
            <div className="flex items-center gap-2 text-sm ml-4">
              <Square className="w-4 h-4 text-gray-400" />
              <span className="text-gray-600">Click checkbox to mark complete</span>
            </div>
          </div>
        </Card>
      ) : (
        /* List View */
        <div className="space-y-3">
          {schedule
            .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
            .map((item) => (
              <Card key={item.id} className="p-4">
                <div className="flex items-start gap-4">
                  <div
                    className={cn(
                      "mt-1 p-2 rounded-lg",
                      item.status === "completed" && "bg-green-100",
                      item.status === "scheduled" && "bg-blue-100",
                      item.status === "missed" && "bg-red-100"
                    )}
                  >
                    {item.status === "completed" && (
                      <CheckCircle2 className="w-5 h-5 text-green-600" />
                    )}
                    {item.status === "scheduled" && (
                      <Clock className="w-5 h-5 text-blue-600" />
                    )}
                    {item.status === "missed" && (
                      <AlertCircle className="w-5 h-5 text-red-600" />
                    )}
                  </div>

                  <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between gap-4 mb-2">
                      <div className="flex-1 min-w-0">
                        <h3 className="font-semibold text-gray-900 mb-1">{item.title}</h3>
                        <p className="text-sm text-gray-500">{item.channel}</p>
                      </div>
                      <Badge variant="secondary">{item.topic}</Badge>
                    </div>

                    <div className="flex flex-wrap items-center gap-3 text-sm text-gray-500">
                      <div className="flex items-center gap-1">
                        <CalendarIcon className="w-4 h-4" />
                        <span>{new Date(item.date).toLocaleDateString()}</span>
                      </div>
                      <span>•</span>
                      <div className="flex items-center gap-1">
                        <Clock className="w-4 h-4" />
                        <span>{item.duration}</span>
                      </div>
                      <span>•</span>
                      <Badge
                        className={cn(
                          item.status === "completed" && "bg-green-100 text-green-700",
                          item.status === "scheduled" && "bg-blue-100 text-blue-700",
                          item.status === "missed" && "bg-red-100 text-red-700"
                        )}
                      >
                        {item.status.charAt(0).toUpperCase() + item.status.slice(1)}
                      </Badge>
                    </div>

                    <div className="flex gap-2 mt-3">
                      {item.status === "scheduled" && (
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => handleMarkComplete(item.id)}
                        >
                          <CheckCircle2 className="w-4 h-4 mr-2" />
                          Mark Complete
                        </Button>
                      )}
                      <Button
                        size="sm"
                        variant="ghost"
                        onClick={() => handleRemove(item.id)}
                      >
                        Remove
                      </Button>
                    </div>
                  </div>
                </div>
              </Card>
            ))}
        </div>
      )}

      {/* Add to Schedule Dialog */}
      <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Schedule a Video</DialogTitle>
            <DialogDescription>
              Choose a video and date to add to your learning schedule
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <label className="text-sm font-medium text-gray-700">Select Video</label>
              <Select value={selectedVideo} onValueChange={setSelectedVideo}>
                <SelectTrigger>
                  <SelectValue placeholder="Choose a video" />
                </SelectTrigger>
                <SelectContent>
                  {availableVideos.map((video) => (
                    <SelectItem key={video.id} value={video.id}>
                      {video.title} ({video.duration})
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium text-gray-700">Select Date</label>
              <input
                type="date"
                className="w-full px-3 py-2 border border-gray-300 rounded-md"
                value={selectedDate}
                onChange={(e) => setSelectedDate(e.target.value)}
                min={today}
              />
            </div>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setIsAddDialogOpen(false)}>
              Cancel
            </Button>
            <Button onClick={handleAddToSchedule}>Add to Schedule</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}