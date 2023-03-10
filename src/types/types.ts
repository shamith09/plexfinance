import { Dayjs } from 'dayjs';

export interface Request {
  _id: string;
  itemDescription: string;
  amount: number;
  teamBudget: string;
  isFood: boolean;
  images: Image[];
  status: string;
  user_id: string;
  comments: Comment[];
  date: Dayjs;
}

export interface Comment {
  message: String;
  firstName: String;
  lastName: String;
  date: Dayjs;
  user_id: string;
}

export interface Image {
  data: string | Blob;
  name: string;
  isBase64: boolean;
}

export interface AllRequests {
  pendingReview: Request[];
  underReview: Request[];
  errors: Request[];
  approved: Request[];
  declined: Request[];
}

export interface FormData {
  _id?: string;
  itemDescription: string;
  amount: string;
  teamBudget: string;
  isFood: boolean;
  images: Image[];
  status: string;
  comments: Comment[];
}

export interface SignUpData {
  firstName: string;
  lastName: string;
  email: string;
  password: string;
  venmo: string;
  google?: boolean;
  teams: string[];
}

export interface LoginData {
  email: string;
  password?: string;
  google: boolean;
}

export interface User {
  email: string;
  _id: string;
  firstName: string;
  lastName: string;
  registered: boolean;
  venmo: string;
  strikes: Dayjs[];
  tardies: Dayjs[];
  absences: Dayjs[];
  treasurer: boolean;
}
