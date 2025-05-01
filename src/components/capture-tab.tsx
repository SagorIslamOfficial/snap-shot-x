import { useState } from "react";
import { Camera, Monitor, CropIcon, Timer, Play, Square, Download } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Slider } from "@/components/ui/slider";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { toast } from "@/hooks/use-toast";
import { Screenshot } from "@/types";

interface CaptureTabProps {
    onCapture: (screenshot: Screenshot) => void;
}

export function CaptureTab({ onCapture }: CaptureTabProps) {
    const [captureMode, setCaptureMode] = useState<"fullscreen" | "selection">("fullscreen");
    const [format, setFormat] = useState<"png" | "jpeg" | "webp">("png");
    const [quality, setQuality] = useState(90);
    const [width, setWidth] = useState(100);
    const [height, setHeight] = useState(100);
    const [customSize, setCustomSize] = useState(false);
    const [interval, setInterval] = useState(0);
    const [isCapturing, setIsCapturing] = useState(false);
    const [captureCount, setCaptureCount] = useState(0);
    const [intervalId, setIntervalId] = useState<number | null>(null);

    const isExtension = typeof chrome !== "undefined" && chrome.runtime && chrome.runtime.id;

    const captureScreenshot = async () => {
        try {
            let dataUrl: string;

            if (isExtension) {
                // Chrome extension capture method
                const response = await chrome.runtime.sendMessage({
                    action: "captureScreenshot",
                    options: {
                        format,
                        quality: quality / 100,
                    },
                });

                if (!response.success) {
                    throw new Error(response.error || "Failed to capture screenshot");
                }

                dataUrl = response.dataUrl;
            } else {
                // Web app capture method using HTML2Canvas
                const video = document.createElement("video");
                const canvas = document.createElement("canvas");
                const ctx = canvas.getContext("2d");

                try {
                    const stream = await navigator.mediaDevices.getDisplayMedia({
                        video: {
                            cursor: "always",
                        },
                        audio: false,
                    });

                    video.srcObject = stream;
                    await video.play();

                    canvas.width = customSize ? width : video.videoWidth;
                    canvas.height = customSize ? height : video.videoHeight;

                    ctx?.drawImage(video, 0, 0, canvas.width, canvas.height);
                    dataUrl = canvas.toDataURL(`image/${format}`, quality / 100);

                    // Stop all tracks
                    stream.getTracks().forEach((track) => track.stop());
                } catch (err) {
                    throw new Error("Screen capture permission denied");
                }
            }

            // Process the image if custom size is enabled
            let processedDataUrl = dataUrl;
            if (customSize && !isExtension) {
                processedDataUrl = await resizeImage(dataUrl, width, height);
            }

            // Create screenshot object
            const screenshot: Screenshot = {
                id: Date.now().toString(),
                dataUrl: processedDataUrl,
                format,
                timestamp: new Date().toISOString(),
                name: `Screenshot_${new Date().toLocaleTimeString().replace(/:/g, "-")}`,
                tags: [],
            };

            // Add to gallery
            onCapture(screenshot);

            // Show success toast
            toast({
                title: "Screenshot captured",
                description: "Screenshot has been added to your gallery.",
            });

            setCaptureCount((prev) => prev + 1);
        } catch (error) {
            console.error("Capture error:", error);
            toast({
                variant: "destructive",
                title: "Capture failed",
                description: error instanceof Error ? error.message : "Unknown error occurred",
            });
        }
    };

    const resizeImage = (dataUrl: string, width: number, height: number): Promise<string> => {
        return new Promise((resolve, reject) => {
            const img = new Image();
            img.onload = () => {
                const canvas = document.createElement("canvas");
                canvas.width = width;
                canvas.height = height;
                const ctx = canvas.getContext("2d");

                if (!ctx) {
                    reject(new Error("Could not get canvas context"));
                    return;
                }

                ctx.drawImage(img, 0, 0, width, height);
                resolve(canvas.toDataURL(`image/${format}`, quality / 100));
            };

            img.onerror = () => reject(new Error("Failed to load image"));
            img.src = dataUrl;
        });
    };

    const startIntervalCapture = () => {
        if (interval <= 0) {
            toast({
                variant: "destructive",
                title: "Invalid interval",
                description: "Please set a valid interval greater than 0 seconds",
            });
            return;
        }

        setIsCapturing(true);

        // Capture immediately
        captureScreenshot();

        // Set up interval
        const id = window.setInterval(() => {
            captureScreenshot();
        }, interval * 1000);

        setIntervalId(id);
    };

    const stopIntervalCapture = () => {
        if (intervalId !== null) {
            clearInterval(intervalId);
            setIntervalId(null);
        }

        setIsCapturing(false);

        toast({
            title: "Capture stopped",
            description: `Captured ${captureCount} screenshots`,
        });

        setCaptureCount(0);
    };

    return (
        <div className="mt-4 h-full overflow-y-auto">
            <Card className="mb-4">
                <CardContent className="pt-6">
                    <div className="space-y-4">
                        <div className="flex items-center justify-between">
                            <Label htmlFor="capture-mode">Capture Mode</Label>
                            <Select value={captureMode} onValueChange={(value) => setCaptureMode(value as "fullscreen" | "selection")}>
                                <SelectTrigger className="w-[180px]">
                                    <SelectValue placeholder="Select mode" />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="fullscreen">
                                        <div className="flex items-center gap-2">
                                            <Monitor className="h-4 w-4" />
                                            <span>Full Screen</span>
                                        </div>
                                    </SelectItem>
                                    <SelectItem value="selection">
                                        <div className="flex items-center gap-2">
                                            <CropIcon className="h-4 w-4" />
                                            <span>Selection</span>
                                        </div>
                                    </SelectItem>
                                </SelectContent>
                            </Select>
                        </div>

                        <div className="flex items-center justify-between">
                            <Label htmlFor="format">Format</Label>
                            <Select value={format} onValueChange={(value) => setFormat(value as "png" | "jpeg" | "webp")}>
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

                        <div className="space-y-4 pb-2">
                            <div className="flex items-center justify-between">
                                <Label htmlFor="quality">Quality: {quality}%</Label>
                            </div>
                            <Slider id="quality" min={10} max={100} step={1} value={[quality]} onValueChange={(value) => setQuality(value[0])} />
                        </div>

                        <div className="flex items-center space-x-2">
                            <Switch className="p-0" id="custom-size" checked={customSize} onCheckedChange={setCustomSize} />
                            <Label htmlFor="custom-size">Custom Size</Label>
                        </div>

                        {customSize && (
                            <div className="grid grid-cols-2 gap-6">
                                <div className="space-y-2">
                                    <Label htmlFor="width">Width (px)</Label>
                                    <Input id="width" type="number" value={width} onChange={(e) => setWidth(parseInt(e.target.value) || 100)} min={10} max={2000} />
                                </div>
                                <div className="space-y-2">
                                    <Label htmlFor="height">Height (px)</Label>
                                    <Input id="height" type="number" value={height} onChange={(e) => setHeight(parseInt(e.target.value) || 100)} min={10} max={2000} />
                                </div>
                            </div>
                        )}

                        <div className="space-y-2">
                            <Label htmlFor="interval">Capture Interval (seconds)</Label>
                            <div className="flex items-center gap-6">
                                <Input id="interval" type="number" value={interval} onChange={(e) => setInterval(parseInt(e.target.value) || 0)} min={0} className="flex-1" disabled={isCapturing} />
                                {isCapturing ? (
                                    <Button variant="destructive" onClick={stopIntervalCapture}>
                                        Stop
                                    </Button>
                                ) : (
                                    <Button variant="secondary" onClick={startIntervalCapture} disabled={interval <= 0}>
                                        <Play className="h-4 w-4 mr-2" />
                                        Start
                                    </Button>
                                )}
                            </div>
                        </div>
                    </div>
                </CardContent>
            </Card>

            <div className="flex justify-center">
                <Button size="lg" onClick={captureScreenshot} disabled={isCapturing} className="gap-2">
                    <Camera className="h-5 w-5" />
                    Capture Screenshot
                </Button>
            </div>

            {isCapturing && (
                <div className="mt-4 p-3 bg-muted rounded-md flex items-center justify-between">
                    <div className="flex items-center gap-2">
                        <div className="h-3 w-3 rounded-full bg-red-500 animate-pulse" />
                        <span>Capturing... ({captureCount})</span>
                    </div>
                    <Button variant="outline" size="sm" onClick={stopIntervalCapture}>
                        Stop
                    </Button>
                </div>
            )}
        </div>
    );
}
