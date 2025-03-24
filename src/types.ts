export interface CarpoolGroup {
  id: string;
  name: string;
  destination: string;
  departureTime: string;
  members: string[];
  maxMembers: number;
  ownerId: string;
  joinRequests: string[];
}

export interface User {
  id: string;
  name: string;
  children: Child[];
  cars: Car[];
}

export interface Child {
  id: string;
  name: string;
}

export interface Car {
  id: string;
  model: string;
  seats: number;
}