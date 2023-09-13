import { createContext } from 'react';
import { type User, type UserUpdate } from '@/api/user';


export type UserContextType = {
  user?: User;
  logout?: () => void;
  update?: (data: UserUpdate) => void;
};


export const UserContext = createContext<UserContextType>({});
