import { useState, useMemo } from "react";
import { useParams, Link } from "react-router";
import {
  ChevronLeft,
  Plus,
  CheckCircle2,
  Circle,
  Lock,
  Play,
  Clock,
  Video,
  Edit,
  Trash2,
  BookOpen,
  Book,
} from "lucide-react";
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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "../components/ui/select";
import { Label } from "../components/ui/label";
import { Input } from "../components/ui/input";
import { toast } from "sonner";
import { cn } from "../components/ui/utils";

interface CourseNode {
  id: string;
  title: string;
  description: string;
  duration: string;
  videoCount?: number;
  itemCount?: number;
  status: "completed" | "in-progress" | "locked" | "available";
  prerequisites: string[];
  position: { x: number; y: number };
  level: number;
  nodeType: "course" | "reading-list";
}

// Mock roadmap data
const mockRoadmapData: Record<string, any> = {
  "1": {
    title: "Full Stack Web Development",
    description:
      "Complete roadmap to become a full-stack web developer covering frontend, backend, databases, and deployment.",
    color: "#3b82f6",
    nodes: [
      {
        id: "n1",
        title: "HTML & CSS Basics",
        description: "Foundation of web development",
        duration: "8h",
        videoCount: 5,
        status: "completed",
        prerequisites: [],
        position: { x: 300, y: 50 },
        level: 0,
        nodeType: "course",
      },
      {
        id: "n2",
        title: "JavaScript Fundamentals",
        description: "Core JavaScript concepts",
        duration: "15h",
        videoCount: 10,
        status: "completed",
        prerequisites: ["n1"],
        position: { x: 100, y: 250 },
        level: 1,
        nodeType: "course",
      },
      {
        id: "n3",
        title: "Git & GitHub",
        description: "Version control basics",
        duration: "5h",
        videoCount: 4,
        status: "completed",
        prerequisites: ["n1"],
        position: { x: 500, y: 250 },
        level: 1,
        nodeType: "course",
      },
      {
        id: "r1",
        title: "JavaScript Reading List",
        description: "Essential books and articles",
        duration: "25h",
        itemCount: 4,
        status: "in-progress",
        prerequisites: ["n2"],
        position: { x: 260, y: 350 },
        level: 1.5,
        nodeType: "reading-list",
      },
      {
        id: "n4",
        title: "React Basics",
        description: "Modern frontend framework",
        duration: "20h",
        videoCount: 12,
        status: "in-progress",
        prerequisites: ["n2"],
        position: { x: 50, y: 450 },
        level: 2,
        nodeType: "course",
      },
      {
        id: "n5",
        title: "Node.js & Express",
        description: "Backend with JavaScript",
        duration: "18h",
        videoCount: 11,
        status: "available",
        prerequisites: ["n2"],
        position: { x: 330, y: 450 },
        level: 2,
        nodeType: "course",
      },
      {
        id: "n6",
        title: "Database Design (SQL)",
        description: "Relational databases",
        duration: "12h",
        videoCount: 8,
        status: "available",
        prerequisites: ["n2"],
        position: { x: 610, y: 450 },
        level: 2,
        nodeType: "course",
      },
      {
        id: "r2",
        title: "React Deep Dive",
        description: "React books and articles",
        duration: "12h",
        itemCount: 3,
        status: "available",
        prerequisites: ["n4"],
        position: { x: 50, y: 570 },
        level: 2.5,
        nodeType: "reading-list",
      },
      {
        id: "n7",
        title: "RESTful APIs",
        description: "Building web APIs",
        duration: "10h",
        videoCount: 7,
        status: "locked",
        prerequisites: ["n5", "n6"],
        position: { x: 470, y: 650 },
        level: 3,
        nodeType: "course",
      },
      {
        id: "n8",
        title: "Authentication & Security",
        description: "User auth and security",
        duration: "8h",
        videoCount: 6,
        status: "locked",
        prerequisites: ["n7"],
        position: { x: 470, y: 850 },
        level: 4,
        nodeType: "course",
      },
      {
        id: "n9",
        title: "React Advanced Patterns",
        description: "Advanced React concepts",
        duration: "15h",
        videoCount: 9,
        status: "locked",
        prerequisites: ["n4", "r2"],
        position: { x: 50, y: 750 },
        level: 3,
        nodeType: "course",
      },
      {
        id: "n10",
        title: "Full Stack Integration",
        description: "Connect frontend & backend",
        duration: "12h",
        videoCount: 8,
        status: "locked",
        prerequisites: ["n8", "n9"],
        position: { x: 260, y: 1050 },
        level: 5,
        nodeType: "course",
      },
      {
        id: "r3",
        title: "System Design Reading",
        description: "Architectural patterns",
        duration: "30h",
        itemCount: 3,
        status: "locked",
        prerequisites: ["n10"],
        position: { x: 480, y: 1050 },
        level: 5,
        nodeType: "reading-list",
      },
      {
        id: "n11",
        title: "Testing & QA",
        description: "Unit and integration tests",
        duration: "10h",
        videoCount: 7,
        status: "locked",
        prerequisites: ["n10"],
        position: { x: 120, y: 1250 },
        level: 6,
        nodeType: "course",
      },
      {
        id: "n12",
        title: "Deployment & DevOps",
        description: "Deploy to production",
        duration: "8h",
        videoCount: 5,
        status: "locked",
        prerequisites: ["n10"],
        position: { x: 400, y: 1250 },
        level: 6,
        nodeType: "course",
      },
    ],
  },
};

