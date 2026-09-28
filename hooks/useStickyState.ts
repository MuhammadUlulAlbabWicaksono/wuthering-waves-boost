import { useState, useEffect } from 'react';

export function useStickyState<T>(
  defaultValue: T, 
  key: string,
  serialize: (value: T) => string = JSON.stringify,
  deserialize: (str: string) => T = JSON.parse
): [T, React.Dispatch<React.SetStateAction<T>>] {
  // Selalu gunakan defaultValue di render pertama (server/hydration)
  const [value, setValue] = useState<T>(defaultValue);
  const [isMounted, setIsMounted] = useState(false);

  // Setelah mount, ambil dari localStorage (Hanya berjalan di Client)
  useEffect(() => {
    setIsMounted(true);
    const stickyValue = window.localStorage.getItem(key);
    if (stickyValue !== null) {
      try {
        setValue(deserialize(stickyValue));
      } catch (e) {
        console.error(`Gagal melakukan parse localStorage untuk key "${key}":`, e);
      }
    }
  }, [key]); // eslint-disable-next-line react-hooks/exhaustive-deps

  // Setiap kali value berubah, simpan ke localStorage
  useEffect(() => {
    if (isMounted) {
      window.localStorage.setItem(key, serialize(value));
    }
  }, [key, value, isMounted]); // eslint-disable-next-line react-hooks/exhaustive-deps

  return [value, setValue];
}
