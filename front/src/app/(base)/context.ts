import { createContext } from "react";
import { type User } from "@/api/schemas";

const UserContext = createContext<User | null>(null);

export default UserContext;
