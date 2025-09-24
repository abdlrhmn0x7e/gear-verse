import { _adminRepo } from "./admin";
import { _userRepo } from "./user";

export const DB = {
  user: _userRepo,
  admin: _adminRepo,
};
