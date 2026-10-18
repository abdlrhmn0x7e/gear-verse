import { _admin } from "./admin";
import { _public } from "./public";
import { db, type Tx } from "~/server/db";

export const data = {
  public: _public,
  admin: _admin,
  /** groups several data-access calls into one transaction, pass `tx` to each */
  transaction: <T>(fn: (tx: Tx) => Promise<T>) => db.transaction(fn),
};
