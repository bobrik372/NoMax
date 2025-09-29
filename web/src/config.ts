let raw = (import.meta as any).env?.VITE_API_URL || (typeof window !== 'undefined' && (window as any).__API_URL__) || '';
let url = String(raw || '');
if (typeof window !== 'undefined') {
  if (window.location.protocol === 'https:' && url.startsWith('http://')) {
    url = 'https://' + url.slice('http://'.length);
  }
}
if (url.includes('${')) {
  // invalid placeholder still present -> treat as unset
  url = '';
}
export const API_URL = url;