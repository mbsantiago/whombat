import { createContext } from "react";

import type { User } from "@/types";

const UserContext = createContext<User>({
  id: "",
  username: "",
  email: "",
});

export default UserContext;
