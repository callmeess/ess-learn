import { useState, useMemo } from "react";
import { Link } from "react-router";
import {
  BookOpen,
  Plus,
  Search,
  FileText,
  CheckCircle2,
  Clock,
  Filter,
  Trash,
} from "lucide-react";
import { Button } from "../components/ui/button";
import { Input } from "../components/ui/input";
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
import { Label } from "../components/ui/label";
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
}

interface ReadingList {
  id: string;
  title: string;
  description: string;
  category: string;
  items: ReadingItem[];
  completedItems: number;
  totalPages?: number;
  estimatedHours: number;
  tags: string[];
  icon: string;
  color: string;
  createdAt: string;
}

const mockReadingLists: ReadingList[] = [
  {
    id: "1",
    title: "Web Development Essentials",
    description: "Essential reading materials for modern web development",
    category: "Web Development",
    items: [
      {
        id: "r1",
        title: "You Don't Know JS Yet",
        author: "Kyle Simpson",
        type: "book",
        url: "https://github.com/getify/You-Dont-Know-JS",
        completed: true,
      },
      {
        id: "r2",
        title: "Eloquent JavaScript",
        author: "Marijn Haverbeke",
        type: "book",
        url: "https://eloquentjavascript.net/",
        completed: true,
      },
      {
        id: "r3",
        title: "JavaScript: The Good Parts",
        author: "Douglas Crockford",
        type: "book",
        completed: false,
      },
      {
        id: "r4",
        title: "Modern JavaScript Features You Should Know",
        author: "MDN Web Docs",
        type: "article",
        url: "https://developer.mozilla.org/",
        completed: false,
      },
    ],
    completedItems: 2,
    totalPages: 850,
    estimatedHours: 25,
    tags: ["JavaScript", "Programming"],
    icon: "📚",
    color: "#3b82f6",
    createdAt: "2024-01-15",
  },
  {
    id: "2",
    title: "React Deep Dive",
    description: "Advanced reading materials for mastering React",
    category: "Frontend",
    items: [
      {
        id: "r5",
        title: "React Design Patterns and Best Practices",
        author: "Carlos Santana Roldán",
        type: "book",
        completed: false,
      },
      {
        id: "r6",
        title: "Understanding React Hooks",
        author: "Dan Abramov",
        type: "article",
        url: "https://overreacted.io/",
        completed: true,
      },
      {
        id: "r7",
        title: "A Complete Guide to useEffect",
        author: "Dan Abramov",
        type: "article",
        url: "https://overreacted.io/",
        completed: true,
      },
    ],
    completedItems: 2,
    totalPages: 320,
    estimatedHours: 12,
    tags: ["React", "Frontend"],
    icon: "⚛️",
    color: "#61dafb",
    createdAt: "2024-02-20",
  },
  {
    id: "3",
    title: "System Design Fundamentals",
    description: "Core concepts and patterns in system design",
    category: "System Design",
    items: [
      {
        id: "r8",
        title: "Designing Data-Intensive Applications",
        author: "Martin Kleppmann",
        type: "book",
        completed: false,
      },
      {
        id: "r9",
        title: "System Design Interview",
        author: "Alex Xu",
        type: "book",
        completed: false,
      },
      {
        id: "r10",
        title: "Microservices Patterns",
        author: "Chris Richardson",
        type: "article",
        completed: false,
      },
    ],
    completedItems: 0,
    totalPages: 720,
    estimatedHours: 30,
    tags: ["Architecture", "System Design"],
    icon: "🏗️",
    color: "#8b5cf6",
    createdAt: "2024-03-01",
  },
  {
    id: "4",
    title: "Clean Code Principles",
    description: "Best practices for writing maintainable code",
    category: "Software Engineering",
    items: [
      {
        id: "r11",
        title: "Clean Code",
        author: "Robert C. Martin",
        type: "book",
        completed: true,
      },
      {
        id: "r12",
        title: "The Pragmatic Programmer",
        author: "Andrew Hunt & David Thomas",
        type: "book",
        completed: false,
      },
      {
        id: "r13",
        title: "Refactoring: Improving the Design of Existing Code",
        author: "Martin Fowler",
        type: "book",
        completed: false,
      },
    ],
    completedItems: 1,
    totalPages: 920,
    estimatedHours: 35,
    tags: ["Best Practices", "Clean Code"],
    icon: "✨",
    color: "#10b981",
    createdAt: "2024-01-10",
  },
];

