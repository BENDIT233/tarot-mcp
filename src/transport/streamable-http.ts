import express from 'express';
import cors from 'cors';
import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { StreamableHTTPServerTransport } from "@modelcontextprotocol/sdk/server/streamableHttp.js";
import { z } from "zod";
import { TarotServer } from "../tarot-server.js";

/**
 * Streamable HTTP Server implementation for MCP
 * Compatible with Dify and other MCP clients that support HTTP transport
 */
export class StreamableHTTPServer {
  private app: express.Application;
  private tarotServer: TarotServer;
  private port: number;
  private httpServer?: any;
  private sessions: Map<string, { transport: StreamableHTTPServerTransport; server: McpServer }> = new Map();


  constructor(tarotServer: TarotServer, port: number = 9801) {
    this.port = port;
    this.app = express();
    this.tarotServer = tarotServer;
    
    this.setupMiddleware();
    this.setupRoutes();
  }

  /**
   * Get or create session for the given session ID
   */
  private async getOrCreateSession(sessionId: string): Promise<{ transport: StreamableHTTPServerTransport; server: McpServer }> {
    // Check if session already exists
    if (this.sessions.has(sessionId)) {
      console.log(`🔗 Using existing session: ${sessionId}`);
      return this.sessions.get(sessionId)!;
    }
    
    console.log(`🆕 Creating new session: ${sessionId}`);
    
    // Create new MCP server instance for this session
    const server = new McpServer({
      name: "tarot-mcp-server",
      version: "1.0.0",
      description: "Professional Rider-Waite tarot card reading server"
    });
    
    // Setup MCP tools for this server
    this.setupMCPTools(server);
    
    // Create new transport instance for this session
    const transport = new StreamableHTTPServerTransport({
      sessionIdGenerator: () => sessionId
    });
    
    // Connect server to transport
    await server.connect(transport);
    
    // Store session
    const session = { transport, server };
    this.sessions.set(sessionId, session);
    
    console.log(`✅ Session created and connected: ${sessionId}`);
    return session;
  }

  /**
   * Setup Express middleware
   */
  private setupMiddleware(): void {
    // CORS configuration for MCP clients (Dify compatible)
    this.app.use(cors({
      origin: '*',
      methods: ['GET', 'POST', 'OPTIONS'],
      allowedHeaders: ['Content-Type', 'Authorization', 'Accept', 'mcp-session-id'],
      exposedHeaders: ['mcp-session-id'],
      credentials: false
    }));
    
    this.app.use(express.json({ limit: '10mb' }));
    this.app.use(express.urlencoded({ extended: true }));
  }

