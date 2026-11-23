import * as Linking from 'expo-linking';
import { Platform } from 'react-native';

function recoveryPath(raw: string | null) {
  if (!raw) return null;
  try {
    const url = new URL(raw);
    if (url.protocol !== 'lasalva:' && url.protocol !== 'lasalvapreview:') return null;
    if ((url.host + url.pathname).replace(/^\/+|\/+$/g, '') !== 'reset-password') return null;
    const token = url.searchParams.get('token');
    return token ? '/reset-password?token=' + encodeURIComponent(token) : '/reset-password';
  } catch {
    return null;
  }
}

export function redirectSystemPath({ path, initial }: { path: string; initial: boolean }) {
  const recovery = recoveryPath(path);
  if (recovery) return recovery;
  // iOS may supply a cold-start URL in native launch options before Expo receives the open event.
  if (initial && Platform.OS === 'ios' && /^(?:(?:lasalva|lasalvapreview):)?\/*$/.test(path)) {
    return Linking.getInitialURL()
      .then((url) => recoveryPath(url) ?? recoveryPath(Linking.getLinkingURL()) ?? path)
      .catch(() => path);
  }
  return path;
}
