import axios from "axios";
import * as auth from "./auth";

jest.mock("axios");
const mockedAxios = axios as jest.Mocked<typeof axios>;

describe("Auth module", () => {
  describe("login", () => {
    it("Should receive data", async () => {
      mockedAxios.post.mockResolvedValue({});
      const username = "admin@whombat.com";
      const password = "admin";
      let response = await auth.login(username, password);
      expect(response).toEqual({});
    });
  });
});
