import { useState } from "react";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "./ui/dialog";
import { Button } from "./ui/button";
import { Input } from "./ui/input";
import { Label } from "./ui/label";
import { RadioGroup, RadioGroupItem } from "./ui/radio-group";
import { Loader2 } from "lucide-react";
import { toast } from "sonner";

interface ImportDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function ImportDialog({ open, onOpenChange }: ImportDialogProps) {
  const [url, setUrl] = useState("");
  const [type, setType] = useState<"video" | "playlist" | "channel">("video");
  const [isImporting, setIsImporting] = useState(false);

  const handleImport = async () => {
    if (!url.trim()) {
      toast.error("Please enter a URL");
      return;
    }

    setIsImporting(true);

    try {
      // Mock API call - replace with actual API endpoint
      await new Promise((resolve) => setTimeout(resolve, 2000));

      // Simulate API call: POST /api/import/youtube
      const response = await fetch("/api/import/youtube", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ url, type }),
      }).catch(() => null);

      // For demo purposes, show success
      toast.success(`${type.charAt(0).toUpperCase() + type.slice(1)} imported successfully!`);
      setUrl("");
      onOpenChange(false);
    } catch (error) {
      toast.error("Failed to import. Please check the URL and try again.");
    } finally {
      setIsImporting(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Import from YouTube</DialogTitle>
          <DialogDescription>
            Import videos, playlists, or channels for offline learning
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 py-4">
          <div className="space-y-2">
            <Label htmlFor="url">YouTube URL</Label>
            <Input
              id="url"
              placeholder="https://www.youtube.com/watch?v=..."
              value={url}
              onChange={(e) => setUrl(e.target.value)}
              disabled={isImporting}
            />
          </div>

          <div className="space-y-2">
            <Label>Import Type</Label>
            <RadioGroup value={type} onValueChange={(value) => setType(value as any)} disabled={isImporting}>
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="video" id="video" />
                <Label htmlFor="video" className="font-normal cursor-pointer">
                  Single Video
                </Label>
              </div>
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="playlist" id="playlist" />
                <Label htmlFor="playlist" className="font-normal cursor-pointer">
                  Playlist
                </Label>
              </div>
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="channel" id="channel" />
                <Label htmlFor="channel" className="font-normal cursor-pointer">
                  Channel
                </Label>
              </div>
            </RadioGroup>
          </div>
        </div>

        <DialogFooter>
          <Button
            variant="outline"
            onClick={() => onOpenChange(false)}
            disabled={isImporting}
          >
            Cancel
          </Button>
          <Button onClick={handleImport} disabled={isImporting}>
            {isImporting && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
            Import
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
