// API Types based on SafeRide API schemas

export interface User {
  id: number;
  username: string;
  created_at: string;
  updated_at: string;
}

export interface UserCreate {
  username: string;
  password: string;
}

export interface TokenResponse {
  access_token: string;
  token_type: string;
}

export interface Ride {
  id: number;
  code: string;
  title: string;
  description: string | null;
  start_time: string;
  created_by_user_id: number;
  created_at: string;
  updated_at: string;
  is_active: boolean;
}

export interface RideCreate {
  title: string;
  description?: string;
  start_time: string;
}

export interface RideUpdate {
  title?: string;
  description?: string;
  start_time?: string;
  is_active?: boolean;
}

export interface Participation {
  id: number;
  user_id: number;
  ride_id: number;
  joined_at: string;
  updated_at: string;
  latitude: number | null;
  longitude: number | null;
  location_timestamp?: string;
}

export interface ParticipationCreate {
  ride_code: string;
}

export interface ParticipationUpdate {
  latitude: number;
  longitude: number;
  location_timestamp: string;
}

export interface Participant {
  id: number;
  user_id: number;
  username: string;
  joined_at: string;
  latitude: number | null;
  longitude: number | null;
  location_timestamp: string | null;
}

export interface ParticipationWithUser extends Participation {
  user: User;
}

export interface ApiError {
  detail: string;
}
