import { useEffect, useRef } from 'react';
import { useRouter } from 'expo-router';
import {
  registerForPushNotifications,
  getNotificationPreferences,
  addNotificationReceivedListener,
  addNotificationResponseReceivedListener,
  getLastNotificationResponseAsync,
} from '@/services/notificationService';

export function useNotifications() {
  const router = useRouter();
  const notificationListener = useRef<{ remove: () => void } | null>(null);
  const responseListener = useRef<{ remove: () => void } | null>(null);

  useEffect(() => {
    const prefs = getNotificationPreferences();
    if (!prefs.live_notifications) return;

    // Registrar token
    registerForPushNotifications().catch((err) =>
      console.warn('Falha no registro de push notification:', err)
    );

    // Listener: notificacao recebida em foreground
    addNotificationReceivedListener((notification) => {
      console.log('Notificacao recebida:', notification.request.content.title);
    }).then((sub) => {
      notificationListener.current = sub;
    });

    // Listener: usuario tocou na notificacao
    addNotificationResponseReceivedListener((response) => {
      const data = response.notification.request.content.data;

      if (data?.type === 'live_started' || data?.screen === 'live') {
        router.push('/(tabs)/live');
      }
    }).then((sub) => {
      responseListener.current = sub;
    });

    // Cold start: app aberto via toque na notificacao
    getLastNotificationResponseAsync().then((response) => {
      if (response) {
        const data = response.notification.request.content.data;
        if (data?.type === 'live_started' || data?.screen === 'live') {
          setTimeout(() => {
            router.push('/(tabs)/live');
          }, 500);
        }
      }
    });

    return () => {
      notificationListener.current?.remove();
      responseListener.current?.remove();
    };
  }, [router]);
}