export function RoadmapDetailPage() {
  const { id } = useParams<{ id: string }>();
  const roadmapData = mockRoadmapData[id || "1"];

  const [nodes, setNodes] = useState<CourseNode[]>(roadmapData?.nodes || []);
  const [isAddNodeDialogOpen, setIsAddNodeDialogOpen] = useState(false);
  const [selectedNode, setSelectedNode] = useState<CourseNode | null>(null);

  if (!roadmapData) {
    return (
      <div className="p-6 text-center">
        <p className="text-gray-500">Roadmap not found</p>
      </div>
    );
  }

  const handleNodeClick = (node: CourseNode) => {
    setSelectedNode(node);
  };

  const handleMarkComplete = (nodeId: string) => {
    setNodes(
      nodes.map((node) => {
        if (node.id === nodeId) {
          return { ...node, status: "completed" as const };
        }
        // Unlock courses that have this as prerequisite
        const prerequisites = node.prerequisites.filter((p) => p !== nodeId);
        if (
          node.status === "locked" &&
          node.prerequisites.includes(nodeId) &&
          prerequisites.every((prereqId) =>
            nodes.find((n) => n.id === prereqId && n.status === "completed")
          )
        ) {
          return { ...node, status: "available" as const };
        }
        return node;
      })
    );
    toast.success("Course marked as completed!");
    setSelectedNode(null);
  };

  const handleStartCourse = (nodeId: string) => {
    setNodes(
      nodes.map((node) =>
        node.id === nodeId ? { ...node, status: "in-progress" as const } : node
      )
    );
    toast.success("Course started!");
    setSelectedNode(null);
  };

  const getNodeIcon = (status: CourseNode["status"]) => {
    switch (status) {
      case "completed":
        return <CheckCircle2 className="w-6 h-6 text-green-500" />;
      case "in-progress":
        return <Play className="w-6 h-6 text-blue-500" />;
      case "available":
        return <Circle className="w-6 h-6 text-gray-400" />;
      case "locked":
        return <Lock className="w-6 h-6 text-gray-300" />;
    }
  };

  const getNodeColor = (status: CourseNode["status"]) => {
    switch (status) {
      case "completed":
        return "border-green-500 bg-green-50";
      case "in-progress":
        return "border-blue-500 bg-blue-50";
      case "available":
        return "border-gray-300 bg-white hover:border-blue-400 hover:shadow-md";
      case "locked":
        return "border-gray-200 bg-gray-50 opacity-60";
    }
  };

  const completedCount = nodes.filter((n) => n.status === "completed").length;
  const totalCount = nodes.length;
  const progress = (completedCount / totalCount) * 100;

  // Compute a simple, ordered layout to avoid collisions by grouping nodes by level
  const positionedNodes = useMemo(() => {
    const levelMap = new Map<number, CourseNode[]>();
    nodes.forEach((n) => {
      const lvl = n.level ?? 0;
      const arr = levelMap.get(lvl) || [];
      arr.push(n);
      levelMap.set(lvl, arr);
    });

    const sortedLevels = Array.from(levelMap.keys()).sort((a, b) => a - b);
    const nodeWidth = 220; // matches w-[200px] plus padding
    const gapX = 32;
    const startX = 40;
    const verticalGap = 220;

    const positioned: CourseNode[] = [];
    sortedLevels.forEach((lvl, levelIndex) => {
      const items = levelMap.get(lvl) || [];
      items.forEach((item, idx) => {
        const left = startX + idx * (nodeWidth + gapX);
        const top = 50 + levelIndex * verticalGap;
        positioned.push({ ...item, position: { x: left, y: top } });
      });
    });

    // For any nodes whose level wasn't in the map (shouldn't happen), fall back
    const positionedIds = new Set(positioned.map((n) => n.id));
    nodes.forEach((n) => {
      if (!positionedIds.has(n.id)) positioned.push(n);
    });

    return positioned;
  }, [nodes]);

  // Calculate connections between positioned nodes
  const connections = positionedNodes
    .flatMap((node) =>
      node.prerequisites.map((prereqId) => {
        const prereqNode = positionedNodes.find((n) => n.id === prereqId);
        if (!prereqNode) return null;
        return {
          from: prereqNode,
          to: node,
        };
      })
    )
    .filter(Boolean);

  // Delete node handler: remove node and update prerequisites and statuses
  const handleDeleteNode = (nodeId: string) => {
    const toDelete = nodes.find((n) => n.id === nodeId);
    if (!toDelete) return;

    setNodes((prev) => {
      // remove the node and strip it from prerequisites
      const remaining = prev
        .filter((n) => n.id !== nodeId)
        .map((n) => ({ ...n, prerequisites: n.prerequisites.filter((p) => p !== nodeId) }));

      // Recompute statuses conservatively: keep completed/in-progress as-is, otherwise
      // mark available if no prereqs or all prereqs completed, else locked
      const updated = remaining.map((n) => {
        if (n.status === "completed" || n.status === "in-progress") return n;
        if (n.prerequisites.length === 0) return { ...n, status: "available" as const };
        const allCompleted = n.prerequisites.every((pid) => remaining.find((r) => r.id === pid && r.status === "completed"));
        return allCompleted ? { ...n, status: "available" as const } : { ...n, status: "locked" as const };
      });

      return updated;
    });

    // Close any open detail for the deleted node
    if (selectedNode?.id === nodeId) setSelectedNode(null);
    toast.success("Node removed from roadmap");
  };

  return (
    <div className="h-full flex flex-col bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b border-gray-200 p-4 md:p-6">
        <div className="max-w-7xl mx-auto">
          <Link
            to="/roadmaps"
            className="inline-flex items-center gap-2 text-sm text-gray-600 hover:text-gray-900 mb-4"
          >
            <ChevronLeft className="w-4 h-4" />
            Back to Roadmaps
          </Link>

          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
            <div>
              <h1 className="text-2xl md:text-3xl font-bold text-gray-900 mb-2">
                {roadmapData.title}
              </h1>
              <p className="text-gray-500">{roadmapData.description}</p>
            </div>

            <Button onClick={() => setIsAddNodeDialogOpen(true)}>
              <Plus className="w-4 h-4 mr-2" />
              Add Course
            </Button>
          </div>

          {/* Progress Bar */}
          <div className="mt-6">
            <div className="flex items-center justify-between mb-2 text-sm">
              <span className="text-gray-600">Overall Progress</span>
              <span className="font-medium text-gray-900">
                {completedCount} / {totalCount} courses ({progress.toFixed(0)}%)
              </span>
            </div>
            <Progress value={progress} className="h-3" />
          </div>
        </div>
      </div>

      {/* Roadmap Canvas */}
      <div className="flex-1 overflow-auto p-4 md:p-6">
        <div className="max-w-7xl mx-auto">
          <Card className="p-6 min-h-[1000px] relative overflow-hidden">
            {/* SVG for connections */}
            <svg className="absolute inset-0 w-full h-full pointer-events-none" style={{ zIndex: 0 }}>
              {connections.map((conn, index) => {
                if (!conn) return null;
                const x1 = conn.from.position.x + 100;
                const y1 = conn.from.position.y + 50;
                const x2 = conn.to.position.x + 100;
                const y2 = conn.to.position.y + 50;

                return (
                  <g key={index}>
                    <line
                      x1={x1}
                      y1={y1}
                      x2={x2}
                      y2={y2}
                      stroke="#d1d5db"
                      strokeWidth="2"
                      strokeDasharray="5,5"
                    />
                    <circle cx={x2} cy={y2} r="4" fill="#d1d5db" />
                  </g>
                );
              })}
            </svg>

            {/* Course Nodes */}
            <div className="relative" style={{ minHeight: "1450px" }}>
              {positionedNodes.map((node) => (
                <div
                  key={node.id}
                  className={cn(
                    "absolute w-[200px] p-4 border-2 rounded-lg transition-all cursor-pointer",
                    getNodeColor(node.status)
                  )}
                  style={{
                    left: `${node.position.x}px`,
                    top: `${node.position.y}px`,
                    zIndex: 1,
                  }}
                  onClick={() =>
                    node.status !== "locked" && handleNodeClick(node)
                  }
                >
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      handleDeleteNode(node.id);
                    }}
                    className="absolute top-2 right-2 p-1 rounded text-gray-500 hover:text-red-600 hover:bg-gray-100"
                    aria-label="Delete node"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                  <div className="flex items-start gap-2 mb-2">
                    {getNodeIcon(node.status)}
                    <div className="flex-1 min-w-0">
                      <h3 className="font-semibold text-sm text-gray-900 line-clamp-2">
                        {node.title}
                      </h3>
                    </div>
                  </div>

                  <p className="text-xs text-gray-600 mb-3 line-clamp-2">
                    {node.description}
                  </p>

                  <div className="flex items-center justify-between text-xs text-gray-500">
                    <div className="flex items-center gap-1">
                      {node.nodeType === "reading-list" ? (
                        <>
                          <BookOpen className="w-3 h-3" />
                          <span>{node.itemCount} items</span>
                        </>
                      ) : (
                        <>
                          <Video className="w-3 h-3" />
                          <span>{node.videoCount}</span>
                        </>
                      )}
                    </div>
                    <div className="flex items-center gap-1">
                      <Clock className="w-3 h-3" />
                      <span>{node.duration}</span>
                    </div>
                  </div>

                  {node.status === "completed" && (
                    <Badge className="mt-2 w-full justify-center bg-green-100 text-green-700">
                      Completed
                    </Badge>
                  )}
                  {node.status === "in-progress" && (
                    <Badge className="mt-2 w-full justify-center bg-blue-100 text-blue-700">
                      In Progress
                    </Badge>
                  )}
                  {node.status === "locked" && (
                    <Badge className="mt-2 w-full justify-center bg-gray-100 text-gray-600">
                      Locked
                    </Badge>
                  )}
                </div>
              ))}
            </div>
          </Card>

          {/* Legend */}
          <Card className="p-4 mt-4">
            <div className="flex flex-wrap items-center gap-6 text-sm">
              <div className="flex items-center gap-2">
                <CheckCircle2 className="w-5 h-5 text-green-500" />
                <span className="text-gray-700">Completed</span>
              </div>
              <div className="flex items-center gap-2">
                <Play className="w-5 h-5 text-blue-500" />
                <span className="text-gray-700">In Progress</span>
              </div>
              <div className="flex items-center gap-2">
                <Circle className="w-5 h-5 text-gray-400" />
                <span className="text-gray-700">Available</span>
              </div>
              <div className="flex items-center gap-2">
                <Lock className="w-5 h-5 text-gray-300" />
                <span className="text-gray-700">Locked (Prerequisites required)</span>
              </div>
            </div>
          </Card>
        </div>
      </div>

      {/* Node Detail Dialog */}
      {selectedNode && (
        <Dialog open={!!selectedNode} onOpenChange={() => setSelectedNode(null)}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>{selectedNode.title}</DialogTitle>
              <DialogDescription>{selectedNode.description}</DialogDescription>
            </DialogHeader>

            <div className="space-y-4 py-4">
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div>
                  <p className="text-gray-500 mb-1">Duration</p>
                  <p className="font-medium text-gray-900">{selectedNode.duration}</p>
                </div>
                <div>
                  <p className="text-gray-500 mb-1">
                    {selectedNode.nodeType === "reading-list" ? "Items" : "Videos"}
                  </p>
                  <p className="font-medium text-gray-900">
                    {selectedNode.nodeType === "reading-list"
                      ? `${selectedNode.itemCount} items`
                      : `${selectedNode.videoCount} videos`}
                  </p>
                </div>
                <div className="col-span-2">
                  <p className="text-gray-500 mb-1">Type</p>
                  <Badge variant="outline">
                    {selectedNode.nodeType === "reading-list" ? (
                      <>
                        <BookOpen className="w-3 h-3 mr-1" />
                        Reading List
                      </>
                    ) : (
                      <>
                        <Video className="w-3 h-3 mr-1" />
                        Course
                      </>
                    )}
                  </Badge>
                </div>
                <div className="col-span-2">
                  <p className="text-gray-500 mb-1">Status</p>
                  <Badge
                    className={cn(
                      selectedNode.status === "completed" &&
                        "bg-green-100 text-green-700",
                      selectedNode.status === "in-progress" &&
                        "bg-blue-100 text-blue-700",
                      selectedNode.status === "available" && "bg-gray-100 text-gray-700"
                    )}
                  >
                    {selectedNode.status.charAt(0).toUpperCase() +
                      selectedNode.status.slice(1)}
                  </Badge>
                </div>
              </div>

              {selectedNode.prerequisites.length > 0 && (
                <div>
                  <p className="text-sm text-gray-500 mb-2">Prerequisites:</p>
                  <div className="space-y-1">
                    {selectedNode.prerequisites.map((prereqId) => {
                      const prereq = nodes.find((n) => n.id === prereqId);
                      if (!prereq) return null;
                      return (
                        <div
                          key={prereqId}
                          className="text-sm flex items-center gap-2"
                        >
                          {getNodeIcon(prereq.status)}
                          <span className="text-gray-700">{prereq.title}</span>
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}
            </div>

            <DialogFooter>
              {selectedNode.status === "available" && (
                <Button onClick={() => handleStartCourse(selectedNode.id)}>
                  <Play className="w-4 h-4 mr-2" />
                  Start Course
                </Button>
              )}
              {selectedNode.status === "in-progress" && (
                <Button onClick={() => handleMarkComplete(selectedNode.id)}>
                  <CheckCircle2 className="w-4 h-4 mr-2" />
                  Mark as Complete
                </Button>
              )}
              {selectedNode.status === "completed" && (
                <Button variant="outline" disabled>
                  <CheckCircle2 className="w-4 h-4 mr-2" />
                  Completed
                </Button>
              )}
            </DialogFooter>
          </DialogContent>
        </Dialog>
      )}

      {/* Add Node Dialog */}
      <Dialog open={isAddNodeDialogOpen} onOpenChange={setIsAddNodeDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Add Course to Roadmap</DialogTitle>
            <DialogDescription>
              Add a new course node to your learning path
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="course-title">Course Title</Label>
              <Input id="course-title" placeholder="e.g., Advanced React Hooks" />
            </div>

            <div className="space-y-2">
              <Label htmlFor="course-description">Description</Label>
              <Input
                id="course-description"
                placeholder="Brief description..."
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="duration">Duration</Label>
                <Input id="duration" placeholder="e.g., 10h" />
              </div>
              <div className="space-y-2">
                <Label htmlFor="video-count">Videos</Label>
                <Input id="video-count" type="number" placeholder="5" />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="prerequisites">Prerequisites</Label>
              <Select>
                <SelectTrigger>
                  <SelectValue placeholder="Select prerequisites" />
                </SelectTrigger>
                <SelectContent>
                  {nodes.map((node) => (
                    <SelectItem key={node.id} value={node.id}>
                      {node.title}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setIsAddNodeDialogOpen(false)}
            >
              Cancel
            </Button>
            <Button
              onClick={() => {
                toast.success("Course added to roadmap!");
                setIsAddNodeDialogOpen(false);
              }}
            >
              Add Course
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}