export const StorageKeys = {
  token: 'iam.token',
  role: 'iam.role',
} as const;

export const Storage = {
  get(key: string): string | null {
    return localStorage.getItem(key);
  },
  set(key: string, value: string) {
    localStorage.setItem(key, value);
  },
  remove(key: string) {
    localStorage.removeItem(key);
  },
  clear() {
    localStorage.clear();
  }
};
