import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Download, X } from 'lucide-react';

const PWAInstallPrompt = () => {
  const [deferredPrompt, setDeferredPrompt] = useState<any>(null);
  const [showPrompt, setShowPrompt] = useState(false);

  useEffect(() => {
    const handler = (e: any) => {
      e.preventDefault();
      setDeferredPrompt(e);
      
      // Show prompt after a delay to not interrupt user
      setTimeout(() => {
        setShowPrompt(true);
      }, 10000);
    };

    window.addEventListener('beforeinstallprompt', handler);

    return () => {
      window.removeEventListener('beforeinstallprompt', handler);
    };
  }, []);

  const handleInstall = async () => {
    if (!deferredPrompt) return;

    deferredPrompt.prompt();
    const { outcome } = await deferredPrompt.userChoice;
    
    if (outcome === 'accepted') {
      console.log('PWA installed');
    }
    
    setDeferredPrompt(null);
    setShowPrompt(false);
  };

  const handleDismiss = () => {
    setShowPrompt(false);
    // Don't show again for this session
    setDeferredPrompt(null);
  };

  if (!showPrompt || !deferredPrompt) return null;

  return (
    <Card className="fixed bottom-4 left-4 right-4 z-50 max-w-sm mx-auto shadow-2xl border-0 bg-gradient-to-r from-blue-600 to-purple-600 text-white">
      <CardContent className="p-4">
        <div className="flex items-start justify-between">
          <div className="flex items-center gap-3 flex-1">
            <div className="p-2 bg-white/20 rounded-lg">
              <Download className="h-5 w-5" />
            </div>
            <div>
              <h3 className="font-semibold text-sm">Install Skilloop.io</h3>
              <p className="text-xs text-white/90 mt-1">
                Get the app for a faster experience
              </p>
            </div>
          </div>
          <button
            onClick={handleDismiss}
            className="text-white/80 hover:text-white p-1"
          >
            <X className="h-4 w-4" />
          </button>
        </div>
        <div className="flex gap-2 mt-3">
          <Button
            onClick={handleInstall}
            variant="secondary"
            size="sm"
            className="flex-1 bg-white text-blue-600 hover:bg-white/90"
          >
            Install
          </Button>
          <Button
            onClick={handleDismiss}
            variant="ghost"
            size="sm"
            className="text-white/80 hover:text-white hover:bg-white/10"
          >
            Later
          </Button>
        </div>
      </CardContent>
    </Card>
  );
};

export default PWAInstallPrompt;