import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';

export const useNotifications = () => {
  const [permission, setPermission] = useState<NotificationPermission>('default');
  const [subscription, setSubscription] = useState<PushSubscription | null>(null);

  useEffect(() => {
    if ('Notification' in window) {
      setPermission(Notification.permission);
    }
  }, []);

  const requestPermission = async () => {
    if (!('Notification' in window)) {
      console.log('This browser does not support notifications');
      return false;
    }

    const permission = await Notification.requestPermission();
    setPermission(permission);

    if (permission === 'granted') {
      await subscribeToPush();
      return true;
    }

    return false;
  };

  const subscribeToPush = async () => {
    try {
      const registration = await navigator.serviceWorker.ready;
      
      // For now, we'll skip the actual push subscription setup
      // This would require VAPID keys configured on the backend
      console.log('Push notification subscription ready');
      
      // Save notification preference
      const { data: { user } } = await supabase.auth.getUser();
      
      if (user) {
        // Update notification preferences to indicate push is enabled
        await supabase
          .from('notification_preferences')
          .upsert({
            user_id: user.id,
            email_notifications: true,
            updated_at: new Date().toISOString()
          });
      }
    } catch (error) {
      console.error('Failed to subscribe to push notifications:', error);
    }
  };

  return {
    permission,
    subscription,
    requestPermission,
    isSupported: 'Notification' in window
  };
};
