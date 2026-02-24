import { useEffect, useRef } from 'react';
import { useRouter } from 'expo-router';
import * as Notifications from 'expo-notifications';
import {
  registerForPushNotifications,
  getNotificationPreferences,
} from '@/services/notificationService';

export function useNotifications() {
  const router = useRouter();
  const notificationListener = useRef<Notifications.EventSubscription | null>(null);
  const responseListener = useRef<Notifications.EventSubscription | null>(null);

  useEffect(() => {
    const prefs = getNotificationPreferences();
    if (!prefs.live_notifications) return;

    // Registrar token
    registerForPushNotifications().catch((err) =>
      console.warn('Falha no registro de push notification:', err)
    );

    // Listener: notificacao recebida em foreground
    notificationListener.current = Notifications.addNotificationReceivedListener(
      (notification) => {
        console.log('Notificacao recebida:', notification.request.content.title);
      }
    );

    // Listener: usuario tocou na notificacao
    responseListener.current = Notifications.addNotificationResponseReceivedListener(
      (response) => {
        const data = response.notification.request.content.data;

        if (data?.type === 'live_started' || data?.screen === 'live') {
          router.push('/(tabs)/live');
        }
      }
    );

    // Cold start: app aberto via toque na notificacao
    Notifications.getLastNotificationResponseAsync().then((response) => {
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
