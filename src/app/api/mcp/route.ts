import { requireMcpAuth } from "@better-auth/mcp";
import { createMcpHandler, McpServer } from "@modelcontextprotocol/server";
import z from "zod";
import { isAppError } from "~/lib/errors/app-error";
import { auth, isActiveAdmin, mcpResource } from "~/server/auth";
import { data } from "~/server/data-access";
import { tools } from "~/server/mcp/tools";

// keeps the default legacy: "stateless" rather than the "reject" better-auth's docs show, since clients still speak the 2025 protocol
const mcp = createMcpHandler(() => {
  const server = new McpServer({
    name: "gear-verse",
    title: "Gear Verse",
    version: "1.0.0",
  });

  for (const tool of tools) {
    server.registerTool(
      tool.name,
      {
        title: tool.title,
        description: tool.description,
        inputSchema: tool.input,
        annotations: tool.annotations,
        _meta: tool._meta,
      },
      async (args) => {
        try {
          const result = await tool.run(args);
          return {
            content: [{ type: "text", text: JSON.stringify(result ?? null) }],
          };
        } catch (error) {
          // the model reads these and can correct its call
          if (isAppError(error) || error instanceof z.ZodError) {
            return {
              isError: true,
              content: [{ type: "text", text: error.message }],
            };
          }
          throw error;
        }
      },
    );
  }

  return server;
});

/**
 * The token proves who connected and that they were an admin then. The user is read again on every call, so a demoted
 * or banned admin loses access right away, not when the 15 minute token runs out.
 */
export const POST = requireMcpAuth(
  auth,
  async (request, claims) => {
    const user = await data.admin.users.queries.findRegisteredById(
      Number(claims.sub),
    );

    if (!user || !isActiveAdmin(user)) {
      return Response.json(
        {
          jsonrpc: "2.0",
          error: {
            code: -32003,
            message:
              "Only Gear Verse admins can use this connection. Ask an admin to restore your access, then connect again.",
          },
          id: null,
        },
        { status: 403 },
      );
    }

    return mcp.fetch(request);
  },
  {
    resource: mcpResource,
    requiredScopes: ["catalog"],
    challengeScopes: ["catalog", "offline_access"],
  },
);
