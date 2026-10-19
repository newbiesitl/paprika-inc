import {
  AppBridge,
  PostMessageTransport,
} from "@modelcontextprotocol/ext-apps/app-bridge";
const iframe = document.getElementById("catalog-frame");
const unsupported = new URLSearchParams(location.search).has("unsupported");
const bridge = new AppBridge(
  null,
  { name: "Browser test fixture", version: "1.0.0" },
  unsupported ? {} : { serverTools: {} },
  { hostContext: { theme: "light" } },
);
bridge.oncalltool = async ({ name, arguments: args }) => {
  const op = name.replace("company_catalog_", "");
  const response = await fetch("/api/" + op, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(args),
  });
  if (!response.ok)
    return {
      isError: true,
      content: [{ type: "text", text: "Catalog tool unavailable in fixture." }],
    };
  return { content: [], structuredContent: await response.json() };
};
await bridge.connect(
  new PostMessageTransport(iframe.contentWindow, iframe.contentWindow),
);
iframe.src = "/catalog.html";
