const AUTH_STORAGE_KEY = "@app_auth_token";
const USER_STORAGE_KEY = "@app_user_data";

export const storage = {
  async getItem(key: string): Promise<string | null> {
    try {
      return localStorage.getItem(key);
    } catch {
      return null;
    }
  },

  async setItem(key: string, value: string): Promise<void> {
    localStorage.setItem(key, value);
  },

  async removeItem(key: string): Promise<void> {
    localStorage.removeItem(key);
  },
};

export { AUTH_STORAGE_KEY, USER_STORAGE_KEY };
