import * as Notifications from 'expo-notifications';
import * as Device from 'expo-device';
import Constants from 'expo-constants';
import { Platform } from 'react-native';
import { api } from '@/lib/api';
import { mmkvStorage } from '@/lib/storage';
import type { PushTokenRegistration, PushTokenResponse } from '@/types';

// ─── Chaves de armazenamento ──────────────────────────
const PUSH_TOKEN_KEY = 'push_token';
const NOTIFICATION_PREFS_KEY = 'notification_preferences';
const ANDROID_CHANNEL_ID = 'live-alerts';

// ─── Configurar comportamento ao receber notificacao ──
// Chamar no module scope do _layout.tsx (antes dos componentes)
export function setupNotificationHandler() {
  Notifications.setNotificationHandler({
    handleNotification: async () => ({
      shouldShowAlert: true,
      shouldPlaySound: true,
      shouldSetBadge: false,
    }),
  });
}

// ─── Canal Android ────────────────────────────────────
export async function setupAndroidChannel(): Promise<void> {
  if (Platform.OS === 'android') {
    await Notifications.setNotificationChannelAsync(ANDROID_CHANNEL_ID, {
      name: 'Transmissoes ao Vivo',
      description: 'Notificacoes quando uma transmissao ao vivo comeca',
      importance: Notifications.AndroidImportance.HIGH,
      vibrationPattern: [0, 250, 250, 250],
      lightColor: '#1e3a5f',
      sound: 'default',
    });
  }
}

// ─── Permissoes ───────────────────────────────────────
export async function requestPermissions(): Promise<boolean> {
  if (!Device.isDevice) {
    console.warn('Push notifications requerem um dispositivo fisico');
    return false;
  }

  const { status: existingStatus } = await Notifications.getPermissionsAsync();
  if (existingStatus === 'granted') return true;

  const { status } = await Notifications.requestPermissionsAsync();
  return status === 'granted';
}

// ─── Obter Expo Push Token ────────────────────────────
export async function getExpoPushToken(): Promise<string | null> {
  try {
    const projectId = Constants.expoConfig?.extra?.eas?.projectId;
    if (!projectId) {
      console.error('EAS projectId nao encontrado no app.json');
      return null;
    }

    const tokenData = await Notifications.getExpoPushTokenAsync({ projectId });
    return tokenData.data;
  } catch (error) {
    console.error('Falha ao obter push token:', error);
    return null;
  }
}

// ─── Registrar token no backend ───────────────────────
// Backend deve implementar: POST /api/notifications/register-token
// Recebe: { token, platform, device_name, app_version }
// Faz upsert por token na tabela push_tokens
// Quando a live e ativada, buscar todos tokens ativos e enviar via:
//   POST https://exp.host/--/api/v2/push/send
//   Body: { to: token, title, body, data: { type: 'live_started', screen: 'live' }, channelId: 'live-alerts' }
export async function registerTokenWithBackend(token: string): Promise<PushTokenResponse | null> {
  try {
    const appVersion = Constants.expoConfig?.version || '1.0.0';
    const body: PushTokenRegistration = {
      token,
      platform: Platform.OS as 'ios' | 'android',
      device_name: Device.deviceName || null,
      app_version: appVersion,
    };

    const response = await api.post<PushTokenResponse>(
      '/notifications/register-token',
      body
    );

    mmkvStorage.setItem(PUSH_TOKEN_KEY, token);
    return response;
  } catch (error) {
    console.error('Falha ao registrar push token no backend:', error);
    return null;
  }
}

// ─── Fluxo completo de registro ───────────────────────
export async function registerForPushNotifications(): Promise<string | null> {
  const hasPermission = await requestPermissions();
  if (!hasPermission) return null;

  await setupAndroidChannel();

  const token = await getExpoPushToken();
  if (!token) return null;

  // So registra no backend se o token mudou
  const storedToken = mmkvStorage.getItem(PUSH_TOKEN_KEY);
  if (storedToken !== token) {
    await registerTokenWithBackend(token);
  }

  return token;
}

// ─── Preferencias de notificacao ──────────────────────
export function getNotificationPreferences(): { live_notifications: boolean } {
  const stored = mmkvStorage.getItem(NOTIFICATION_PREFS_KEY);
  if (stored) {
    try {
      return JSON.parse(stored);
    } catch {
      // fall through
    }
  }
  return { live_notifications: true };
}

export function setNotificationPreferences(prefs: { live_notifications: boolean }): void {
  mmkvStorage.setItem(NOTIFICATION_PREFS_KEY, JSON.stringify(prefs));
}

// ─── Token armazenado ─────────────────────────────────
export function getStoredPushToken(): string | null {
  return mmkvStorage.getItem(PUSH_TOKEN_KEY);
}
