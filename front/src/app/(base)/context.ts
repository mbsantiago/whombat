import { createContext } from "react";

import type { User } from "@/types";

const UserContext = createContext<User | null>(null);

export default UserContext;
