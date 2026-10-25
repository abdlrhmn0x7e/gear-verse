import { auth } from "~/server/auth";

/** RFC 9728 metadata for the MCP endpoint; the mcp plugin answers it from better-auth's handler. */
export const GET = (request: Request) => auth.handler(request);
