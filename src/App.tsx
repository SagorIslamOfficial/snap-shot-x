import { useState } from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ThemeProvider } from "@/components/theme-provider";
import { Toaster } from "@/components/ui/toaster";
import { CaptureTab } from "@/components/capture-tab";
import { GalleryTab } from "@/components/gallery-tab";
import { SettingsTab } from "@/components/settings-tab";
import { Header } from "@/components/header";
import { Screenshot } from "@/types";
import { useScreenshots } from "@/hooks/use-screenshots";

function App() {
    const [activeTab, setActiveTab] = useState("capture");
    const { screenshots, addScreenshot, deleteScreenshot, updateScreenshot, clearScreenshots } = useScreenshots();

    return (
        <ThemeProvider defaultTheme="dark">
            <div className="w-[400px] h-[600px] flex flex-col bg-background text-foreground overflow-hidden">
                <Header />

                <Tabs value={activeTab} onValueChange={setActiveTab} className="flex-1 flex flex-col">
                    <TabsList className="grid grid-cols-3 mx-4">
                        <TabsTrigger value="capture">Capture</TabsTrigger>
                        <TabsTrigger value="gallery">Gallery</TabsTrigger>
                        <TabsTrigger value="settings">Settings</TabsTrigger>
                    </TabsList>

                    <div className="flex-1 overflow-hidden">
                        <TabsContent value="capture" className="h-full">
                            <CaptureTab onCapture={addScreenshot} />
                        </TabsContent>

                        <TabsContent value="gallery" className="h-full">
                            <GalleryTab screenshots={screenshots} onDelete={deleteScreenshot} onUpdate={updateScreenshot} onClear={clearScreenshots} />
                        </TabsContent>

                        <TabsContent value="settings" className="h-full">
                            <SettingsTab />
                        </TabsContent>
                    </div>
                </Tabs>

                <Toaster />
            </div>
        </ThemeProvider>
    );
}

export default App;
