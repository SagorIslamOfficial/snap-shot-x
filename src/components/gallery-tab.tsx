import { useState } from 'react';
import { Download, Trash2, Edit, Tag, MoreVertical, Archive } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from '@/components/ui/alert-dialog';
import { toast } from '@/hooks/use-toast';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { Screenshot } from '@/types';

interface GalleryTabProps {
  screenshots: Screenshot[];
  onDelete: (id: string) => void;
  onUpdate: (id: string, data: Partial<Screenshot>) => void;
  onClear: () => void;
}

export function GalleryTab({ screenshots, onDelete, onUpdate, onClear }: GalleryTabProps) {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedScreenshot, setSelectedScreenshot] = useState<Screenshot | null>(null);

  const filteredScreenshots = screenshots.filter(screenshot => 
    screenshot.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    screenshot.tags.some(tag => tag.toLowerCase().includes(searchTerm.toLowerCase()))
  );

  const handleDownload = (screenshot: Screenshot) => {
    const a = document.createElement('a');
    a.href = screenshot.dataUrl;
    a.download = `${screenshot.name}.${screenshot.format}`;
    a.click();
    
    toast({
      title: 'Download started',
      description: `Downloading ${screenshot.name}.${screenshot.format}`
    });
  };

  const handleDownloadAll = async () => {
    try {
      const zip = new JSZip();
      
      screenshots.forEach(screenshot => {
        const filename = `${screenshot.name}.${screenshot.format}`;
        // Remove the data URL prefix to get just the base64 data
        const base64Data = screenshot.dataUrl.split(',')[1];
        zip.file(filename, base64Data, { base64: true });
      });
      
      const content = await zip.generateAsync({ type: 'blob' });
      const url = URL.createObjectURL(content);
      
      const a = document.createElement('a');
      a.href = url;
      a.download = 'screenshots.zip';
      a.click();
      
      URL.revokeObjectURL(url);
      
      toast({
        title: 'Download started',
        description: 'Downloading all screenshots as ZIP'
      });
    } catch (error) {
      console.error('Failed to create ZIP:', error);
      toast({
        variant: 'destructive',
        title: 'Download failed',
        description: 'Failed to create ZIP file'
      });
    }
  };

  const handleRename = (screenshot: Screenshot, newName: string) => {
    if (newName.trim()) {
      onUpdate(screenshot.id, { name: newName.trim() });
      toast({
        title: 'Screenshot renamed',
        description: `Renamed to ${newName}`
      });
    }
  };

  const handleAddTag = (screenshot: Screenshot, tag: string) => {
    if (tag.trim() && !screenshot.tags.includes(tag.trim())) {
      onUpdate(screenshot.id, { 
        tags: [...screenshot.tags, tag.trim()]
      });
      toast({
        title: 'Tag added',
        description: `Added tag: ${tag}`
      });
    }
  };

  const handleRemoveTag = (screenshot: Screenshot, tagToRemove: string) => {
    onUpdate(screenshot.id, {
      tags: screenshot.tags.filter(tag => tag !== tagToRemove)
    });
    toast({
      title: 'Tag removed',
      description: `Removed tag: ${tagToRemove}`
    });
  };

  const handleClearAll = () => {
    onClear();
    toast({
      title: 'Gallery cleared',
      description: 'All screenshots have been removed'
    });
  };

  return (
    <div className="p-4 h-full flex flex-col">
      <div className="flex items-center justify-between mb-4">
        <Input
          type="search"
          placeholder="Search screenshots..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="max-w-sm"
        />
        
        <div className="flex gap-2">
          <Button
            variant="outline"
            onClick={handleDownloadAll}
            disabled={screenshots.length === 0}
          >
            <Download className="h-4 w-4 mr-2" />
            Download All
          </Button>
          
          <AlertDialog>
            <AlertDialogTrigger asChild>
              <Button
                variant="destructive"
                disabled={screenshots.length === 0}
              >
                <Trash2 className="h-4 w-4 mr-2" />
                Clear All
              </Button>
            </AlertDialogTrigger>
            <AlertDialogContent>
              <AlertDialogHeader>
                <AlertDialogTitle>Clear all screenshots?</AlertDialogTitle>
                <AlertDialogDescription>
                  This action cannot be undone. All screenshots will be permanently deleted.
                </AlertDialogDescription>
              </AlertDialogHeader>
              <AlertDialogFooter>
                <AlertDialogCancel>Cancel</AlertDialogCancel>
                <AlertDialogAction onClick={handleClearAll}>
                  Clear All
                </AlertDialogAction>
              </AlertDialogFooter>
            </AlertDialogContent>
          </AlertDialog>
        </div>
      </div>

      <ScrollArea className="flex-1">
        <div className="grid grid-cols-2 gap-4">
          {filteredScreenshots.map(screenshot => (
            <Card key={screenshot.id} className="overflow-hidden">
              <div className="relative group">
                <img
                  src={screenshot.dataUrl}
                  alt={screenshot.name}
                  className="w-full h-32 object-cover"
                />
                
                <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2">
                  <Button
                    size="sm"
                    variant="secondary"
                    onClick={() => handleDownload(screenshot)}
                  >
                    <Download className="h-4 w-4" />
                  </Button>
                  
                  <Dialog>
                    <DialogTrigger asChild>
                      <Button
                        size="sm"
                        variant="secondary"
                        onClick={() => setSelectedScreenshot(screenshot)}
                      >
                        <Edit className="h-4 w-4" />
                      </Button>
                    </DialogTrigger>
                    <DialogContent>
                      <DialogHeader>
                        <DialogTitle>Edit Screenshot</DialogTitle>
                      </DialogHeader>
                      <div className="space-y-4">
                        <div>
                          <Label htmlFor="name">Name</Label>
                          <Input
                            id="name"
                            defaultValue={screenshot.name}
                            onBlur={(e) => handleRename(screenshot, e.target.value)}
                          />
                        </div>
                        
                        <div>
                          <Label htmlFor="tags">Add Tag</Label>
                          <div className="flex gap-2">
                            <Input
                              id="tags"
                              placeholder="Enter tag..."
                              onKeyPress={(e) => {
                                if (e.key === 'Enter') {
                                  handleAddTag(screenshot, (e.target as HTMLInputElement).value);
                                  (e.target as HTMLInputElement).value = '';
                                }
                              }}
                            />
                          </div>
                          
                          <div className="flex flex-wrap gap-2 mt-2">
                            {screenshot.tags.map(tag => (
                              <div
                                key={tag}
                                className="bg-secondary text-secondary-foreground px-2 py-1 rounded-md text-sm flex items-center gap-1"
                              >
                                {tag}
                                <button
                                  onClick={() => handleRemoveTag(screenshot, tag)}
                                  className="hover:text-destructive"
                                >
                                  ×
                                </button>
                              </div>
                            ))}
                          </div>
                        </div>
                      </div>
                    </DialogContent>
                  </Dialog>
                  
                  <AlertDialog>
                    <AlertDialogTrigger asChild>
                      <Button
                        size="sm"
                        variant="destructive"
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </AlertDialogTrigger>
                    <AlertDialogContent>
                      <AlertDialogHeader>
                        <AlertDialogTitle>Delete screenshot?</AlertDialogTitle>
                        <AlertDialogDescription>
                          This action cannot be undone. The screenshot will be permanently deleted.
                        </AlertDialogDescription>
                      </AlertDialogHeader>
                      <AlertDialogFooter>
                        <AlertDialogCancel>Cancel</AlertDialogCancel>
                        <AlertDialogAction onClick={() => onDelete(screenshot.id)}>
                          Delete
                        </AlertDialogAction>
                      </AlertDialogFooter>
                    </AlertDialogContent>
                  </AlertDialog>
                </div>
              </div>
              
              <div className="p-3">
                <div className="flex items-center justify-between">
                  <p className="font-medium truncate" title={screenshot.name}>
                    {screenshot.name}
                  </p>
                  
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="ghost" size="sm">
                        <MoreVertical className="h-4 w-4" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                      <DropdownMenuItem onClick={() => handleDownload(screenshot)}>
                        <Download className="h-4 w-4 mr-2" />
                        Download
                      </DropdownMenuItem>
                      <DropdownMenuItem onClick={() => setSelectedScreenshot(screenshot)}>
                        <Edit className="h-4 w-4 mr-2" />
                        Edit
                      </DropdownMenuItem>
                      <DropdownMenuItem onClick={() => onDelete(screenshot.id)}>
                        <Trash2 className="h-4 w-4 mr-2" />
                        Delete
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </div>
                
                {screenshot.tags.length > 0 && (
                  <div className="flex flex-wrap gap-1 mt-2">
                    {screenshot.tags.map(tag => (
                      <span
                        key={tag}
                        className="bg-secondary text-secondary-foreground px-1.5 py-0.5 rounded text-xs"
                      >
                        {tag}
                      </span>
                    ))}
                  </div>
                )}
                
                <p className="text-xs text-muted-foreground mt-1">
                  {new Date(screenshot.timestamp).toLocaleString()}
                </p>
              </div>
            </Card>
          ))}
        </div>
      </ScrollArea>
    </div>
  );
}