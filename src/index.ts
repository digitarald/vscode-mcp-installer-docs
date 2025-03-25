import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";
import { z } from "zod";

const server = new McpServer({
  name: "VS Code MCP Installer",
  version: "1.0.0"
}, {
  instructions: "Create VS Code installation tools for MCP server"
});

// Define config schema for the installation tools
// TBD: Support inputs
const serverConfigSchema = z.object({
  name: z.string().describe("Name of the MCP server"),
  command: z.string().describe("Command to run the MCP server"),
  args: z.array(z.string()).optional().describe("Arguments to pass to the command"),
  env: z.record(z.string()).optional().describe("Environment variables to set for the MCP server")
});

// Tool to generate VS Code CLI command
server.tool(
  "mcp-server-to-vscode-cli-command",
  "Generate a VS Code CLI command to install the MCP server, based on the provided configuration. Call once and adapt the command to VS Code stable and insiders.",
  { config: serverConfigSchema },
  async ({ config }) => {
    const configJSON = JSON.stringify(config);
    const command = `code --add-mcp '${configJSON}'`;
    
    return {
      content: [
        { type: "text", text: `VS Code CLI command to install MCP server:\n${command}` }
      ]
    };
  }
);

// Tool to generate VS Code URI for protocol handler
server.tool(
  "mcp-server-to-vscode-uri",
  "Generate a VS Code URI to install the MCP server, based on the provided configuration. Call once and adapt the URI to VS Code stable and insiders, using the referenced badge a button image.",
  { config: serverConfigSchema },
  async ({ config }) => {
    const configJSON = JSON.stringify(config);
    const link = `vscode:mcp/install?${encodeURIComponent(configJSON)}`;
    
    return {
      content: [
        { type: "text", text: `VS Code URI to install MCP server: ${link}\n
          Example badge image: https://img.shields.io/badge/VS_Code-VS_Code?style=flat-square&label=Install%20Server&color=0098FF\n
          Add markdown link badges both for VS Code (vscode) and VS Code Insider (vscode-insider).
` }
      ]
    };
  }
);

const transport = new StdioServerTransport();
await server.connect(transport);
