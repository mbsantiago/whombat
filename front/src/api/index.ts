/**
 * Whombat Javascript API
 *
 * This file is the entry point for the Whombat Javascript API.
 * Use the API to interact with the Whombat backend.
 */
import axios from "axios";
import { registerAuthAPI } from "./auth";
import { registerTagAPI } from "./tags";
import { registerUserAPI } from "./user";

type APIConfig = {
  baseURL: string;
  withCredentials: boolean;
};

const DEFAULT_CONFIG: APIConfig = {
  baseURL: "http://localhost:5000",
  withCredentials: true,
};

/**
 * Create an instance of the Whombat API.
 */
export default function createAPI(config: APIConfig = DEFAULT_CONFIG) {
  let instance = axios.create(config);
  return {
    auth: registerAuthAPI(instance),
    tags: registerTagAPI(instance),
    user: registerUserAPI(instance),
  };
}