  /**
   * Setup MCP tools using the new McpServer API
   */
  private setupMCPTools(server: McpServer): void {
    // Register all tarot tools with proper Zod schemas
    
    // Get card info tool
      server.registerTool(
      "get_card_info",
      {
        title: "Get Card Info",
        description: "Get detailed information about a specific tarot card from the Rider-Waite deck",
        inputSchema: {
          cardName: z.string().describe("The name of the tarot card (e.g., 'The Fool', 'Two of Cups')"),
          orientation: z.enum(["upright", "reversed"]).optional().default("upright").describe("The orientation of the card")
        }
      },
      async (args) => {
        try {
          const result = await this.tarotServer.executeTool("get_card_info", args);
          return { content: [{ type: "text", text: result }] };
        } catch (error) {
          return {
            isError: true,
            content: [{ type: "text", text: `Error: ${error instanceof Error ? error.message : String(error)}` }]
          };
        }
      }
    );

    // List all cards tool
      server.registerTool(
      "list_all_cards",
      {
        title: "List All Cards",
        description: "List all available tarot cards in the Rider-Waite deck",
        inputSchema: {
          category: z.enum(["all", "major_arcana", "minor_arcana", "wands", "cups", "swords", "pentacles"]).optional().default("all")
        }
      },
      async (args) => {
        try {
          const result = await this.tarotServer.executeTool("list_all_cards", args);
          return { content: [{ type: "text", text: result }] };
        } catch (error) {
          return {
            isError: true,
            content: [{ type: "text", text: `Error: ${error instanceof Error ? error.message : String(error)}` }]
          };
        }
      }
    );

    // Perform reading tool
      server.registerTool(
      "perform_reading",
      {
        title: "Perform Reading",
        description: "Perform a tarot card reading using a specific spread",
        inputSchema: {
          spreadType: z.enum(["single_card", "three_card", "celtic_cross", "horseshoe", "relationship_cross", "career_path", "decision_making", "spiritual_guidance", "year_ahead", "chakra_alignment", "shadow_work", "venus_love", "tree_of_life", "astrological_houses", "mandala", "pentagram", "mirror_of_truth"]),
          question: z.string().describe("The question or focus for the reading"),
          sessionId: z.string().optional().describe("Optional session ID to continue a previous reading")
        }
      },
      async (args) => {
        try {
          const result = await this.tarotServer.executeTool("perform_reading", args);
          return { content: [{ type: "text", text: result }] };
        } catch (error) {
          return {
            isError: true,
            content: [{ type: "text", text: `Error: ${error instanceof Error ? error.message : String(error)}` }]
          };
        }
      }
    );

    // Search cards tool
      server.registerTool(
      "search_cards",
      {
        title: "Search Cards",
        description: "Search for tarot cards based on keywords, themes, or meanings",
        inputSchema: {
          query: z.string().describe("Search query for card meanings, themes, or keywords"),
          suit: z.enum(["wands", "cups", "swords", "pentacles", "major_arcana"]).optional(),
          element: z.enum(["fire", "water", "air", "earth"]).optional(),
          limit: z.number().optional().default(10)
        }
      },
      async (args) => {
        try {
          const result = await this.tarotServer.executeTool("search_cards", args);
          return { content: [{ type: "text", text: result }] };
        } catch (error) {
          return {
            isError: true,
            content: [{ type: "text", text: `Error: ${error instanceof Error ? error.message : String(error)}` }]
          };
        }
      }
    );

    // Find similar cards tool
      server.registerTool(
      "find_similar_cards",
      {
        title: "Find Similar Cards",
        description: "Find cards with similar meanings or themes to a given card",
        inputSchema: {
          cardName: z.string().describe("The name of the reference card"),
          limit: z.number().optional().default(5)
        }
      },
      async (args) => {
        try {
          const result = await this.tarotServer.executeTool("find_similar_cards", args);
          return { content: [{ type: "text", text: result }] };
        } catch (error) {
          return {
            isError: true,
            content: [{ type: "text", text: `Error: ${error instanceof Error ? error.message : String(error)}` }]
          };
        }
      }
    );

    // Get database analytics tool
      server.registerTool(
      "get_database_analytics",
      {
        title: "Get Database Analytics",
        description: "Get analytics and statistics about the tarot card database",
        inputSchema: {}
      },
      async (args) => {
        try {
          const result = await this.tarotServer.executeTool("get_database_analytics", args);
          return { content: [{ type: "text", text: result }] };
        } catch (error) {
          return {
            isError: true,
            content: [{ type: "text", text: `Error: ${error instanceof Error ? error.message : String(error)}` }]
          };
        }
      }
    );

    // Get random cards tool
      server.registerTool(
      "get_random_cards",
      {
        title: "Get Random Cards",
        description: "Get a specified number of random tarot cards",
        inputSchema: {
          count: z.number().min(1).max(78).describe("Number of random cards to draw (1-78)"),
          includeReversed: z.boolean().optional().default(false).describe("Whether to include reversed orientations")
        }
      },
      async (args) => {
        try {
          const result = await this.tarotServer.executeTool("get_random_cards", args);
          return { content: [{ type: "text", text: result }] };
        } catch (error) {
          return {
            isError: true,
            content: [{ type: "text", text: `Error: ${error instanceof Error ? error.message : String(error)}` }]
          };
        }
      }
    );

    // Create custom spread tool
      server.registerTool(
      "create_custom_spread",
      {
        title: "Create Custom Spread",
        description: "Create and perform a custom tarot spread with specified positions",
        inputSchema: {
          spreadName: z.string().describe("Name for the custom spread"),
          description: z.string().describe("Description of what the spread represents"),
          positions: z.array(z.string()).describe("Array of position names/meanings for the spread"),
          cards: z.array(z.string()).optional().describe("Optional specific cards to use"),
          context: z.string().optional().describe("Additional context for the reading")
        }
      },
      async (args) => {
        try {
          const result = await this.tarotServer.executeTool("create_custom_spread", args);
          return { content: [{ type: "text", text: result }] };
        } catch (error) {
          return {
            isError: true,
            content: [{ type: "text", text: `Error: ${error instanceof Error ? error.message : String(error)}` }]
          };
        }
      }
    );
  }

