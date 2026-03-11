import { useState } from "react";
import { Link } from "react-router";
import { GitBranch, Plus, Target, Clock, CheckCircle2, TrendingUp, Palette, Upload } from "lucide-react";
import { Button } from "../components/ui/button";
import { Card } from "../components/ui/card";
import { Badge } from "../components/ui/badge";
import { Progress } from "../components/ui/progress";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "../components/ui/dialog";
import { Input } from "../components/ui/input";
import { Label } from "../components/ui/label";
import { Textarea } from "../components/ui/textarea";
import { toast } from "sonner";

interface Roadmap {
  id: string;
  title: string;
  description: string;
  category: string;
  totalCourses: number;
  completedCourses: number;
  estimatedHours: number;
  color: string;
  icon: string;
  dateCreated: string;
}

const mockRoadmaps: Roadmap[] = [
  {
    id: "1",
    title: "Full Stack Web Development",
    description:
      "Complete roadmap to become a full-stack web developer covering frontend, backend, databases, and deployment.",
    category: "Web Development",
    totalCourses: 12,
    completedCourses: 7,
    estimatedHours: 150,
    color: "#3b82f6",
    icon: "🌐",
    dateCreated: "2026-01-15",
  },
  {
    id: "2",
    title: "React Developer Path",
    description:
      "Master React ecosystem including hooks, state management, routing, and modern React patterns.",
    category: "Frontend",
    totalCourses: 8,
    completedCourses: 5,
    estimatedHours: 80,
    color: "#06b6d4",
    icon: "⚛️",
    dateCreated: "2026-02-01",
  },
  {
    id: "3",
    title: "DevOps Engineering",
    description:
      "Learn Docker, Kubernetes, CI/CD pipelines, cloud platforms, and infrastructure as code.",
    category: "DevOps",
    totalCourses: 10,
    completedCourses: 3,
    estimatedHours: 120,
    color: "#8b5cf6",
    icon: "🚀",
    dateCreated: "2026-02-10",
  },
  {
    id: "4",
    title: "System Design Mastery",
    description:
      "Comprehensive system design concepts from basics to advanced distributed systems.",
    category: "Architecture",
    totalCourses: 15,
    completedCourses: 8,
    estimatedHours: 100,
    color: "#f59e0b",
    icon: "🏗️",
    dateCreated: "2026-01-20",
  },
  {
    id: "5",
    title: "Database Expert Path",
    description:
      "Deep dive into SQL, NoSQL, database design, optimization, and data modeling.",
    category: "Database",
    totalCourses: 9,
    completedCourses: 9,
    estimatedHours: 90,
    color: "#10b981",
    icon: "💾",
    dateCreated: "2026-01-10",
  },
  {
    id: "6",
    title: "TypeScript Advanced",
    description:
      "Advanced TypeScript patterns, generics, utility types, and type-safe programming.",
    category: "Programming",
    totalCourses: 6,
    completedCourses: 2,
    estimatedHours: 60,
    color: "#ec4899",
    icon: "📘",
    dateCreated: "2026-02-20",
  },
];

