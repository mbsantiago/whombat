import { createContext } from "react";

import type { User } from "@/lib/types";

const UserContext = createContext<User>({
  id: "",
  username: "",
  email: "",
});

export default UserContext;
