#!/usr/bin/env node
import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";
import { z } from "zod";
const server = new McpServer({
    name: "VS Code MCP Installer Docs",
    version: "1.0.0"
}, {
    instructions: "Create VS Code installation tools for MCP server",
    capabilities: {
        logging: {
            level: "info",
            enabled: true
        }
    }
});
let initialized = false;
server.server.oninitialized = () => {
    initialized = true;
    server.server.sendLoggingMessage({
        level: "info",
        data: `Server initialization completed (${server.server.transport?.sessionId || 'no sessionId'}).`
    });
};
setTimeout(() => {
    if (!initialized) {
        const currentExec = process.execPath;
        const currentDir = process.cwd();
        console.log(`Install this server:

Add \`--mcp-workspace\` to install it in the current workspace, otherwise it is added to your settings.

code --add-mcp '${JSON.stringify({
            name: "vscode-mcp-installer",
            command: `${currentDir}/build/index.js`
        })}'`);
        process.exit(1);
    }
}, 100);
// Define config schema for the installation tools
const serverConfigSchema = z.object({
    name: z.string().describe("Name of the MCP server"),
    config: z.object({
        command: z.string().describe("Command to run the MCP server"),
        args: z.array(z.string()).optional().describe("Arguments to pass to the command (can use ${input:…} variables)"),
        env: z.record(z.string()).optional().describe("Environment variables to set for the MCP server (can use ${input:…} variables)"),
    }).describe("Configuration for the MCP server"),
    inputs: z.array(z.object({
        id: z.string().describe("Input ID"),
        default: z.string().optional().describe("Default value for the input"),
        description: z.string().optional().describe("Description of the input"),
        password: z.boolean().optional().describe("Whether the input is a password or API key")
    })).optional().describe("Input variables for the MCP server to use in args and env (https://code.visualstudio.com/docs/reference/variables-reference#_input-variables)")
});
// Tool to generate VS Code URI for protocol handler
server.tool("mcp-server-to-vscode", "Generate a VS Code URI and CLI command to install an MCP server, based on the provided configuration (call multiple times when servers provide different commands, like `docker`, `npx`, or `uvx`). Adapt the response to VS Code stable and insiders, using the referenced badge a button image.", { config: serverConfigSchema }, async ({ config }) => {
    const configJSON = JSON.stringify(config);
    const encodedConfig = encodeURIComponent(configJSON);
    const cmdJson = JSON.stringify({
        name: config.name,
        command: config.config.command,
        args: config.config.args || [],
        env: config.config.env || {},
    });
    // New format prepends vscode.dev to the protocol
    const stableLink = `vscode:mcp/install?${encodedConfig}`;
    const insiderLink = `vscode-insiders:mcp/install?${encodedConfig}`;
    return {
        content: [
            { type: "text", text: `# VS Code URIs to install MCP server:\n
- Stable: https://insiders.vscode.dev/redirect?url=${encodeURIComponent(stableLink)}\n
- Insiders: https://insiders.vscode.dev/redirect?url=${encodeURIComponent(insiderLink)}\n
\n
Badge image markdown (note the labels and colors):\n
- Stable: [<img alt="Install in VS Code" src="https://img.shields.io/badge/VS_Code-VS_Code?style=flat-square&label=Install%20Server&color=0098FF">](…)\n
- Insiders: [<img alt="Install in VS Code Insiders" src="https://img.shields.io/badge/VS_Code_Insiders-VS_Code_Insiders?style=flat-square&label=Install%20Server&color=24bfa5">](…)\n

Add markdown link badges both for VS Code (vscode) and VS Code Insiders (vscode-insiders).

# Commands
- Stable: \`code --add-mcp '${cmdJson}'\`
- Insiders: \`code-insiders --add-mcp '${cmdJson}'\``
            }
        ]
    };
});
const transport = new StdioServerTransport();
await server.connect(transport);
