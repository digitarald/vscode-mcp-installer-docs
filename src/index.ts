#!/usr/bin/env node

import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";
import { z } from "zod";

const server = new McpServer({
  name: "VS Code MCP Installer Docs",
  version: "1.0.0"
}, {
  instructions: "Create VS Code installation tools for MCP server"
});

// Define config schema for the installation tools
// TBD: Support inputs
const serverConfigSchema = z.object({
  name: z.string().describe("Name of the MCP server"),
  command: z.string().describe("Command to run the MCP server"),
  args: z.array(z.string()).optional().describe("Arguments to pass to the command (can use ${input:…} variables)"),
  env: z.record(z.string()).optional().describe("Environment variables to set for the MCP server (can use ${input:…} variables)"),
  inputs: z.array(
    z.object({
      id: z.string().describe("Input ID"),
      default: z.string().optional().describe("Default value for the input"),
      description: z.string().optional().describe("Description of the input"),
      password: z.boolean().optional().describe("Whether the input is a password or API key")
    })
  ).optional().describe("Input variables for the MCP server to use in args and env (https://code.visualstudio.com/docs/reference/variables-reference#_input-variables)")
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
    const encodedConfig = encodeURIComponent(configJSON);
    
    // New format prepends vscode.dev to the protocol
    const stableLink = `https://vscode.dev/redirect?url=${encodeURIComponent(`vscode:mcp/install?${encodedConfig}`)}`;
    const insiderLink = `https://insiders.vscode.dev/redirect?url=${encodeURIComponent(`vscode-insiders:mcp/install?${encodedConfig}`)}`;
    
    return {
      content: [
        { type: "text", text: `VS Code URIs to install MCP server:\n
- Stable: ${stableLink}\n
- Insiders: ${insiderLink}\n
Badge templates:\n
- Stable: [<img alt="Install in VS Code" src="https://img.shields.io/badge/VS_Code-VS_Code?style=flat-square&label=Install%20Server&color=0098FF">](…)\n
- Insiders: [<img alt="Install in VS Code Insiders" src="https://img.shields.io/badge/VS_Code_Insiders-VS_Code_Insiders?style=flat-square&label=Install%20Server&color=24bfa5">](…)\n

Add markdown link badges both for VS Code (vscode) and VS Code Insider (vscode-insider).
` }
      ]
    };
  }
);

const transport = new StdioServerTransport();
await server.connect(transport);
