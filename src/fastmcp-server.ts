#!/usr/bin/env node

import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";
import { StreamableHTTPServerTransport } from "@modelcontextprotocol/sdk/server/streamableHttp.js";
import { z } from "zod";
import { TarotServer } from "./tarot-server.js";

/**
 * FastMCP-compatible Tarot Server implementation
 * Uses the new MCP SDK with registerTool API
 */
export class TarotFastMCPServer {
  private mcp: McpServer;
  private tarotServer!: TarotServer;

  constructor() {
    // Create MCP server instance
    this.mcp = new McpServer(
      {
        name: "tarot-mcp-server",
        version: "1.0.0",
        description: "Professional Rider-Waite tarot card reading server"
      },
      {
        capabilities: {
          tools: {},
          resources: {},
          prompts: {}
        }
      }
    );
  }

  async initialize(): Promise<void> {
    this.tarotServer = await TarotServer.create();
    this.registerTools();
  }

  private registerTools(): void {
    // Register get_card_info tool
    this.mcp.registerTool(
      "get_card_info",
      {
        title: "Get Card Information",
        description: "Get detailed information about a specific tarot card including meanings, symbolism, and interpretations",
        inputSchema: {
          cardName: z.string().describe("Name of the tarot card"),
          orientation: z.enum(["upright", "reversed"]).optional().describe("Card orientation (upright or reversed)")
        }
      },
      async ({ cardName, orientation }) => {
        const result = await this.tarotServer.getCardInfo(cardName, orientation);
        return {
          content: [{
            type: "text",
            text: JSON.stringify(result, null, 2)
          }]
        };
      }
    );

    // Register list_all_cards tool
    this.mcp.registerTool(
      "list_all_cards",
      {
        title: "List All Cards",
        description: "Get a list of all available tarot cards with basic information",
        inputSchema: {
          category: z.enum(["major", "minor", "all"]).optional().describe("Filter by card category")
        }
      },
      async ({ category }) => {
        const result = await this.tarotServer.listAllCards(category);
        return {
          content: [{
            type: "text",
            text: JSON.stringify(result, null, 2)
          }]
        };
      }
    );

    // Register perform_reading tool
    this.mcp.registerTool(
      "perform_reading",
      {
        title: "Perform Tarot Reading",
        description: "Perform a complete tarot reading with card selection and interpretation",
        inputSchema: {
          spreadType: z.string().describe("Type of spread (e.g., 'single', 'three-card', 'celtic-cross')"),
          question: z.string().optional().describe("Question or focus for the reading"),
          sessionId: z.string().optional().describe("Session ID for tracking")
        }
      },
      async ({ spreadType, question, sessionId }) => {
        const result = await this.tarotServer.performReading(spreadType, question, sessionId);
        return {
          content: [{
            type: "text",
            text: JSON.stringify(result, null, 2)
          }]
        };
      }
    );

    // Register search_cards tool
    this.mcp.registerTool(
      "search_cards",
      {
        title: "Search Cards",
        description: "Search for tarot cards based on keywords, themes, or meanings",
        inputSchema: {
          query: z.string().describe("Search query or keywords"),
          suit: z.string().optional().describe("Filter by suit (for minor arcana)"),
          element: z.string().optional().describe("Filter by element"),
          limit: z.number().optional().describe("Maximum number of results")
        }
      },
      async ({ query, suit, element, limit }) => {
        const result = await this.tarotServer.searchCards(query, suit, element, limit);
        return {
          content: [{
            type: "text",
            text: JSON.stringify(result, null, 2)
          }]
        };
      }
    );

    // Register find_similar_cards tool
    this.mcp.registerTool(
      "find_similar_cards",
      {
        title: "Find Similar Cards",
        description: "Find cards with similar meanings or themes to a given card",
        inputSchema: {
          cardName: z.string().describe("Reference card name"),
          limit: z.number().optional().describe("Maximum number of similar cards to return")
        }
      },
      async ({ cardName, limit }) => {
        const result = await this.tarotServer.findSimilarCards(cardName, limit);
        return {
          content: [{
            type: "text",
            text: JSON.stringify(result, null, 2)
          }]
        };
      }
    );

    // Register get_database_analytics tool
    this.mcp.registerTool(
      "get_database_analytics",
      {
        title: "Get Database Analytics",
        description: "Get analytics and statistics about the tarot card database",
        inputSchema: {}
      },
      async () => {
        const result = await this.tarotServer.getDatabaseAnalytics();
        return {
          content: [{
            type: "text",
            text: JSON.stringify(result, null, 2)
          }]
        };
      }
    );

    // Register get_random_cards tool
    this.mcp.registerTool(
      "get_random_cards",
      {
        title: "Get Random Cards",
        description: "Get a specified number of random tarot cards",
        inputSchema: {
          count: z.number().describe("Number of random cards to return"),
          includeReversed: z.boolean().optional().describe("Whether to include reversed orientations")
        }
      },
      async ({ count, includeReversed }) => {
        const result = await this.tarotServer.getRandomCards(count, includeReversed);
        return {
          content: [{
            type: "text",
            text: JSON.stringify(result, null, 2)
          }]
        };
      }
    );

    // Register create_custom_spread tool
    this.mcp.registerTool(
      "create_custom_spread",
      {
        title: "Create Custom Spread",
        description: "Create and perform a custom tarot spread with specified positions",
        inputSchema: {
          spreadName: z.string().describe("Name for the custom spread"),
          description: z.string().describe("Description of the spread's purpose"),
          positions: z.array(z.string()).describe("Array of position names/meanings"),
          cards: z.array(z.string()).optional().describe("Specific cards to use (optional)"),
          context: z.string().optional().describe("Additional context for interpretation")
        }
      },
      async ({ spreadName, description, positions, cards, context }) => {
        const result = await this.tarotServer.createCustomSpread(spreadName, description, positions, cards, context);
        return {
          content: [{
            type: "text",
            text: JSON.stringify(result, null, 2)
          }]
        };
      }
    );
  }

  /**
   * Start the server with Streamable HTTP transport
   */
  async startHTTP(options: { port?: number } = {}): Promise<void> {
    const transport = new StreamableHTTPServerTransport({
      sessionIdGenerator: () => Math.random().toString(36).substring(2, 15)
    });
    await this.mcp.connect(transport);
    console.log(`🔮 Tarot FastMCP Server (Streamable HTTP) connected`);
  }

  /**
   * Start the server with stdio transport
   */
  async startStdio(): Promise<void> {
    const transport = new StdioServerTransport();
    await this.mcp.connect(transport);
    console.log('🔮 Tarot FastMCP Server (stdio) started');
  }

  /**
   * Get the MCP server instance
   */
  getMCP(): McpServer {
    return this.mcp;
  }

  /**
   * Get available tools information
   */
  getAvailableTools() {
    return [
      { name: 'get_card_info', description: 'Get detailed information about a specific tarot card' },
      { name: 'list_all_cards', description: 'Get a list of all available tarot cards' },
      { name: 'perform_reading', description: 'Perform a complete tarot reading' },
      { name: 'search_cards', description: 'Search for tarot cards based on keywords' },
      { name: 'find_similar_cards', description: 'Find cards with similar meanings' },
      { name: 'get_database_analytics', description: 'Get analytics about the tarot database' },
      { name: 'get_random_cards', description: 'Get random tarot cards' },
      { name: 'create_custom_spread', description: 'Create and perform custom tarot spreads' }
    ];
  }
}

// CLI support
if (import.meta.url === `file://${process.argv[1]}`) {
  const server = new TarotFastMCPServer();
  await server.initialize();
  await server.startStdio();
}