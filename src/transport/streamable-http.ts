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
      description: "专业韦特塔罗牌占卜服务器"
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
        title: "获取塔罗牌信息",
        description: "获取韦特塔罗牌组中特定塔罗牌的详细信息",
        inputSchema: {
          cardName: z.string().describe("塔罗牌的名称（例如：'愚者'、'圣杯二'）"),
          orientation: z.enum(["upright", "reversed"]).optional().default("upright").describe("牌的方向")
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
        title: "列出所有塔罗牌",
        description: "列出韦特塔罗牌组中所有可用的塔罗牌",
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
        title: "进行塔罗占卜",
        description: "使用特定牌阵进行塔罗牌占卜",
        inputSchema: {
          spreadType: z.enum(["single_card", "three_card", "celtic_cross", "horseshoe", "relationship_cross", "career_path", "decision_making", "spiritual_guidance", "year_ahead", "chakra_alignment", "shadow_work", "venus_love", "tree_of_life", "astrological_houses", "mandala", "pentagram", "mirror_of_truth"]),
          question: z.string().describe("占卜的问题或关注焦点"),
          sessionId: z.string().optional().describe("可选的会话ID，用于继续之前的占卜")
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
        title: "搜索塔罗牌",
        description: "基于关键词、主题或含义搜索塔罗牌",
        inputSchema: {
          query: z.string().describe("搜索牌义、主题或关键词的查询"),
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
        title: "查找相似塔罗牌",
        description: "查找与指定牌含义或主题相似的塔罗牌",
        inputSchema: {
          cardName: z.string().describe("参考牌的名称"),
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
        title: "获取数据库分析",
        description: "获取塔罗牌数据库的分析和统计信息",
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
        title: "获取随机塔罗牌",
        description: "获取指定数量的随机塔罗牌",
        inputSchema: {
          count: z.number().min(1).max(78).describe("要抽取的随机牌数量（1-78）"),
          includeReversed: z.boolean().optional().default(false).describe("是否包含逆位方向")
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
        title: "创建自定义牌阵",
        description: "创建并执行具有指定位置的自定义塔罗牌阵",
        inputSchema: {
          spreadName: z.string().describe("自定义牌阵的名称"),
          description: z.string().describe("牌阵所代表内容的描述"),
          positions: z.array(z.string()).describe("牌阵位置名称/含义的数组"),
          cards: z.array(z.string()).optional().describe("可选的特定牌组"),
          context: z.string().optional().describe("占卜的额外上下文")
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
        description: '专业韦特塔罗牌占卜服务器',
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
        description: '支持MCP协议的专业韦特塔罗牌占卜服务器',
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