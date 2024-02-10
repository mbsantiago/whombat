import { createContext } from "react";

import type { User } from "@/types";

const UserContext = createContext<User>({
  id: "",
  username: "",
  email: "",
  is_superuser: false,
});

export default UserContext;
