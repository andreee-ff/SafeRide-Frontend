import axios, { AxiosError } from 'axios';
import type {
  User,
  UserCreate,
  TokenResponse,
  Ride,
  RideCreate,
  RideUpdate,
  Participation,
  ParticipationCreate,
  ParticipationUpdate,
  Participant,
  ApiError
} from './types';

const api = axios.create({
  baseURL: '/api',
  headers: {
    'Content-Type': 'application/json',
  },
});

// Interceptor to add token to requests
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Interceptor to handle 401 errors
api.interceptors.response.use(
  (response) => response,
  (error: AxiosError<ApiError>) => {
    // Don't redirect if it's a login attempt failure
    if (error.response?.status === 401 && !error.config?.url?.includes('/auth/login')) {
      localStorage.removeItem('token');
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

// Auth API
export const authApi = {
  register: async (data: UserCreate): Promise<User> => {
    const response = await api.post<User>('/users/', data);
    return response.data;
  },

  login: async (username: string, password: string): Promise<TokenResponse> => {
    const formData = new FormData();
    formData.append('username', username);
    formData.append('password', password);
    
    const response = await api.post<TokenResponse>('/auth/login', formData, {
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
      },
    });
    return response.data;
  },

  getCurrentUser: async (): Promise<User> => {
    const response = await api.get<User>('/auth/me');
    return response.data;
  },
};

// Rides API
export const ridesApi = {
  getRides: async (): Promise<Ride[]> => {
    const response = await api.get<Ride[]>('/rides/');
    return response.data;
  },

  getRideByCode: async (code: string): Promise<Ride> => {
    const response = await api.get<Ride>(`/rides/code/${code}`);
    return response.data;
  },

  getRideById: async (id: number): Promise<Ride> => {
    const response = await api.get<Ride>(`/rides/${id}`);
    return response.data;
  },

  createRide: async (data: RideCreate): Promise<Ride> => {
    const response = await api.post<Ride>('/rides/', data);
    return response.data;
  },

  updateRide: async (id: number, data: RideUpdate): Promise<Ride> => {
    const response = await api.put<Ride>(`/rides/${id}`, data);
    return response.data;
  },

  deleteRide: async (id: number): Promise<void> => {
    await api.delete(`/rides/${id}`);
  },

  getOwnedRides: async (): Promise<Ride[]> => {
    const response = await api.get<Ride[]>('/rides/owned');
    return response.data;
  },

  getJoinedRides: async (): Promise<Ride[]> => {
    const response = await api.get<Ride[]>('/rides/joined');
    return response.data;
  },

  getAvailableRides: async (): Promise<Ride[]> => {
    const response = await api.get<Ride[]>('/rides/available');
    return response.data;
  },
};

// Participations API
export const participationsApi = {
  getMyParticipations: async (): Promise<Participation[]> => {
    const response = await api.get<Participation[]>('/participations/');
    return response.data;
  },

  getRideParticipations: async (rideId: number): Promise<Participant[]> => {
    const response = await api.get<Participant[]>(`/rides/${rideId}/participants`);
    return response.data;
  },

  joinRide: async (data: ParticipationCreate): Promise<Participation> => {
    const response = await api.post<Participation>('/participations/', data);
    return response.data;
  },

  updateLocation: async (participationId: number, data: ParticipationUpdate): Promise<Participation> => {
    const response = await api.put<Participation>(`/participations/${participationId}`, data);
    return response.data;
  },

  leaveRide: async (participationId: number): Promise<void> => {
    await api.delete(`/participations/${participationId}`);
  },
};

export default api;
