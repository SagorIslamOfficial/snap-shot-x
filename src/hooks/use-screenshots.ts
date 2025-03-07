import { useState, useEffect } from 'react';
import { Screenshot } from '@/types';

export function useScreenshots() {
  const [screenshots, setScreenshots] = useState<Screenshot[]>([]);

  // Load screenshots from storage on component mount
  useEffect(() => {
    const loadScreenshots = async () => {
      try {
        if (chrome.storage) {
          const result = await chrome.storage.local.get('screenshots');
          if (result.screenshots) {
            setScreenshots(result.screenshots);
          }
        }
      } catch (error) {
        console.error('Failed to load screenshots from storage:', error);
        // Fallback to localStorage if chrome.storage is not available (for development)
        try {
          const saved = localStorage.getItem('screenshots');
          if (saved) {
            setScreenshots(JSON.parse(saved));
          }
        } catch (e) {
          console.error('Failed to load screenshots from localStorage:', e);
        }
      }
    };

    loadScreenshots();
  }, []);

  // Save screenshots to storage whenever they change
  useEffect(() => {
    const saveScreenshots = async () => {
      try {
        if (chrome.storage) {
          await chrome.storage.local.set({ screenshots });
        } else {
          // Fallback to localStorage if chrome.storage is not available
          localStorage.setItem('screenshots', JSON.stringify(screenshots));
        }
      } catch (error) {
        console.error('Failed to save screenshots to storage:', error);
      }
    };

    if (screenshots.length > 0) {
      saveScreenshots();
    }
  }, [screenshots]);

  const addScreenshot = (screenshot: Screenshot) => {
    setScreenshots(prev => [screenshot, ...prev]);
  };

  const deleteScreenshot = (id: string) => {
    setScreenshots(prev => prev.filter(screenshot => screenshot.id !== id));
  };

  const updateScreenshot = (id: string, data: Partial<Screenshot>) => {
    setScreenshots(prev =>
      prev.map(screenshot =>
        screenshot.id === id ? { ...screenshot, ...data } : screenshot
      )
    );
  };

  const clearScreenshots = () => {
    setScreenshots([]);
    try {
      if (chrome.storage) {
        chrome.storage.local.remove('screenshots');
      } else {
        localStorage.removeItem('screenshots');
      }
    } catch (error) {
      console.error('Failed to clear screenshots from storage:', error);
    }
  };

  return {
    screenshots,
    addScreenshot,
    deleteScreenshot,
    updateScreenshot,
    clearScreenshots,
  };
}