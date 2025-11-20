import { useState } from 'react';
import { Bell, X } from 'lucide-react';
import { useNotifications } from '@/hooks/useNotifications';
import { TouchButton } from './TouchButton';

export const NotificationPrompt = () => {
  const [isVisible, setIsVisible] = useState(true);
  const { permission, requestPermission } = useNotifications();

  if (permission === 'granted' || permission === 'denied' || !isVisible) {
    return null;
  }

  const handleEnable = async () => {
    const granted = await requestPermission();
    if (granted) {
      setIsVisible(false);
    }
  };

  return (
    <div className="fixed bottom-20 left-4 right-4 bg-card rounded-lg shadow-lg p-4 z-40 md:bottom-4 md:left-auto md:right-4 md:max-w-md border border-border">
      <button
        onClick={() => setIsVisible(false)}
        className="absolute top-2 right-2 p-1 text-muted-foreground hover:text-foreground min-h-[44px] min-w-[44px] flex items-center justify-center"
      >
        <X size={20} />
      </button>
      
      <div className="flex items-start gap-3">
        <div className="p-2 bg-primary/10 rounded-lg">
          <Bell className="text-primary" size={24} />
        </div>
        
        <div className="flex-1">
          <h3 className="font-semibold text-foreground mb-1">
            Stay Updated
          </h3>
          <p className="text-sm text-muted-foreground mb-3">
            Get notified when someone pays, it's your payout week, or important group updates.
          </p>
          
          <div className="flex gap-2">
            <TouchButton
              size="sm"
              onClick={handleEnable}
            >
              Enable Notifications
            </TouchButton>
            <TouchButton
              size="sm"
              variant="ghost"
              onClick={() => setIsVisible(false)}
            >
              Not Now
            </TouchButton>
          </div>
        </div>
      </div>
    </div>
  );
};