export function RoadmapsPage() {
  const [roadmaps] = useState<Roadmap[]>(mockRoadmaps);
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [newRoadmap, setNewRoadmap] = useState({
    title: "",
    description: "",
    category: "",
    icon: "📚",
    color: "#3b82f6",
  });

  const handleCreateRoadmap = () => {
    if (!newRoadmap.title.trim()) {
      toast.error("Please enter a roadmap title");
      return;
    }

    toast.success(`Roadmap "${newRoadmap.title}" created!`);
    setIsCreateDialogOpen(false);
    setNewRoadmap({ title: "", description: "", category: "", icon: "📚", color: "#3b82f6" });
  };

  const totalRoadmaps = roadmaps.length;
  const inProgress = roadmaps.filter(
    (r) => r.completedCourses > 0 && r.completedCourses < r.totalCourses
  ).length;
  const completed = roadmaps.filter((r) => r.completedCourses === r.totalCourses).length;
  const totalHours = roadmaps.reduce((sum, r) => sum + r.estimatedHours, 0);

  return (
    <div className="p-4 md:p-6 max-w-7xl mx-auto">
      {/* Header */}
      <div className="mb-6 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Learning Roadmaps</h1>
          <p className="text-gray-500">
            Visual learning paths with prerequisites and parallel courses
          </p>
        </div>

        <Button onClick={() => setIsCreateDialogOpen(true)}>
          <Plus className="w-4 h-4 mr-2" />
          Create Roadmap
        </Button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-4 gap-4 mb-6">
        <Card className="p-4">
          <div className="flex items-center gap-3">
            <div className="p-3 bg-blue-100 rounded-lg">
              <GitBranch className="w-6 h-6 text-blue-600" />
            </div>
            <div>
              <p className="text-2xl font-bold text-gray-900">{totalRoadmaps}</p>
              <p className="text-sm text-gray-500">Total Roadmaps</p>
            </div>
          </div>
        </Card>
        <Card className="p-4">
          <div className="flex items-center gap-3">
            <div className="p-3 bg-orange-100 rounded-lg">
              <TrendingUp className="w-6 h-6 text-orange-600" />
            </div>
            <div>
              <p className="text-2xl font-bold text-gray-900">{inProgress}</p>
              <p className="text-sm text-gray-500">In Progress</p>
            </div>
          </div>
        </Card>
        <Card className="p-4">
          <div className="flex items-center gap-3">
            <div className="p-3 bg-green-100 rounded-lg">
              <CheckCircle2 className="w-6 h-6 text-green-600" />
            </div>
            <div>
              <p className="text-2xl font-bold text-gray-900">{completed}</p>
              <p className="text-sm text-gray-500">Completed</p>
            </div>
          </div>
        </Card>
        <Card className="p-4">
          <div className="flex items-center gap-3">
            <div className="p-3 bg-purple-100 rounded-lg">
              <Clock className="w-6 h-6 text-purple-600" />
            </div>
            <div>
              <p className="text-2xl font-bold text-gray-900">{totalHours}h</p>
              <p className="text-sm text-gray-500">Total Hours</p>
            </div>
          </div>
        </Card>
      </div>

      {/* Roadmaps Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {roadmaps.map((roadmap) => {
          const progress = (roadmap.completedCourses / roadmap.totalCourses) * 100;
          const isCompleted = roadmap.completedCourses === roadmap.totalCourses;

          return (
            <Card
              key={roadmap.id}
              className="overflow-hidden hover:shadow-lg transition-shadow"
            >
              <div
                className="h-2"
                style={{ backgroundColor: roadmap.color }}
              />
              <div className="p-6">
                <div className="flex items-start justify-between mb-4">
                  <div className="text-4xl">{roadmap.icon}</div>
                  <Badge variant="secondary">{roadmap.category}</Badge>
                </div>

                <Link to={`/roadmaps/${roadmap.id}`}>
                  <h3 className="text-xl font-semibold text-gray-900 mb-2 hover:text-blue-600">
                    {roadmap.title}
                  </h3>
                </Link>
                <p className="text-sm text-gray-600 mb-4 line-clamp-2">
                  {roadmap.description}
                </p>

                <div className="flex items-center gap-4 mb-4 text-sm text-gray-500">
                  <div className="flex items-center gap-1">
                    <Target className="w-4 h-4" />
                    <span>
                      {roadmap.completedCourses}/{roadmap.totalCourses} courses
                    </span>
                  </div>
                  <div className="flex items-center gap-1">
                    <Clock className="w-4 h-4" />
                    <span>{roadmap.estimatedHours}h</span>
                  </div>
                </div>

                <div className="space-y-2 mb-4">
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-gray-600">Progress</span>
                    <span className="font-medium text-gray-900">
                      {progress.toFixed(0)}%
                    </span>
                  </div>
                  <Progress value={progress} className="h-2" />
                </div>

                {isCompleted ? (
                  <div className="flex items-center gap-2 text-green-600 text-sm font-medium">
                    <CheckCircle2 className="w-4 h-4" />
                    <span>Completed</span>
                  </div>
                ) : (
                  <Link to={`/roadmaps/${roadmap.id}`}>
                    <Button className="w-full" size="sm">
                      Continue Learning
                    </Button>
                  </Link>
                )}
              </div>
            </Card>
          );
        })}
      </div>

      {/* Create Roadmap Dialog */}
      <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Create Learning Roadmap</DialogTitle>
            <DialogDescription>
              Design a custom learning path with courses and prerequisites
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="title">Roadmap Title</Label>
              <Input
                id="title"
                placeholder="e.g., Frontend Developer Path"
                value={newRoadmap.title}
                onChange={(e) =>
                  setNewRoadmap({ ...newRoadmap, title: e.target.value })
                }
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="category">Category</Label>
              <Input
                id="category"
                placeholder="e.g., Web Development"
                value={newRoadmap.category}
                onChange={(e) =>
                  setNewRoadmap({ ...newRoadmap, category: e.target.value })
                }
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="icon">Icon (Emoji)</Label>
                <Input
                  id="icon"
                  placeholder="📚"
                  value={newRoadmap.icon}
                  onChange={(e) =>
                    setNewRoadmap({ ...newRoadmap, icon: e.target.value })
                  }
                  maxLength={2}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="color">Theme Color</Label>
                <div className="flex gap-2">
                  <input
                    id="color"
                    type="color"
                    value={newRoadmap.color}
                    onChange={(e) =>
                      setNewRoadmap({ ...newRoadmap, color: e.target.value })
                    }
                    className="h-9 w-16 rounded border border-gray-300 cursor-pointer"
                  />
                  <Input
                    value={newRoadmap.color}
                    onChange={(e) =>
                      setNewRoadmap({ ...newRoadmap, color: e.target.value })
                    }
                    placeholder="#3b82f6"
                    className="flex-1"
                  />
                </div>
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="description">Description</Label>
              <Textarea
                id="description"
                placeholder="Describe the learning path..."
                rows={3}
                value={newRoadmap.description}
                onChange={(e) =>
                  setNewRoadmap({ ...newRoadmap, description: e.target.value })
                }
              />
            </div>

            {/* Preview */}
            <div className="pt-4 border-t">
              <Label className="mb-2 block">Preview</Label>
              <div className="border rounded-lg overflow-hidden">
                <div className="h-2" style={{ backgroundColor: newRoadmap.color }} />
                <div className="p-4">
                  <div className="flex items-center gap-3">
                    <div className="text-3xl">{newRoadmap.icon || "📚"}</div>
                    <div>
                      <p className="font-semibold text-gray-900">
                        {newRoadmap.title || "Roadmap Title"}
                      </p>
                      <p className="text-sm text-gray-500">
                        {newRoadmap.category || "Category"}
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setIsCreateDialogOpen(false)}
            >
              Cancel
            </Button>
            <Button onClick={handleCreateRoadmap}>Create Roadmap</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}