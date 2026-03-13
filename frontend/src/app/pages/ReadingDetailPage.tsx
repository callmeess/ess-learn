import { useState } from "react";
import { useParams, Link } from "react-router";
import {
  ChevronLeft,
  Plus,
  CheckCircle2,
  Circle,
  Book,
  FileText,
  ExternalLink,
  Trash2,
  Edit,
  BookOpen,
  User,
  Tag,
  Clock,
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
import { Textarea } from "../components/ui/textarea";
import { toast } from "sonner";
import { cn } from "../components/ui/utils";

interface ReadingItem {
  id: string;
  title: string;
  author: string;
  type: "book" | "article";
  url?: string;
  completed: boolean;
  notes?: string;
  pages?: number;
  estimatedHours?: number;
}

interface ReadingListData {
  id: string;
  title: string;
  description: string;
  category: string;
  items: ReadingItem[];
  tags: string[];
  icon: string;
  color: string;
}

// Mock data
const mockReadingData: Record<string, ReadingListData> = {
  "1": {
    id: "1",
    title: "Web Development Essentials",
    description: "Essential reading materials for modern web development",
    category: "Web Development",
    icon: "📚",
    color: "#3b82f6",
    tags: ["JavaScript", "Programming"],
    items: [
      {
        id: "r1",
        title: "You Don't Know JS Yet",
        author: "Kyle Simpson",
        type: "book",
        url: "https://github.com/getify/You-Dont-Know-JS",
        completed: true,
        pages: 280,
        estimatedHours: 8,
        notes: "Excellent deep dive into JavaScript fundamentals. The closure chapter was particularly enlightening.",
      },
      {
        id: "r2",
        title: "Eloquent JavaScript",
        author: "Marijn Haverbeke",
        type: "book",
        url: "https://eloquentjavascript.net/",
        completed: true,
        pages: 450,
        estimatedHours: 15,
        notes: "Great for beginners with hands-on exercises.",
      },
      {
        id: "r3",
        title: "JavaScript: The Good Parts",
        author: "Douglas Crockford",
        type: "book",
        completed: false,
        pages: 170,
        estimatedHours: 6,
      },
      {
        id: "r4",
        title: "Modern JavaScript Features You Should Know",
        author: "MDN Web Docs",
        type: "article",
        url: "https://developer.mozilla.org/",
        completed: false,
        estimatedHours: 2,
      },
    ],
  },
  "2": {
    id: "2",
    title: "React Deep Dive",
    description: "Advanced reading materials for mastering React",
    category: "Frontend",
    icon: "⚛️",
    color: "#61dafb",
    tags: ["React", "Frontend"],
    items: [
      {
        id: "r5",
        title: "React Design Patterns and Best Practices",
        author: "Carlos Santana Roldán",
        type: "book",
        completed: false,
        pages: 350,
        estimatedHours: 12,
      },
      {
        id: "r6",
        title: "Understanding React Hooks",
        author: "Dan Abramov",
        type: "article",
        url: "https://overreacted.io/",
        completed: true,
        estimatedHours: 1,
        notes: "Must-read for understanding hooks mental model.",
      },
      {
        id: "r7",
        title: "A Complete Guide to useEffect",
        author: "Dan Abramov",
        type: "article",
        url: "https://overreacted.io/",
        completed: true,
        estimatedHours: 2,
        notes: "Comprehensive guide that cleared up many misconceptions.",
      },
    ],
  },
};

export function ReadingDetailPage() {
  const { id } = useParams<{ id: string }>();
  const readingData = mockReadingData[id || "1"];

  const [items, setItems] = useState<ReadingItem[]>(readingData?.items || []);
  const [isAddItemDialogOpen, setIsAddItemDialogOpen] = useState(false);
  const [selectedItem, setSelectedItem] = useState<ReadingItem | null>(null);
  const [newItem, setNewItem] = useState({
    title: "",
    author: "",
    type: "book" as "book" | "article",
    url: "",
    pages: "",
    estimatedHours: "",
  });

  if (!readingData) {
    return (
      <div className="p-6 text-center">
        <p className="text-gray-500">Reading list not found</p>
      </div>
    );
  }

  const handleToggleComplete = (itemId: string) => {
    setItems(
      items.map((item) =>
        item.id === itemId ? { ...item, completed: !item.completed } : item
      )
    );
    const item = items.find((i) => i.id === itemId);
    if (item) {
      toast.success(
        item.completed ? "Marked as unread" : "Marked as completed!"
      );
    }
  };

  const handleAddItem = () => {
    if (!newItem.title.trim() || !newItem.author.trim()) {
      toast.error("Please enter title and author");
      return;
    }

    toast.success(`"${newItem.title}" added to reading list!`);
    setIsAddItemDialogOpen(false);
    setNewItem({
      title: "",
      author: "",
      type: "book",
      url: "",
      pages: "",
      estimatedHours: "",
    });
  };

  const handleDeleteItem = (itemId: string) => {
    setItems(items.filter((item) => item.id !== itemId));
    toast.success("Item removed from reading list");
    setSelectedItem(null);
  };

  const completedCount = items.filter((item) => item.completed).length;
  const totalCount = items.length;
  const progress = totalCount > 0 ? (completedCount / totalCount) * 100 : 0;

  const bookCount = items.filter((item) => item.type === "book").length;
  const articleCount = items.filter((item) => item.type === "article").length;

  return (
    <div className="h-full flex flex-col bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b border-gray-200 p-4 md:p-6">
        <div className="max-w-7xl mx-auto">
          <Link
            to="/reading"
            className="inline-flex items-center gap-2 text-sm text-gray-600 hover:text-gray-900 mb-4"
          >
            <ChevronLeft className="w-4 h-4" />
            Back to Reading Lists
          </Link>

          <div className="flex flex-col md:flex-row md:items-start md:justify-between gap-4">
            <div className="flex items-start gap-4">
              <div className="text-5xl">{readingData.icon}</div>
              <div>
                <h1 className="text-2xl md:text-3xl font-bold text-gray-900 mb-2">
                  {readingData.title}
                </h1>
                <p className="text-gray-500 mb-3">{readingData.description}</p>
                <div className="flex flex-wrap items-center gap-2">
                  <Badge variant="secondary">{readingData.category}</Badge>
                  {readingData.tags.map((tag) => (
                    <Badge key={tag} variant="outline" className="text-xs">
                      <Tag className="w-3 h-3 mr-1" />
                      {tag}
                    </Badge>
                  ))}
                </div>
              </div>
            </div>

            <Button onClick={() => setIsAddItemDialogOpen(true)}>
              <Plus className="w-4 h-4 mr-2" />
              Add Item
            </Button>
          </div>

          {/* Progress Bar */}
          <div className="mt-6">
            <div className="flex items-center justify-between mb-2 text-sm">
              <span className="text-gray-600">Overall Progress</span>
              <span className="font-medium text-gray-900">
                {completedCount} / {totalCount} items ({progress.toFixed(0)}%)
              </span>
            </div>
            <Progress value={progress} className="h-3" />
          </div>

          {/* Stats */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mt-6">
            <div className="flex items-center gap-2">
              <Book className="w-5 h-5 text-blue-600" />
              <div>
                <p className="text-sm text-gray-500">Books</p>
                <p className="text-lg font-semibold text-gray-900">{bookCount}</p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <FileText className="w-5 h-5 text-purple-600" />
              <div>
                <p className="text-sm text-gray-500">Articles</p>
                <p className="text-lg font-semibold text-gray-900">{articleCount}</p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <CheckCircle2 className="w-5 h-5 text-green-600" />
              <div>
                <p className="text-sm text-gray-500">Completed</p>
                <p className="text-lg font-semibold text-gray-900">{completedCount}</p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <Clock className="w-5 h-5 text-orange-600" />
              <div>
                <p className="text-sm text-gray-500">Est. Hours</p>
                <p className="text-lg font-semibold text-gray-900">
                  {items.reduce((sum, item) => sum + (item.estimatedHours || 0), 0)}h
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Reading Items List */}
      <div className="flex-1 overflow-y-auto p-4 md:p-6">
        <div className="max-w-7xl mx-auto space-y-4">
          {items.length === 0 ? (
            <Card className="p-12">
              <div className="text-center">
                <BookOpen className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                <p className="text-gray-500 mb-4">No items in this reading list yet</p>
                <Button onClick={() => setIsAddItemDialogOpen(true)}>
                  <Plus className="w-4 h-4 mr-2" />
                  Add Your First Item
                </Button>
              </div>
            </Card>
          ) : (
            items.map((item) => (
              <Card
                key={item.id}
                className={cn(
                  "p-6 transition-all cursor-pointer hover:shadow-md",
                  item.completed && "bg-green-50 border-green-200"
                )}
                onClick={() => setSelectedItem(item)}
              >
                <div className="flex items-start gap-4">
                  {/* Checkbox */}
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      handleToggleComplete(item.id);
                    }}
                    className="mt-1 flex-shrink-0"
                  >
                    {item.completed ? (
                      <CheckCircle2 className="w-6 h-6 text-green-600" />
                    ) : (
                      <Circle className="w-6 h-6 text-gray-400 hover:text-gray-600" />
                    )}
                  </button>

                  {/* Content */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between gap-4 mb-2">
                      <div className="flex-1">
                        <h3
                          className={cn(
                            "text-lg font-semibold mb-1",
                            item.completed
                              ? "text-gray-700 line-through"
                              : "text-gray-900"
                          )}
                        >
                          {item.title}
                        </h3>
                        <div className="flex items-center gap-2 text-sm text-gray-600 mb-2">
                          <User className="w-4 h-4" />
                          <span>{item.author}</span>
                        </div>
                      </div>

                      <div className="flex items-center gap-2">
                        <Badge
                          variant={item.type === "book" ? "default" : "secondary"}
                        >
                          {item.type === "book" ? (
                            <Book className="w-3 h-3 mr-1" />
                          ) : (
                            <FileText className="w-3 h-3 mr-1" />
                          )}
                          {item.type}
                        </Badge>
                        {item.url && (
                          <a
                            href={item.url}
                            target="_blank"
                            rel="noopener noreferrer"
                            onClick={(e) => e.stopPropagation()}
                          >
                            <Button variant="ghost" size="sm">
                              <ExternalLink className="w-4 h-4" />
                            </Button>
                          </a>
                        )}
                      </div>
                    </div>

                    {/* Meta Info */}
                    <div className="flex flex-wrap items-center gap-4 text-sm text-gray-500 mb-3">
                      {item.pages && (
                        <div className="flex items-center gap-1">
                          <BookOpen className="w-4 h-4" />
                          <span>{item.pages} pages</span>
                        </div>
                      )}
                      {item.estimatedHours && (
                        <div className="flex items-center gap-1">
                          <Clock className="w-4 h-4" />
                          <span>{item.estimatedHours}h estimated</span>
                        </div>
                      )}
                    </div>

                    {/* Notes */}
                    {item.notes && (
                      <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-3">
                        <p className="text-sm text-gray-700">{item.notes}</p>
                      </div>
                    )}
                  </div>
                </div>
              </Card>
            ))
          )}
        </div>
      </div>

      {/* Item Detail Dialog */}
      {selectedItem && (
        <Dialog open={!!selectedItem} onOpenChange={() => setSelectedItem(null)}>
          <DialogContent className="sm:max-w-lg">
            <DialogHeader>
              <DialogTitle>{selectedItem.title}</DialogTitle>
              <DialogDescription>by {selectedItem.author}</DialogDescription>
            </DialogHeader>

            <div className="space-y-4 py-4">
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div>
                  <p className="text-gray-500 mb-1">Type</p>
                  <Badge variant={selectedItem.type === "book" ? "default" : "secondary"}>
                    {selectedItem.type === "book" ? (
                      <Book className="w-3 h-3 mr-1" />
                    ) : (
                      <FileText className="w-3 h-3 mr-1" />
                    )}
                    {selectedItem.type}
                  </Badge>
                </div>
                <div>
                  <p className="text-gray-500 mb-1">Status</p>
                  <Badge
                    variant={selectedItem.completed ? "default" : "secondary"}
                    className={cn(
                      selectedItem.completed && "bg-green-100 text-green-700"
                    )}
                  >
                    {selectedItem.completed ? "Completed" : "Not Started"}
                  </Badge>
                </div>
                {selectedItem.pages && (
                  <div>
                    <p className="text-gray-500 mb-1">Pages</p>
                    <p className="font-medium text-gray-900">{selectedItem.pages}</p>
                  </div>
                )}
                {selectedItem.estimatedHours && (
                  <div>
                    <p className="text-gray-500 mb-1">Est. Time</p>
                    <p className="font-medium text-gray-900">
                      {selectedItem.estimatedHours}h
                    </p>
                  </div>
                )}
              </div>

              {selectedItem.url && (
                <div>
                  <p className="text-sm text-gray-500 mb-2">Link</p>
                  <a
                    href={selectedItem.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-blue-600 hover:underline text-sm flex items-center gap-1"
                  >
                    {selectedItem.url}
                    <ExternalLink className="w-3 h-3" />
                  </a>
                </div>
              )}

              {selectedItem.notes && (
                <div>
                  <p className="text-sm text-gray-500 mb-2">Notes</p>
                  <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-3">
                    <p className="text-sm text-gray-700">{selectedItem.notes}</p>
                  </div>
                </div>
              )}
            </div>

            <DialogFooter className="flex-col sm:flex-row gap-2">
              <Button
                variant="destructive"
                onClick={() => handleDeleteItem(selectedItem.id)}
                className="w-full sm:w-auto"
              >
                <Trash2 className="w-4 h-4 mr-2" />
                Delete
              </Button>
              <Button
                variant={selectedItem.completed ? "outline" : "default"}
                onClick={() => {
                  handleToggleComplete(selectedItem.id);
                  setSelectedItem(null);
                }}
                className="w-full sm:w-auto"
              >
                {selectedItem.completed ? (
                  <>
                    <Circle className="w-4 h-4 mr-2" />
                    Mark as Unread
                  </>
                ) : (
                  <>
                    <CheckCircle2 className="w-4 h-4 mr-2" />
                    Mark as Complete
                  </>
                )}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      )}

      {/* Add Item Dialog */}
      <Dialog open={isAddItemDialogOpen} onOpenChange={setIsAddItemDialogOpen}>
        <DialogContent className="sm:max-w-lg">
          <DialogHeader>
            <DialogTitle>Add Reading Material</DialogTitle>
            <DialogDescription>
              Add a book or article to this reading list
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="item-title">Title</Label>
              <Input
                id="item-title"
                placeholder="e.g., Clean Code"
                value={newItem.title}
                onChange={(e) => setNewItem({ ...newItem, title: e.target.value })}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="author">Author</Label>
              <Input
                id="author"
                placeholder="e.g., Robert C. Martin"
                value={newItem.author}
                onChange={(e) => setNewItem({ ...newItem, author: e.target.value })}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="type">Type</Label>
              <Select
                value={newItem.type}
                onValueChange={(value: "book" | "article") =>
                  setNewItem({ ...newItem, type: value })
                }
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="book">
                    <div className="flex items-center gap-2">
                      <Book className="w-4 h-4" />
                      Book
                    </div>
                  </SelectItem>
                  <SelectItem value="article">
                    <div className="flex items-center gap-2">
                      <FileText className="w-4 h-4" />
                      Article
                    </div>
                  </SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="url">URL (optional)</Label>
              <Input
                id="url"
                type="url"
                placeholder="https://..."
                value={newItem.url}
                onChange={(e) => setNewItem({ ...newItem, url: e.target.value })}
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="pages">Pages (optional)</Label>
                <Input
                  id="pages"
                  type="number"
                  placeholder="300"
                  value={newItem.pages}
                  onChange={(e) => setNewItem({ ...newItem, pages: e.target.value })}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="hours">Est. Hours (optional)</Label>
                <Input
                  id="hours"
                  type="number"
                  placeholder="10"
                  value={newItem.estimatedHours}
                  onChange={(e) =>
                    setNewItem({ ...newItem, estimatedHours: e.target.value })
                  }
                />
              </div>
            </div>
          </div>

          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setIsAddItemDialogOpen(false)}
            >
              Cancel
            </Button>
            <Button onClick={handleAddItem}>Add Item</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
