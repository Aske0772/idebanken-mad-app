import { useEffect, useState } from 'react';

// useState that survives reloads. Storage can be unavailable (private mode),
// so every access is guarded and the app still works without it.
export function usePersistent(key, initial) {
  const [value, setValue] = useState(() => {
    try {
      const raw = localStorage.getItem(key);
      return raw == null ? initial : { ...initial, ...JSON.parse(raw) };
    } catch {
      return initial;
    }
  });
  useEffect(() => {
    try {
      localStorage.setItem(key, JSON.stringify(value));
    } catch {
      /* storage full or blocked – keep going in memory */
    }
  }, [key, value]);
  return [value, setValue];
}
