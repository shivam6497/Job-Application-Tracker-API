export {};

declare global {
  interface Window {
    __accessToken: string | null;
  }
}

export interface Job {
  _id: string;
  company: string;
  role: string;
  status: string;
  appliedDate: string;
}

export interface Stats {
  Applied: number;
  Interview: number;
  Offer: number;
  Rejected: number;
}

export interface SingleJob {
  _id: string;
  company: string;
  role: string;
  status: string;
  notes?: string;
  appliedDate: string;
}