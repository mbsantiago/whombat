import axios from "axios";

async function login(username: string, password: string) {
  return await axios.post(
    "/auth/login",
    { username, password },
    {
      headers: {
        "Content-Type": "application/x-www-form-urlencoded",
      },
    }
  );
}

async function logout() {
  return await axios.post("/auth/logout");
}

export { login, logout };
