# VS Code MCP Installer Docs

A TypeScript-based MCP server that provides tools for installing MCP servers in VS Code.

This MCP server implements tools to help install other MCP servers in VS Code. It demonstrates core MCP concepts by providing:

- Tools for generating VS Code CLI commands for MCP server installation
- Tools for generating VS Code URIs for protocol handler installation
- Configuration schemas for MCP servers

## Quick Start

Run this tool directly with npx:

```bash
npx github:digitarald/vscode-mcp-installer-docs
```

The tool will either connect to an existing MCP client or provide installation instructions.

## Features

### Tools
- `mcp-server-to-vscode-cli-command` - Generate VS Code CLI command
  - Takes MCP server configuration as input
  - Returns a CLI command to install the MCP server in VS Code

- `mcp-server-to-vscode-uri` - Generate VS Code URI for protocol handler
  - Takes MCP server configuration as input
  - Returns a URI that can be used to install the MCP server via VS Code protocol handler
  - Includes guidance for adding installation badges

### Configuration Schema
The server defines a configuration schema for MCP servers with:
- `name`: Name of the MCP server
- `command`: Command to run the MCP server
- `args` (optional): Arguments to pass to the command
- `env` (optional): Environment variables to set for the MCP server

## Development

Install dependencies:

```bash
npm install
```

Build the server:

```bash
npm run build
```

For development with auto-rebuild:

```bash
npm run watch
```

## Installation

To use with Claude Desktop, add the server config:

On MacOS: `~/Library/Application Support/Claude/claude_desktop_config.json`
On Windows: `%APPDATA%/Claude/claude_desktop_config.json`

```json
{
  "mcpServers": {
    "vscode-installer": {
      "command": "/path/to/vscode-installer/build/index.js"
    }
  }
}
```

### Debugging

Since MCP servers communicate over stdio, debugging can be challenging. We recommend using the [MCP Inspector](https://github.com/modelcontextprotocol/inspector), which is available as a package script:

```bash
npm run inspector
```

The Inspector will provide a URL to access debugging tools in your browser.

## Usage Examples

### Generate VS Code CLI Command

```json
// Example configuration
{
  "name": "My MCP Server",
  "command": "/path/to/server.js",
  "args": ["-v"],
  "env": {"DEBUG": "true"}
}
```

Use the `mcp-server-to-vscode-cli-command` tool with the above configuration to generate a CLI command for installing the MCP server in VS Code.

### Generate VS Code URI

Use the `mcp-server-to-vscode-uri` tool with your server configuration to generate a VS Code URI that can be used with protocol handlers for one-click installation.

Example markdown with installation badges:

[![Install in VS Code](https://img.shields.io/badge/VS_Code-VS_Code?style=flat-square&label=Install%20Server&color=0098FF)](vscode:mcp/install?%7B%22name%22%3A%22My%20MCP%20Server%22%2C%22command%22%3A%22%2Fpath%2Fto%2Fserver.js%22%7D)

[![Install in VS Code Insiders](https://img.shields.io/badge/VS_Code_Insiders-VS_Code?style=flat-square&label=Install%20Server&color=0098FF)](vscode-insiders:mcp/install?%7B%22name%22%3A%22My%20MCP%20Server%22%2C%22command%22%3A%22%2Fpath%2Fto%2Fserver.js%22%7D)
