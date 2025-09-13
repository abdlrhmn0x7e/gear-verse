import { _adminRepositories } from "./admin";
import { _userRepositories } from "./user";

export const DB = {
  user: _userRepositories,
  admin: _adminRepositories,
};
