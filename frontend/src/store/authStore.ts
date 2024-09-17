import { makeAutoObservable } from "mobx";
import axios from "axios";
import { AUTH } from "@/lib/constants";
import { User } from "@/lib/types";

class AuthStore {
  user: any = null;
  loading: boolean = false;
  error: string | null = null;

  constructor() {
    makeAutoObservable(this);
  }

  setUser(user: any) {
    this.user = user;
  }

  setLoading(loading: boolean) {
    this.loading = loading;
  }

  setError(error: string | null) {
    this.error = error;
  }

  async fetchUser() {
    try {
      const response = await axios.get(`${AUTH}/me`, { withCredentials: true });
      this.setUser(response.data);
      return response.data;
    } catch (error) {
      this.setError("Failed to fetch user");
      this.logout();
      throw error;
    }
  }

  async login(credentials: { email: string; password: string }): Promise<User> {
    this.setLoading(true);
    try {
      const response = await axios.post(`${AUTH}/login`, credentials, { withCredentials: true });
      const user = response.data.user;
      this.setUser(user);
      this.setError(null);
      return user;
    } catch (error: any) {
      this.setError(error.response?.data.message || "Login failed");
      throw error;
    } finally {
      this.setLoading(false);
    }
  }

  async signup(credentials: { name: string; email: string; password: string }): Promise<User> {
    this.setLoading(true);
    try {
      const response = await axios.post(`${AUTH}/signup`, credentials, { withCredentials: true });
      const user = response.data.user;
      this.setUser(user);
      this.setError(null);
      return user;
    } catch (error: any) {
      this.setError(error.response?.data.message || "Signup failed");
      throw error;
    } finally {
      this.setLoading(false);
    }
  }

  async loginWithGoogle() {
    window.location.href = `${AUTH}/google`;
  }

  async loginWithGitHub() {
    window.location.href = `${AUTH}/github`;
  }

  logout() {
    this.setUser(null);
    axios.get(`${AUTH}/logout`, { withCredentials: true }).then(() => {
      window.location.href = "/login";
    });
  }

  async refreshToken() {
    try {
      const response = await axios.post(`${AUTH}/refresh-token`, {}, { withCredentials: true });
      axios.defaults.headers.common['Authorization'] = `Bearer ${response.data.accessToken}`;
      return response.data.accessToken;
    } catch (error) {
      this.logout();
      throw error;
    }
  }

  async handleApiRequest(apiCall: () => Promise<any>) {
    try {
      return await apiCall();
    } catch (error: any) {
      if (error.response?.status === 401) {
        try {
          await this.refreshToken();
          return await apiCall();  
        } catch (refreshError) {
          throw refreshError;
        }
      } else {
        throw error;
      }
    }
  }
}

const authStore = new AuthStore();
export default authStore;
