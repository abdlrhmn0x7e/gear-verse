import { db, type Tx } from "~/server/db";

/** runs `fn` in the caller's transaction when there is one, otherwise in its own */
export const withTx = <T>(tx: Tx | undefined, fn: (tx: Tx) => Promise<T>) =>
  tx ? fn(tx) : db.transaction(fn);