  /**
   * Setup HTTP routes
   */
  private setupRoutes(): void {
    // Health check endpoint
    this.app.get('/health', (req, res) => {
      res.json({
        status: 'ok',
        timestamp: new Date().toISOString(),
        server: 'tarot-mcp-server',
        version: '1.0.0',
        transport: 'streamable-http',
        endpoints: {
          mcp: '/mcp',
          health: '/health'
        }
      });
    });

    // Server info endpoint
    this.app.get('/info', (req, res) => {
      res.json({
        name: 'Tarot MCP Server',
        version: '1.0.0',
        description: 'Professional Rider-Waite tarot card reading server',
        protocol: 'Model Context Protocol',
        transport: 'Streamable HTTP',
        capabilities: ['tools'],
        tools: this.tarotServer.getAvailableTools().map(tool => ({
          name: tool.name,
          description: tool.description
        })),
        endpoints: {
          mcp: '/mcp',
          health: '/health',
          info: '/info'
        }
      });
    });

    // Main MCP endpoint - handle all requests
    this.app.all('/mcp', async (req, res) => {
      // Set CORS headers
      res.setHeader('Access-Control-Allow-Origin', '*');
      res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
      res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Accept, Authorization, mcp-session-id');
      
      if (req.method === 'OPTIONS') {
        res.status(200).end();
        return;
      }
      
      try {
        console.log(`📨 MCP ${req.method} request received:`, {
          url: req.url,
          originalUrl: req.originalUrl,
          path: req.path,
          headers: req.headers,
          body: req.body
        });
        
        // Check for invalid characters in URL
        if (req.originalUrl.includes('⁠') || req.originalUrl.includes('%E2%81%A0')) {
          console.error('❌ Invalid character detected in URL:', req.originalUrl);
          res.status(400).json({
            jsonrpc: '2.0',
            error: {
              code: -32600,
              message: 'Invalid Request: URL contains invalid characters'
            }
          });
          return;
        }
        
        // Check if this is an initialization request
        const isInitializeRequest = req.body && req.body.method === 'initialize';
        
        let sessionId = req.headers['mcp-session-id'] as string;
        
        if (isInitializeRequest && !sessionId) {
          // For initialization requests without session ID, generate a new one
          // According to MCP spec, server MAY assign session ID at initialization time
          const timestamp = Date.now();
          const randomString = Math.random().toString(36).substring(2, 15);
          sessionId = `mcp-${timestamp}-${randomString}`;
          console.log(`🆕 Generated new session ID for initialization: ${sessionId}`);
          
          // Set the session ID in response header as per MCP spec
          res.setHeader('Mcp-Session-Id', sessionId);
        } else if (!sessionId) {
          // For non-initialization requests without session ID, return 400 as per MCP spec
          console.error('❌ Missing Mcp-Session-Id header for non-initialization request');
          res.status(400).json({
            jsonrpc: '2.0',
            error: {
              code: -32000,
              message: 'Bad Request: Mcp-Session-Id header is required'
            },
            id: req.body?.id || null
          });
          return;
        }
        
        // Get or create session for this session ID
        const session = await this.getOrCreateSession(sessionId);
        
        // Handle request with session-specific transport
        console.log(`🔄 Handling request with session transport: ${sessionId}`);
        await session.transport.handleRequest(req, res, req.body);
        console.log(`✅ Request handled successfully for session: ${sessionId}`);
        
      } catch (error) {
        console.error('❌ MCP request error:', error);
        if (!res.headersSent) {
          res.status(500).json({
            jsonrpc: '2.0',
            error: {
              code: -32603,
              message: 'Internal error',
              data: error instanceof Error ? error.message : String(error)
            }
          });
        }
      }
    });

    // Root endpoint with server information
    this.app.get('/', (req, res) => {
      res.json({
        message: 'Tarot MCP Server',
        version: '1.0.0',
        description: 'Professional Rider-Waite tarot card reading server with MCP support',
        documentation: 'https://github.com/your-repo/tarot-mcp',
        endpoints: {
          mcp: '/mcp - Main MCP endpoint for client connections',
          health: '/health - Health check endpoint',
          info: '/info - Server information and capabilities'
        },
        usage: {
          dify: 'Use http://your-server:3000/mcp as the MCP server URL in Dify',
          claude: 'Configure as HTTP MCP server in Claude Desktop'
        }
      });
    });

    // Handle 404s
    this.app.use('*', (req, res) => {
      res.status(404).json({
        error: 'Not Found',
        message: `Endpoint ${req.originalUrl} not found`,
        availableEndpoints: ['/mcp', '/health', '/info', '/']
      });
    });

    // Global error handler
    this.app.use((error: any, req: express.Request, res: express.Response, next: express.NextFunction) => {
      console.error('Express error:', error);
      if (!res.headersSent) {
        res.status(500).json({
          error: 'Internal Server Error',
          message: error.message || 'An unexpected error occurred'
        });
      }
    });
  }

