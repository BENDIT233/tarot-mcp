#!/usr/bin/env node

import { Server } from "@modelcontextprotocol/sdk/server/index.js";
import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";
import {
  CallToolRequestSchema,
  ListToolsRequestSchema,
} from "@modelcontextprotocol/sdk/types.js";
import { TarotServer } from "./tarot-server.js";
import { TarotHttpServer } from "./http-server.js";
import { TarotFastMCPServer } from "./fastmcp-server.js";
import { StreamableHTTPServer } from "./transport/streamable-http.js";

/**
 * Parse command line arguments
 */
function parseArgs(): {
  transport: 'stdio' | 'http' | 'streamable' | 'fastmcp';
  port: number;
  help: boolean;
} {
  const args = process.argv.slice(2);
  let transport: 'stdio' | 'http' | 'streamable' | 'fastmcp' = 'stdio';
  let port = 3000;
  let help = false;

  for (let i = 0; i < args.length; i++) {
    const arg = args[i];
    switch (arg) {
      case '--transport':
      case '-t':
        const transportValue = args[++i];
        if (['stdio', 'http', 'streamable', 'fastmcp'].includes(transportValue)) {
          transport = transportValue as 'stdio' | 'http' | 'streamable' | 'fastmcp';
        } else {
          console.error(`Invalid transport: ${transportValue}. Use 'stdio', 'http', 'streamable', or 'fastmcp'.`);
          process.exit(1);
        }
        break;
      case '--port':
      case '-p':
        const portValue = parseInt(args[++i], 10);
        if (isNaN(portValue) || portValue < 1 || portValue > 65535) {
          console.error(`Invalid port: ${args[i]}. Use a number between 1 and 65535.`);
          process.exit(1);
        }
        port = portValue;
        break;
      case '--help':
      case '-h':
        help = true;
        break;
      default:
        console.error(`Unknown argument: ${arg}`);
        process.exit(1);
    }
  }

  return { transport, port, help };
}

/**
 * Display help information
 */
function showHelp(): void {
  console.log(`
🔮 Tarot MCP Server

Usage: node dist/index.js [options]

Options:
  -t, --transport <type>    Transport type: 'stdio', 'http', 'streamable', or 'fastmcp' (default: stdio)
  -p, --port <number>       Port number for HTTP-based transports (default: 3000)
  -h, --help               Show this help message

Examples:
  node dist/index.js                           # Run with stdio transport
  node dist/index.js -t streamable -p 3000    # Run with Streamable HTTP (recommended for Dify)
  node dist/index.js -t fastmcp -p 3000       # Run with FastMCP HTTP transport
  node dist/index.js -t http -p 3000          # Run with legacy HTTP transport
  node dist/index.js --transport stdio        # Explicitly use stdio transport

Transport Types:
  stdio:      Standard input/output for MCP clients like Claude Desktop
  streamable: Streamable HTTP transport (recommended for Dify integration)
  fastmcp:    FastMCP HTTP transport with automatic tool registration
  http:       Legacy HTTP server (backward compatibility)

Dify Integration:
  Use 'streamable' transport and configure Dify with: http://your-server:3000/mcp

For more information, visit: https://github.com/your-repo/tarot-mcp
`);
}

/**
 * Main entry point for the Tarot MCP Server
 */
async function main(): Promise<void> {
  const { transport, port, help } = parseArgs();

  if (help) {
    showHelp();
    return;
  }

  try {
    // Initialize the tarot server
    const tarotServer = await TarotServer.create();

    switch (transport) {
      case 'stdio':
        await startStdioServer(tarotServer);
        break;
        
      case 'streamable':
        console.log('🔮 Starting Tarot MCP Server with Streamable HTTP transport...');
        const streamableServer = new StreamableHTTPServer(tarotServer, port);
        await streamableServer.start();
        break;
        
      case 'fastmcp':
        console.log('🔮 Starting Tarot MCP Server with FastMCP transport...');
        const fastmcpServer = new TarotFastMCPServer();
        await fastmcpServer.initialize();
        await fastmcpServer.startHTTP({ port });
        break;
        
      case 'http':
        console.log('🔮 Starting Tarot MCP Server with legacy HTTP transport...');
        const httpServer = new TarotHttpServer(tarotServer, port);
        await httpServer.start();
        break;
        
      default:
        console.error(`Unsupported transport: ${transport}`);
        process.exit(1);
    }
  } catch (error) {
    console.error('Failed to start server:', error);
    process.exit(1);
  }
}

/**
 * Start the stdio-based MCP server
 */
async function startStdioServer(tarotServer: TarotServer) {
  const server = new Server(
    {
      name: "tarot-mcp-server",
      version: "1.0.0",
    },
    {
      capabilities: {
        tools: {},
      },
    }
  );

  // Handle tool listing
  server.setRequestHandler(ListToolsRequestSchema, async () => {
    return {
      tools: tarotServer.getAvailableTools(),
    };
  });

  // Handle tool execution
  server.setRequestHandler(CallToolRequestSchema, async (request) => {
    const { name, arguments: args } = request.params;

    try {
      const result = await tarotServer.executeTool(name, args || {});
      return {
        content: [
          {
            type: "text",
            text: result,
          },
        ],
      };
    } catch (error) {
      return {
        isError: true,
        content: [
          {
            type: "text",
            text: `Error executing tool ${name}: ${error instanceof Error ? error.message : String(error)}`,
          },
        ],
      };
    }
  });

  const transport = new StdioServerTransport();
  await server.connect(transport);

  console.error("Tarot MCP Server running on stdio");
}

// Handle graceful shutdown
process.on("SIGINT", async () => {
  console.error("Shutting down Tarot MCP Server...");
  process.exit(0);
});

process.on("SIGTERM", async () => {
  console.error("Shutting down Tarot MCP Server...");
  process.exit(0);
});

// Start the server
main().catch((error) => {
  console.error("Fatal error in main():", error);
  process.exit(1);
});