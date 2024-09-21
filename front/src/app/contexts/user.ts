import type { User } from "@/lib/types";
import { createContext } from "react";

const UserContext = createContext<User>({
  id: "",
  username: "",
  email: "",
});

export default UserContext;
