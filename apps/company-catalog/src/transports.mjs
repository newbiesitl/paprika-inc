import {
  App,
  applyHostStyleVariables,
  applyDocumentTheme,
} from "@modelcontextprotocol/ext-apps";
export function unwrap(result) {
  if (result.isError)
    throw new Error(
      result.content?.find((c) => c.type === "text")?.text ||
        "Catalog tool unavailable.",
    );
  if (!result.structuredContent)
    throw new Error("Catalog tool returned no structured result.");
  return result.structuredContent;
}
export function standaloneTransport() {
  return {
    surface: "Standalone workspace",
    async call(operation, args = {}) {
      const response = await fetch("/api/" + operation, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(args),
        signal: AbortSignal.timeout(15000),
      });
      if (!response.ok)
        throw new Error(
          "Catalog service unavailable (" +
            response.status +
            "). Your draft is retained.",
        );
      return response.json();
    },
  };
}
export async function nativeTransport() {
  const app = new App(
    { name: "Paprika Inc Company catalog", version: "0.1.0" },
    {},
  );
  const style = (context) => {
    if (context?.styles?.variables)
      applyHostStyleVariables(context.styles.variables);
    if (context?.theme) applyDocumentTheme(context.theme);
    for (const side of ["top", "right", "bottom", "left"])
      document.documentElement.style.setProperty(
        "--safe-" + side,
        (context?.safeAreaInsets?.[side] || 0) + "px",
      );
  };
  app.onhostcontextchanged = style;
  await app.connect(undefined, { timeout: 8000 });
  style(app.getHostContext());
  if (!app.getHostCapabilities()?.serverTools)
    throw new Error(
      "This host does not expose catalog tools to the panel. Use the catalog tools in chat or open the standalone interface.",
    );
  return {
    surface: "Native MCP App panel",
    app,
    async call(operation, args = {}) {
      return unwrap(
        await app.callServerTool(
          { name: "company_catalog_" + operation, arguments: args },
          { timeout: 15000 },
        ),
      );
    },
  };
}
