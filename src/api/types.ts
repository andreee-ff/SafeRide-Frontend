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

export enum RouteVisibility {
  ALWAYS = "always",
  START = "start",
  SECRET = "secret",
}

export interface Route {
  id: number;
  title: string;
  description: string | null;
  gpx_data: string;
  distance_meters: number;
  created_by_user_id: number;
  created_at: string;
  updated_at: string;
}

export interface RouteCreate {
  title: string;
  description?: string;
  gpx_data: string;
}

export interface RouteUpdate {
  title?: string;
  description?: string;
  gpx_data?: string;
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
  route_id: number | null;
  visibility: RouteVisibility;
}

export interface RideCreate {
  title: string;
  description?: string;
  start_time: string;
  route_id?: number;
  visibility?: RouteVisibility;
}

export interface RideUpdate {
  title?: string;
  description?: string;
  start_time?: string;
  is_active?: boolean;
  route_id?: number;
  visibility?: RouteVisibility;
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
