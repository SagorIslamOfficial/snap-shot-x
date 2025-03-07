import { useState } from "react";
import { Save, RefreshCw, Trash2, Download, Upload, CloudUpload, CloudOff } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { Separator } from "@/components/ui/separator";
import { toast } from "@/hooks/use-toast";

export function SettingsTab() {
  const [autoSave, setAutoSave] = useState(true);
  const [defaultFormat, setDefaultFormat] = useState<"png" | "jpeg" | "webp">("png");
  const [defaultQuality, setDefaultQuality] = useState(90);
  const [cloudSync, setCloudSync] = useState(false);
  const [cloudProvider, setCloudProvider] = useState<"google" | "dropbox">("google");
  const [notificationsEnabled, setNotificationsEnabled] = useState(true);
  const [captureHotkey, setCaptureHotkey] = useState("Ctrl+Shift+S");
  const [darkMode, setDarkMode] = useState(true);
  
  const handleSaveSettings = () => {
    // Save settings to chrome.storage
    const settings = {
      autoSave,
      defaultFormat,
      defaultQuality,
      cloudSync,
      cloudProvider,
      notificationsEnabled,
      captureHotkey,
      darkMode
    };
    
    try {
      if (chrome.storage) {
        chrome.storage.sync.set({ settings });
      } else {
        localStorage.setItem('settings', JSON.stringify(settings));
      }
      
      toast({
        title: "Settings saved",
        description: "Your preferences have been updated"
      });
    } catch (error) {
      console.error('Failed to save settings:', error);
      toast({
        variant: "destructive",
        title: "Save failed",
        description: "Could not save your settings"
      });
    }
  };
  
  const handleResetSettings = () => {
    if (confirm("Reset all settings to default values?")) {
      setAutoSave(true);
      setDefaultFormat("png");
      setDefaultQuality(90);
      setCloudSync(false);
      setCloudProvider("google");
      setNotificationsEnabled(true);
      setCaptureHotkey("Ctrl+Shift+S");
      setDarkMode(true);
      
      toast({
        title: "Settings reset",
        description: "All settings have been reset to defaults"
      });
    }
  };
  
  const handleExportSettings = () => {
    const settings = {
      autoSave,
      defaultFormat,
      defaultQuality,
      cloudSync,
      cloudProvider,
      notificationsEnabled,
      captureHotkey,
      darkMode
    };
    
    const blob = new Blob([JSON.stringify(settings, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    
    const a = document.createElement('a');
    a.href = url;
    a.download = 'snapshot-pro-settings.json';
    a.click();
    
    URL.revokeObjectURL(url);
    
    toast({
      title: "Settings exported",
      description: "Your settings have been exported to a file"
    });
  };
  
  const handleImportSettings = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;
    
    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const settings = JSON.parse(e.target?.result as string);
        
        // Update state with imported settings
        if (settings.autoSave !== undefined) setAutoSave(settings.autoSave);
        if (settings.defaultFormat) setDefaultFormat(settings.defaultFormat);
        if (settings.defaultQuality !== undefined) setDefaultQuality(settings.defaultQuality);
        if (settings.cloudSync !== undefined) setCloudSync(settings.cloudSync);
        if (settings.cloudProvider) setCloudProvider(settings.cloudProvider);
        if (settings.notificationsEnabled !== undefined) setNotificationsEnabled(settings.notificationsEnabled);
        if (settings.captureHotkey) setCaptureHotkey(settings.captureHotkey);
        if (settings.darkMode !== undefined) setDarkMode(settings.darkMode);
        
        toast({
          title: "Settings imported",
          description: "Your settings have been updated from the imported file"
        });
      } catch (error) {
        console.error('Failed to parse settings file:', error);
        toast({
          variant: "destructive",
          title: "Import failed",
          description: "The selected file is not a valid settings file"
        });
      }
    };
    
    reader.readAsText(file);
    
    // Reset the input
    event.target.value = '';
  };
  
  const handleConnectCloud = () => {
    toast({
      title: "Cloud connection",
      description: `This would connect to ${cloudProvider === 'google' ? 'Google Drive' : 'Dropbox'} in a real extension`
    });
  };
  
  const handleDisconnectCloud = () => {
    if (confirm(`Disconnect from ${cloudProvider === 'google' ? 'Google Drive' : 'Dropbox'}?`)) {
      setCloudSync(false);
      toast({
        title: "Cloud disconnected",
        description: `Your account has been disconnected from ${cloudProvider === 'google' ? 'Google Drive' : 'Dropbox'}`
      });
    }
  };

  return (
    <div className="p-4 h-full overflow-y-auto">
      <div className="space-y-4">
        <Card>
          <CardHeader>
            <CardTitle>General Settings</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between">
              <Label htmlFor="auto-save">Auto-save screenshots</Label>
              <Switch
                id="auto-save"
                checked={autoSave}
                onCheckedChange={setAutoSave}
              />
            </div>
            
            <div className="flex items-center justify-between">
              <Label htmlFor="default-format">Default format</Label>
              <Select 
                value={defaultFormat} 
                onValueChange={(value) => setDefaultFormat(value as "png" | "jpeg" | "webp")}
              >
                <SelectTrigger className="w-[180px]">
                  <SelectValue placeholder="Select format" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="png">PNG</SelectItem>
                  <SelectItem value="jpeg">JPEG</SelectItem>
                  <SelectItem value="webp">WebP</SelectItem>
                </SelectContent>
              </Select>
            </div>
            
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <Label htmlFor="default-quality">Default quality: {defaultQuality}%</Label>
              </div>
              <Input
                id="default-quality"
                type="range"
                min={10}
                max={100}
                step={1}
                value={defaultQuality}
                onChange={(e) => setDefaultQuality(parseInt(e.target.value))}
                className="w-full"
              />
            </div>
            
            <div className="flex items-center justify-between">
              <Label htmlFor="notifications">Enable notifications</Label>
              <Switch
                id="notifications"
                checked={notificationsEnabled}
                onCheckedChange={setNotificationsEnabled}
              />
            </div>
            
            <div className="flex items-center justify-between">
              <Label htmlFor="dark-mode">Dark mode</Label>
              <Switch
                id="dark-mode"
                checked={darkMode}
                onCheckedChange={setDarkMode}
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="capture-hotkey">Capture hotkey</Label>
              <Input
                id="capture-hotkey"
                value={captureHotkey}
                onChange={(e) => setCaptureHotkey(e.target.value)}
                placeholder="e.g. Ctrl+Shift+S"
              />
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader>
            <CardTitle>Cloud Sync</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between">
              <Label htmlFor="cloud-sync">Enable cloud sync</Label>
              <Switch
                id="cloud-sync"
                checked={cloudSync}
                onCheckedChange={setCloudSync}
              />
            </div>
            
            {cloudSync && (
              <>
                <div className="flex items-center justify-between">
                  <Label htmlFor="cloud-provider">Cloud provider</Label>
                  <Select 
                    value={cloudProvider} 
                    onValueChange={(value) => setCloudProvider(value as "google" | "dropbox")}
                  >
                    <SelectTrigger className="w-[180px]">
                      <SelectValue placeholder="Select provider" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="google">Google Drive</SelectItem>
                      <SelectItem value="dropbox">Dropbox</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                
                <div className="flex justify-between">
                  <Button variant="outline" onClick={handleConnectCloud}>
                    <CloudUpload className="h-4 w-4 mr-2" />
                    Connect
                  </Button>
                  <Button variant="outline" onClick={handleDisconnectCloud}>
                    <CloudOff className="h-4 w-4 mr-2" />
                    Disconnect
                  </Button>
                </div>
              </>
            )}
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader>
            <CardTitle>Backup & Restore</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex justify-between">
              <Button variant="outline" onClick={handleExportSettings}>
                <Download className="h-4 w-4 mr-2" />
                Export Settings
              </Button>
              
              <div>
                <Input
                  type="file"
                  id="import-settings"
                  className="hidden"
                  accept=".json"
                  onChange={handleImportSettings}
                />
                <Button variant="outline" onClick={() => document.getElementById('import-settings')?.click()}>
                  <Upload className="h-4 w-4 mr-2" />
                  Import Settings
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Separator />
        
        <div className="flex justify-between">
          <Button variant="outline" onClick={handleResetSettings}>
            <RefreshCw className="h-4 w-4 mr-2" />
            Reset to Defaults
          </Button>
          
          <Button onClick={handleSaveSettings}>
            <Save className="h-4 w-4 mr-2" />
            Save Settings
          </Button>
        </div>
      </div>
    </div>
  );
}