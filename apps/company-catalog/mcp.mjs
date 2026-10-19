import { readFile } from "node:fs/promises";
import { McpServer } from "@modelcontextprotocol/server";
import {
  registerAppTool,
  registerAppResource,
  RESOURCE_MIME_TYPE,
} from "@modelcontextprotocol/ext-apps/server";
import { z } from "zod";
import { invoke } from "./provider.mjs";
export const resourceUri = "ui://paprika-inc/company-catalog.html";
export function createCatalogMcpServer({ call = invoke, html } = {}) {
  const server = new McpServer({
    name: "paprika-inc-company-catalog",
    version: "0.1.0",
  });
  const result = async (op, args) => {
    try {
      const value = await call(op, args);
      return {
        content: [{ type: "text", text: JSON.stringify(value) }],
        structuredContent: value,
      };
    } catch (error) {
      return {
        isError: true,
        content: [{ type: "text", text: error.message }],
      };
    }
  };
  registerAppTool(
    server,
    "company_catalog_open",
    {
      title: "Company catalog",
      description:
        "Open the company picker during initialization or to restructure an existing company's saved configuration. Choose Company action in the panel, configure roles and review a portable draft. Read-only; creates no chats or files.",
      inputSchema: z.object({}).strict(),
      annotations: {
        readOnlyHint: true,
        destructiveHint: false,
        openWorldHint: false,
      },
      _meta: {
        ui: { resourceUri },
        "openai/ui": { entrypoints: [{ type: "thread" }] },
      },
    },
    (args) => result("list", args),
  );
  const selection = z
    .record(z.string(), z.unknown())
    .refine(
      (v) => JSON.stringify(v).length <= 262144,
      "Selection exceeds 256 KiB.",
    );
  for (const op of ["list", "read", "validate", "preview", "export"]) {
    const inputSchema =
      op === "list"
        ? z.object({ query: z.string().max(256).optional() }).strict()
        : op === "read"
          ? z
              .object({ kind: z.string().max(32), id: z.string().max(96) })
              .strict()
          : z
              .object({
                selection,
                catalog_context: z
                  .object({
                    schema_version: z.literal(1),
                    host: z.enum(["codex-local", "chatgpt", "standalone"]),
                  })
                  .strict()
                  .optional(),
              })
              .strict();
    server.registerTool(
      "company_catalog_" + op,
      {
        title: "Company catalog " + op,
        description:
          "Read-only catalog " +
          op +
          ". Export preserves a portable draft; application is separate.",
        inputSchema,
        annotations: {
          readOnlyHint: true,
          destructiveHint: false,
          openWorldHint: false,
        },
        _meta: { ui: { visibility: ["app", "model"] } },
      },
      (args) => result(op, args),
    );
  }
  registerAppResource(
    server,
    "Company catalog",
    resourceUri,
    { description: "Paprika Inc shared catalog configuration view" },
    async () => ({
      contents: [
        {
          uri: resourceUri,
          mimeType: RESOURCE_MIME_TYPE,
          text:
            html ??
            (await readFile(
              new URL("dist/catalog.html", import.meta.url),
              "utf8",
            )),
          _meta: {
            ui: { csp: { connectDomains: [], resourceDomains: [] } },
            "openai/ui": {
              preferredDisplayMode: "fullscreen",
              availableDisplayModes: ["inline", "fullscreen"],
            },
          },
        },
      ],
    }),
  );
  return server;
}
