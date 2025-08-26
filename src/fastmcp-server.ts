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
        description: "专业韦特塔罗牌占卜服务器"
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
        title: "获取塔罗牌信息",
        description: "获取特定塔罗牌的详细信息，包括含义、象征和解释",
        inputSchema: {
          cardName: z.string().describe("塔罗牌的名称"),
          orientation: z.enum(["upright", "reversed"]).optional().describe("牌的方向（正位或逆位）")
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
        title: "列出所有塔罗牌",
        description: "列出所有可用的塔罗牌及其基本信息",
        inputSchema: {
          category: z.enum(["major", "minor", "all"]).optional().describe("按类别筛选牌组")
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
        title: "进行塔罗占卜",
        description: "使用特定牌阵进行完整的塔罗牌占卜，包括抽牌和解读",
        inputSchema: {
          spreadType: z.string().describe("要使用的塔罗牌阵类型（例如：'single'、'three-card'、'celtic-cross'）"),
          question: z.string().optional().describe("占卜的问题或关注焦点"),
          sessionId: z.string().optional().describe("用于跟踪的会话ID")
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
        title: "搜索塔罗牌",
        description: "使用关键词、主题或含义搜索塔罗牌",
        inputSchema: {
          query: z.string().describe("搜索查询或关键词"),
          suit: z.string().optional().describe("按花色筛选（小阿卡纳）"),
          element: z.string().optional().describe("按元素筛选"),
          limit: z.number().optional().describe("返回结果的最大数量")
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
        title: "查找相似塔罗牌",
        description: "查找与指定牌含义或主题相似的其他塔罗牌",
        inputSchema: {
          cardName: z.string().describe("参考牌的名称"),
          limit: z.number().optional().describe("返回相似牌的最大数量")
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
        title: "获取数据库分析",
        description: "获取塔罗牌数据库的分析和统计信息",
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
        title: "获取随机塔罗牌",
        description: "获取指定数量的随机塔罗牌",
        inputSchema: {
          count: z.number().describe("要返回的随机牌数量"),
          includeReversed: z.boolean().optional().describe("是否包含逆位方向")
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
        title: "创建自定义牌阵",
        description: "创建并执行具有指定位置的自定义塔罗牌阵",
        inputSchema: {
          spreadName: z.string().describe("自定义牌阵的名称"),
          description: z.string().describe("牌阵用途的描述"),
          positions: z.array(z.string()).describe("位置名称/含义的数组"),
          cards: z.array(z.string()).optional().describe("要使用的特定牌（可选）"),
          context: z.string().optional().describe("解读的额外上下文")
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
      { name: 'get_card_info', description: '获取特定塔罗牌的详细信息' },
      { name: 'list_all_cards', description: '列出所有可用的塔罗牌' },
      { name: 'perform_reading', description: '使用特定牌阵进行塔罗牌占卜' },
      { name: 'search_cards', description: '基于关键词、主题或含义搜索塔罗牌' },
      { name: 'find_similar_cards', description: '查找与指定牌含义或主题相似的塔罗牌' },
      { name: 'get_database_analytics', description: '获取塔罗牌数据库的分析和统计信息' },
      { name: 'get_random_cards', description: '获取指定数量的随机塔罗牌' },
      { name: 'create_custom_spread', description: '创建并执行具有指定位置的自定义塔罗牌阵' }
    ];
  }
}

// CLI support
if (import.meta.url === `file://${process.argv[1]}`) {
  const server = new TarotFastMCPServer();
  await server.initialize();
  await server.startStdio();
}