  /**
   * Start the HTTP server
   */
  public async start(): Promise<void> {
    try {
      return new Promise((resolve, reject) => {
        try {
          this.httpServer = this.app.listen(this.port, '0.0.0.0', () => {
            console.log(`🔮 Tarot MCP Server (Streamable HTTP) running on http://0.0.0.0:${this.port}`);
            console.log(`🌐 MCP endpoint: http://0.0.0.0:${this.port}/mcp`);
            console.log(`❤️  Health check: http://0.0.0.0:${this.port}/health`);
            console.log(`📋 Server info: http://0.0.0.0:${this.port}/info`);
            console.log(`🔗 Dify integration: Use http://your-server:${this.port}/mcp as MCP server URL`);
            console.log(`🛠️  Available tools: ${this.tarotServer.getAvailableTools().length}`);
            resolve();
          });

          this.httpServer.on('error', (error: any) => {
            console.error('HTTP server error:', error);
            reject(error);
          });

        } catch (error) {
          console.error('Failed to start HTTP server:', error);
          reject(error);
        }
      });
    } catch (error) {
      console.error('Failed to connect transport:', error);
      throw error;
    }
  }

  /**
   * Stop the HTTP server
   */
  public async stop(): Promise<void> {
    return new Promise((resolve) => {
      if (this.httpServer) {
        this.httpServer.close(() => {
          console.log('🔮 Tarot MCP Server stopped');
          resolve();
        });
      } else {
        resolve();
      }
    });
  }

  /**
   * Get server information
   */
  public getServerInfo() {
    return {
      name: 'tarot-mcp-server',
      version: '1.0.0',
      port: this.port,
      transport: 'streamable-http',
      endpoints: {
        mcp: `/mcp`,
        health: `/health`,
        info: `/info`
      }
    };
  }
}