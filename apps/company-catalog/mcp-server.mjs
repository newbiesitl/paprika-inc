import { StdioServerTransport } from "@modelcontextprotocol/server/stdio";
import { createCatalogMcpServer } from "./mcp.mjs";
await createCatalogMcpServer().connect(new StdioServerTransport());
