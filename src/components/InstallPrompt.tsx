import { useState, useEffect } from 'react';
import { Download, X } from 'lucide-react';
import { TouchButton } from './TouchButton';

interface BeforeInstallPromptEvent extends Event {
  prompt: () => Promise<void>;
  userChoice: Promise<{ outcome: 'accepted' | 'dismissed' }>;
}

export const InstallPrompt = () => {
  const [deferredPrompt, setDeferredPrompt] = useState<BeforeInstallPromptEvent | null>(null);
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    const handler = (e: Event) => {
      e.preventDefault();
      setDeferredPrompt(e as BeforeInstallPromptEvent);
      
      // Show prompt after 30 seconds on site
      setTimeout(() => {
        setIsVisible(true);
      }, 30000);
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
      console.log('App installed');
    }

    setDeferredPrompt(null);
    setIsVisible(false);
  };

  if (!isVisible || !deferredPrompt) {
    return null;
  }

  return (
    <div className="fixed top-4 left-4 right-4 bg-gradient-to-r from-primary to-primary/90 rounded-lg shadow-lg p-4 z-50 md:left-auto md:right-4 md:max-w-md">
      <button
        onClick={() => setIsVisible(false)}
        className="absolute top-2 right-2 p-1 text-primary-foreground/80 hover:text-primary-foreground min-h-[44px] min-w-[44px] flex items-center justify-center"
      >
        <X size={20} />
      </button>
      
      <div className="flex items-start gap-3 text-primary-foreground">
        <div className="p-2 bg-background/20 rounded-lg">
          <Download size={24} />
        </div>
        
        <div className="flex-1">
          <h3 className="font-semibold mb-1">
            Install Ajor App
          </h3>
          <p className="text-sm text-primary-foreground/90 mb-3">
            Add to your home screen for quick access and offline use.
          </p>
          
          <TouchButton
            size="sm"
            onClick={handleInstall}
            className="bg-background text-primary hover:bg-background/90"
          >
            Install Now
          </TouchButton>
        </div>
      </div>
    </div>
  );
};