export function ReadingPage() {
  const [readingLists, setReadingLists] = useState<ReadingList[]>(mockReadingLists);
  const [selectedBook, setSelectedBook] = useState<ReadingItem | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [filterCategory, setFilterCategory] = useState<string>("all");
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [newList, setNewList] = useState({
    title: "",
    description: "",
    category: "",
    icon: "📖",
    color: "#3b82f6",
  });

  const handleCreateList = () => {
    if (!newList.title.trim()) {
      toast.error("Please enter a title for the reading list");
      return;
    }

    toast.success(`Reading list "${newList.title}" created!`);
    setIsCreateDialogOpen(false);
    setNewList({
      title: "",
      description: "",
      category: "",
      icon: "📖",
      color: "#3b82f6",
    });
  };

  // Filter logic
  const categories = ["all", ...new Set(readingLists.map((list) => list.category))];
  const filteredLists = readingLists.filter((list) => {
    const matchesSearch =
      list.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      list.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
      list.tags.some((tag) => tag.toLowerCase().includes(searchQuery.toLowerCase()));
    const matchesCategory = filterCategory === "all" || list.category === filterCategory;
    return matchesSearch && matchesCategory;
  });

  // Flatten all books from reading lists into a single gallery source
  const books = useMemo(() => {
    return readingLists.flatMap((list) =>
      list.items
        .filter((i) => i.type === "book")
        .map((i) => ({ ...i, listId: list.id, listTitle: list.title, listColor: list.color, listIcon: list.icon }))
    );
  }, [readingLists]);

  const filteredBooks = books.filter((b) => {
    const matchesQuery =
      b.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (b.author || "").toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCategory =
      filterCategory === "all" || readingLists.find((l) => l.id === b.listId)?.category === filterCategory;
    return matchesQuery && matchesCategory;
  });

  const handleToggleBookComplete = (bookId: string, listId: string) => {
    setReadingLists((prev) =>
      prev.map((list) => {
        if (list.id !== listId) return list;
        const items = list.items.map((it) =>
          it.id === bookId ? { ...it, completed: !it.completed } : it
        );
        const completedItems = items.filter((it) => it.completed).length;
        return { ...list, items, completedItems };
      })
    );
  };

  const handleDeleteBook = (bookId: string, listId: string) => {
    setReadingLists((prev) =>
      prev
        .map((list) => {
          if (list.id !== listId) return list;
          const items = list.items.filter((it) => it.id !== bookId);
          const completedItems = items.filter((it) => it.completed).length;
          return { ...list, items, completedItems };
        })
        .filter(Boolean)
    );
    if (selectedBook?.id === bookId) setSelectedBook(null);
    toast.success("Book removed");
  };

  // Statistics
  const totalLists = readingLists.length;
  const totalItems = readingLists.reduce((sum, list) => sum + list.items.length, 0);
  const completedItems = readingLists.reduce((sum, list) => sum + list.completedItems, 0);
  const totalHours = readingLists.reduce((sum, list) => sum + list.estimatedHours, 0);

  return (
    <div className="h-full flex flex-col">
      <div className="flex-1 overflow-y-auto">
        <div className="max-w-7xl mx-auto p-4 md:p-6 space-y-6">
          {/* Header */}
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
            <div>
              <h1 className="text-3xl font-bold text-gray-900 mb-2">Reading Lists</h1>
              <p className="text-gray-500">
                Manage books and articles for your learning journey
              </p>
            </div>
            <Button onClick={() => setIsCreateDialogOpen(true)}>
              <Plus className="w-4 h-4 mr-2" />
              Create Reading List
            </Button>
          </div>

          {/* Stats Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <Card className="p-4">
              <div className="flex items-center justify-between">
                <div className="p-2 bg-blue-100 rounded-lg">
                  <BookOpen className="w-5 h-5 text-blue-600" />
                </div>
                <div>
                  <p className="text-2xl font-bold text-gray-900">{totalLists}</p>
                  <p className="text-sm text-gray-500">Reading Lists</p>
                </div>
              </div>
            </Card>

            <Card className="p-4">
              <div className="flex items-center justify-between">
                <div className="p-2 bg-purple-100 rounded-lg">
                  <FileText className="w-5 h-5 text-purple-600" />
                </div>
                <div>
                  <p className="text-2xl font-bold text-gray-900">{totalItems}</p>
                  <p className="text-sm text-gray-500">Total Items</p>
                </div>
              </div>
            </Card>

            <Card className="p-4">
              <div className="flex items-center justify-between">
                <div className="p-2 bg-green-100 rounded-lg">
                  <CheckCircle2 className="w-5 h-5 text-green-600" />
                </div>
                <div>
                  <p className="text-2xl font-bold text-gray-900">{completedItems}</p>
                  <p className="text-sm text-gray-500">Completed</p>
                </div>
              </div>
            </Card>

            <Card className="p-4">
              <div className="flex items-center justify-between">
                <div className="p-2 bg-orange-100 rounded-lg">
                  <Clock className="w-5 h-5 text-orange-600" />
                </div>
                <div>
                  <p className="text-2xl font-bold text-gray-900">{totalHours}h</p>
                  <p className="text-sm text-gray-500">Est. Hours</p>
                </div>
              </div>
            </Card>
          </div>

          {/* Search and Filter */}
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
              <Input
                placeholder="Search reading lists, tags..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10"
              />
            </div>
            <Select value={filterCategory} onValueChange={setFilterCategory}>
              <SelectTrigger className="w-full sm:w-[200px]">
                <Filter className="w-4 h-4 mr-2" />
                <SelectValue placeholder="All Categories" />
              </SelectTrigger>
              <SelectContent>
                {categories.map((category) => (
                  <SelectItem key={category} value={category}>
                    {category === "all" ? "All Categories" : category}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Books Gallery */}
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-4">
            {filteredBooks.map((book) => (
              <Card key={book.id} className="p-0 relative hover:shadow-md transition-shadow flex flex-col">
                <div className="h-28 relative flex items-center justify-center text-4xl" style={{ backgroundColor: `${(book as any).listColor}10` }}>
                  <span>{(book as any).listIcon}</span>
                  <button
                    onClick={() => handleDeleteBook(book.id, (book as any).listId)}
                    className="absolute top-2 right-2 inline-flex items-center justify-center p-1 rounded-md text-gray-500 hover:text-red-600 hover:bg-white/60 shadow"
                    aria-label="Delete book"
                    title="Delete"
                  >
                    <Trash className="w-3 h-3" />
                  </button>
                </div>

                <div className="p-4 flex-1 flex flex-col">
                  <div>
                    <h4 className="text-sm font-semibold text-gray-900 line-clamp-2">{book.title}</h4>
                    <p className="text-xs text-gray-500">{book.author}</p>
                    <p className="text-xs text-gray-400 mt-2">From: {(book as any).listTitle}</p>
                  </div>

                  <div className="mt-auto">
                    <div className="flex items-center gap-2">
                      <Button className="flex-1 py-1 px-2 text-xs" variant="outline" onClick={() => setSelectedBook(book)}>
                        Details
                      </Button>
                      <Button className="flex-1 py-1 px-2 text-xs" onClick={() => handleToggleBookComplete(book.id, (book as any).listId)}>
                        {book.completed ? "Mark Unread" : "Mark Read"}
                      </Button>
                    </div>
                  </div>
                </div>
              </Card>
            ))}
          </div>

          {/* Empty State */}
          {filteredLists.length === 0 && (
            <div className="text-center py-12">
              <BookOpen className="w-12 h-12 text-gray-400 mx-auto mb-4" />
              <p className="text-gray-500 mb-4">No reading lists found</p>
              <Button onClick={() => setIsCreateDialogOpen(true)}>
                <Plus className="w-4 h-4 mr-2" />
                Create Your First Reading List
              </Button>
            </div>
          )}
        </div>
      </div>

      {/* Create Reading List Dialog */}
      <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Create Reading List</DialogTitle>
            <DialogDescription>
              Create a new collection of books and articles
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="title">List Title</Label>
              <Input
                id="title"
                placeholder="e.g., JavaScript Mastery"
                value={newList.title}
                onChange={(e) => setNewList({ ...newList, title: e.target.value })}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="category">Category</Label>
              <Input
                id="category"
                placeholder="e.g., Programming"
                value={newList.category}
                onChange={(e) => setNewList({ ...newList, category: e.target.value })}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="description">Description</Label>
              <Input
                id="description"
                placeholder="Brief description of the list"
                value={newList.description}
                onChange={(e) =>
                  setNewList({ ...newList, description: e.target.value })
                }
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="icon">Icon (emoji)</Label>
                <Input
                  id="icon"
                  placeholder="📖"
                  value={newList.icon}
                  onChange={(e) => setNewList({ ...newList, icon: e.target.value })}
                  maxLength={2}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="color">Color</Label>
                <div className="flex gap-2">
                  <Input
                    id="color"
                    type="color"
                    value={newList.color}
                    onChange={(e) =>
                      setNewList({ ...newList, color: e.target.value })
                    }
                    className="w-16 h-10 p-1"
                  />
                  <Input
                    value={newList.color}
                    onChange={(e) =>
                      setNewList({ ...newList, color: e.target.value })
                    }
                    className="flex-1"
                  />
                </div>
              </div>
            </div>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setIsCreateDialogOpen(false)}>
              Cancel
            </Button>
            <Button onClick={handleCreateList}>Create List</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
