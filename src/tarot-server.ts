import { Tool } from "@modelcontextprotocol/sdk/types.js";
import { TarotCardManager } from "./tarot/card-manager.js";
import { TarotReadingManager } from "./tarot/reading-manager.js";
import { TarotSessionManager } from "./tarot/session-manager.js";
import { TarotCardSearch } from "./tarot/card-search.js";
import { TarotCardAnalytics } from "./tarot/card-analytics.js";

/**
 * Main class for the Tarot MCP Server functionality.
 * Use the static `create()` method to instantiate.
 */
export class TarotServer {
  private cardManager: TarotCardManager;
  private readingManager: TarotReadingManager;
  private sessionManager: TarotSessionManager;
  private cardSearch: TarotCardSearch;
  private cardAnalytics: TarotCardAnalytics;

  /**
   * The constructor is private. Use the static async `create()` method.
   */
  private constructor(cardManager: TarotCardManager) {
    this.cardManager = cardManager;
    this.sessionManager = new TarotSessionManager();
    this.readingManager = new TarotReadingManager(this.cardManager, this.sessionManager);
    this.cardSearch = new TarotCardSearch(this.cardManager.getAllCards());
    this.cardAnalytics = new TarotCardAnalytics(this.cardManager.getAllCards());
  }

  /**
   * Asynchronously creates and initializes a TarotServer instance.
   */
  public static async create(): Promise<TarotServer> {
    const cardManager = await TarotCardManager.create();
    return new TarotServer(cardManager);
  }

  /**
   * Returns all available tools for the Tarot MCP Server
   */
  public getAvailableTools(): Tool[] {
    return [
      {
        name: "get_card_info",
        description: "获取特定塔罗牌的详细信息，包括含义、象征和解释",
        inputSchema: {
          type: "object",
          properties: {
            cardName: {
              type: "string",
              description: "塔罗牌的名称（例如：'愚者'、'圣杯二'）",
            },
            orientation: {
              type: "string",
              enum: ["upright", "reversed"],
              description: "牌的方向（正位或逆位）",
              default: "upright",
            },
          },
          required: ["cardName"],
        },
      },
      {
        name: "list_all_cards",
        description: "列出所有可用的塔罗牌",
        inputSchema: {
          type: "object",
          properties: {
            category: {
              type: "string",
              enum: ["all", "major_arcana", "minor_arcana", "wands", "cups", "swords", "pentacles"],
              description: "按类别筛选牌组",
              default: "all",
            },
          },
        },
      },
      {
        name: "perform_reading",
        description: "使用特定牌阵进行塔罗牌占卜",
        inputSchema: {
          type: "object",
          properties: {
            spreadType: {
              type: "string",
              enum: ["single_card", "three_card", "celtic_cross", "horseshoe", "relationship_cross", "career_path", "decision_making", "spiritual_guidance", "year_ahead", "chakra_alignment", "shadow_work", "venus_love", "tree_of_life", "astrological_houses", "mandala", "pentagram", "mirror_of_truth"],
              description: "要使用的塔罗牌阵类型",
            },
            question: {
              type: "string",
              description: "占卜的问题或关注焦点",
            },
            sessionId: {
              type: "string",
              description: "可选的会话ID，用于继续之前的占卜",
            },
          },
          required: ["spreadType", "question"],
        },
      },
      {
        name: "search_cards",
        description: "使用关键词、花色、元素等条件搜索塔罗牌",
        inputSchema: {
          type: "object",
          properties: {
            keyword: {
              type: "string",
              description: "在牌义、关键词或象征中搜索的关键词",
            },
            suit: {
              type: "string",
              enum: ["wands", "cups", "swords", "pentacles"],
              description: "按花色筛选",
            },
            arcana: {
              type: "string",
              enum: ["major", "minor"],
              description: "按阿卡纳类型筛选",
            },
            element: {
              type: "string",
              enum: ["fire", "water", "air", "earth"],
              description: "按元素筛选",
            },
            number: {
              type: "number",
              description: "按牌号筛选",
            },
            orientation: {
              type: "string",
              enum: ["upright", "reversed"],
              description: "在正位或逆位含义中搜索",
            },
            limit: {
              type: "number",
              description: "返回结果的最大数量（默认：10）",
            },
          },
        },
      },
      {
        name: "find_similar_cards",
        description: "查找与指定牌含义相似的其他塔罗牌",
        inputSchema: {
          type: "object",
          properties: {
            cardName: {
              type: "string",
              description: "要查找相似牌的参考牌名称",
            },
            limit: {
              type: "number",
              description: "返回相似牌的最大数量（默认：5）",
            },
          },
          required: ["cardName"],
        },
      },
      {
        name: "get_database_analytics",
        description: "获取塔罗牌数据库的综合分析和统计信息",
        inputSchema: {
          type: "object",
          properties: {
            includeRecommendations: {
              type: "boolean",
              description: "是否包含改进建议（默认：true）",
            },
          },
        },
      },
      {
        name: "get_random_cards",
        description: "随机抽取塔罗牌，支持可选筛选条件",
        inputSchema: {
          type: "object",
          properties: {
            count: {
              type: "number",
              description: "要抽取的随机牌数量（默认：1）",
            },
            suit: {
              type: "string",
              enum: ["wands", "cups", "swords", "pentacles"],
              description: "按花色筛选",
            },
            arcana: {
              type: "string",
              enum: ["major", "minor"],
              description: "按阿卡纳类型筛选",
            },
            element: {
              type: "string",
              enum: ["fire", "water", "air", "earth"],
              description: "按元素筛选",
            },
          },
        },
      },
      {
        name: "create_custom_spread",
        description: "创建自定义塔罗牌阵并为其抽牌。当现有牌阵不符合需求时，可以创建具有特定位置和含义的自定义布局。",
        inputSchema: {
          type: "object",
          properties: {
            spreadName: {
              type: "string",
              description: "自定义牌阵的名称",
            },
            description: {
              type: "string",
              description: "此牌阵设计用于探索的内容描述",
            },
            positions: {
              type: "array",
              description: "定义牌阵中每个牌位的位置对象数组",
              items: {
                type: "object",
                properties: {
                  name: {
                    type: "string",
                    description: "此位置的名称（例如：'过去影响'、'当前挑战'）",
                  },
                  meaning: {
                    type: "string",
                    description: "此位置在占卜中代表的含义",
                  },
                },
                required: ["name", "meaning"],
              },
              minItems: 1,
              maxItems: 15,
            },
            question: {
              type: "string",
              description: "此次占卜的问题或关注焦点",
            },
            sessionId: {
              type: "string",
              description: "可选的会话ID，用于继续之前的占卜",
            },
          },
          required: ["spreadName", "description", "positions", "question"],
        },
      },
    ];
  }

  /**
   * Get detailed information about a specific tarot card
   */
  public async getCardInfo(cardName: string, orientation?: string): Promise<any> {
    return this.cardManager.getCardInfo(cardName, (orientation || "upright") as any);
  }

  /**
   * List all available tarot cards
   */
  public async listAllCards(category?: string): Promise<any> {
    return this.cardManager.listAllCards((category || "all") as any);
  }

  /**
   * Perform a tarot reading
   */
  public async performReading(spreadType: string, question?: string, sessionId?: string): Promise<any> {
    return this.readingManager.performReading(spreadType, question || "", sessionId);
  }

  /**
   * Search for tarot cards
   */
  public async searchCards(query: string, suit?: string, element?: string, limit?: number): Promise<any> {
    return this.handleSearchCards({ keyword: query, suit, element, limit });
  }

  /**
   * Find similar cards
   */
  public async findSimilarCards(cardName: string, limit?: number): Promise<any> {
    return this.handleFindSimilarCards({ cardName, limit });
  }

  /**
   * Get database analytics
   */
  public async getDatabaseAnalytics(): Promise<any> {
    return this.handleGetAnalytics({});
  }

  /**
   * Get random cards
   */
  public async getRandomCards(count: number, includeReversed?: boolean): Promise<any> {
    return this.handleGetRandomCards({ count, includeReversed });
  }

  /**
   * Create custom spread
   */
  public async createCustomSpread(spreadName: string, description: string, positions: string[], cards?: string[], context?: string): Promise<any> {
    return this.handleCreateCustomSpread({ spreadName, description, positions, cards, context });
  }

  /**
   * Executes a specific tool with the provided arguments
   */
  public async executeTool(toolName: string, args: Record<string, any>): Promise<string> {
    switch (toolName) {
      case "get_card_info":
        return this.cardManager.getCardInfo(args.cardName, args.orientation || "upright");

      case "list_all_cards":
        return this.cardManager.listAllCards(args.category || "all");

      case "perform_reading":
        return this.readingManager.performReading(
          args.spreadType,
          args.question,
          args.sessionId
        );

      case "search_cards":
        return this.handleSearchCards(args);

      case "find_similar_cards":
        return this.handleFindSimilarCards(args);

      case "get_database_analytics":
        return this.handleGetAnalytics(args);

      case "get_random_cards":
        return this.handleGetRandomCards(args);

      case "create_custom_spread":
        return this.handleCreateCustomSpread(args);

      default:
        throw new Error(`未知工具：${toolName}`);
    }
  }

  /**
   * Handle card search requests
   */
  private handleSearchCards(args: Record<string, any>): string {
    const searchOptions = {
      keyword: args.keyword,
      suit: args.suit,
      arcana: args.arcana,
      element: args.element,
      number: args.number,
      orientation: args.orientation || 'upright'
    };

    const results = this.cardSearch.search(searchOptions);
    const limit = args.limit || 10;
    const limitedResults = results.slice(0, limit);

    if (limitedResults.length === 0) {
      return "未找到符合搜索条件的牌。";
    }

    let response = `找到 ${results.length} 张符合搜索条件的牌`;
    if (results.length > limit) {
      response += `（显示前 ${limit} 张）`;
    }
    response += "：\n\n";

    for (const result of limitedResults) {
      response += `**${result.card.name}**（相关度：${result.relevanceScore}）\n`;
      response += `- 花色：${result.card.suit || '无'} | 元素：${result.card.element || '无'}\n`;
      response += `- 匹配字段：${result.matchedFields.join('、')}\n`;
      response += `- 关键词：${result.card.keywords.upright.slice(0, 3).join('、')}\n\n`;
    }

    return response;
  }

  /**
   * Handle finding similar cards
   */
  private handleFindSimilarCards(args: Record<string, any>): string {
    const cardName = args.cardName;
    const limit = args.limit || 5;

    // First find the card ID
    const targetCard = this.cardManager.getAllCards().find(
      card => card.name.toLowerCase() === cardName.toLowerCase()
    );

    if (!targetCard) {
      return `未找到牌"${cardName}"。请检查牌名并重试。`;
    }

    const similarCards = this.cardSearch.findSimilarCards(targetCard.id, limit);

    if (similarCards.length === 0) {
      return `未找到与"${cardName}"相似的牌。`;
    }

    let response = `与**${targetCard.name}**相似的牌：\n\n`;

    for (const card of similarCards) {
      response += `**${card.name}**\n`;
      response += `- 花色：${card.suit || '无'} | 元素：${card.element || '无'}\n`;
      response += `- 关键词：${card.keywords.upright.slice(0, 3).join('、')}\n`;
      response += `- 基本含义：${card.meanings.upright.general.substring(0, 100)}...\n\n`;
    }

    return response;
  }

  /**
   * Handle database analytics requests
   */
  private handleGetAnalytics(args: Record<string, any>): string {
    const includeRecommendations = args.includeRecommendations !== false;
    const analytics = this.cardAnalytics.generateReport();

    let response = "# 🔮 Tarot Database Analytics Report\n\n";

    // Overview
    response += "## 📊 Database Overview\n";
    response += `- **Total Cards**: ${analytics.overview.totalCards}\n`;
    response += `- **Completion Rate**: ${analytics.overview.completionRate.toFixed(1)}%\n`;
    response += `- **Major Arcana**: ${analytics.overview.arcanaDistribution.major || 0} cards\n`;
    response += `- **Minor Arcana**: ${analytics.overview.arcanaDistribution.minor || 0} cards\n\n`;

    // Suits distribution
    response += "### Suits Distribution\n";
    for (const [suit, count] of Object.entries(analytics.overview.suitDistribution)) {
      response += `- **${suit.charAt(0).toUpperCase() + suit.slice(1)}**: ${count} cards\n`;
    }
    response += "\n";

    // Elements distribution
    response += "### Elements Distribution\n";
    for (const [element, count] of Object.entries(analytics.overview.elementDistribution)) {
      response += `- **${element.charAt(0).toUpperCase() + element.slice(1)}**: ${count} cards\n`;
    }
    response += "\n";

    // Data Quality
    response += "## 🔍 Data Quality\n";
    response += `- **Complete Cards**: ${analytics.dataQuality.completeCards}/${analytics.overview.totalCards}\n`;
    response += `- **Average Keywords per Card**: ${analytics.dataQuality.averageKeywordsPerCard.toFixed(1)}\n`;
    response += `- **Average Symbols per Card**: ${analytics.dataQuality.averageSymbolsPerCard.toFixed(1)}\n`;

    if (analytics.dataQuality.incompleteCards.length > 0) {
      response += `- **Incomplete Cards**: ${analytics.dataQuality.incompleteCards.join(', ')}\n`;
    }
    response += "\n";

    // Content Analysis
    response += "## 📈 Content Analysis\n";
    response += "### Most Common Keywords\n";
    for (const keyword of analytics.contentAnalysis.mostCommonKeywords.slice(0, 10)) {
      response += `- **${keyword.keyword}**: ${keyword.count} times (${keyword.percentage.toFixed(1)}%)\n`;
    }
    response += "\n";

    // Recommendations
    if (includeRecommendations && analytics.recommendations.length > 0) {
      response += "## 💡 Recommendations\n";
      for (const recommendation of analytics.recommendations) {
        response += `- ${recommendation}\n`;
      }
      response += "\n";
    }

    return response;
  }

  /**
   * Handle random card requests
   */
  private handleGetRandomCards(args: Record<string, any>): string {
    const count = args.count || 1;
    const options = {
      suit: args.suit,
      arcana: args.arcana,
      element: args.element
    };

    // Remove undefined values from options to avoid filtering issues
    const cleanOptions = Object.fromEntries(
      Object.entries(options).filter(([_, value]) => value !== undefined)
    );

    const randomCards = this.cardSearch.getRandomCards(count, Object.keys(cleanOptions).length > 0 ? cleanOptions : undefined);

    if (randomCards.length === 0) {
      return "未找到符合条件的牌。";
    }

    let response = count === 1 ? "🎴 随机牌：\n\n" : `🎴 ${randomCards.length} 张随机牌：\n\n`;

    for (const card of randomCards) {
      response += `**${card.name}**\n`;
      response += `- 花色：${card.suit || '无'} | 元素：${card.element || '无'}\n`;
      response += `- 关键词：${card.keywords.upright.join('、')}\n`;
      response += `- 基本含义：${card.meanings.upright.general}\n\n`;
    }

    return response;
  }

  /**
   * Handle custom spread creation and reading
   */
  private handleCreateCustomSpread(args: Record<string, any>): string {
    const { spreadName, description, positions, question, sessionId } = args;

    // Validate input
    if (!spreadName || typeof spreadName !== 'string') {
      return "错误：牌阵名称是必需的，且必须是字符串。";
    }

    if (!description || typeof description !== 'string') {
      return "错误：牌阵描述是必需的，且必须是字符串。";
    }

    if (!Array.isArray(positions) || positions.length === 0) {
      return "错误：位置必须是非空数组。";
    }

    if (positions.length > 15) {
      return "错误：自定义牌阵最多允许15个位置。";
    }

    if (!question || typeof question !== 'string') {
      return "错误：问题是必需的，且必须是字符串。";
    }

    // Validate each position
    for (let i = 0; i < positions.length; i++) {
      const position = positions[i];
      if (!position || typeof position !== 'object') {
        return `错误：位置 ${i + 1} 必须是包含'name'和'meaning'属性的对象。`;
      }
      if (!position.name || typeof position.name !== 'string') {
        return `错误：位置 ${i + 1} 必须有一个字符串类型的'name'属性。`;
      }
      if (!position.meaning || typeof position.meaning !== 'string') {
        return `错误：位置 ${i + 1} 必须有一个字符串类型的'meaning'属性。`;
      }
    }

    try {
      return this.readingManager.performCustomReading(
        spreadName,
        description,
        positions,
        question,
        sessionId
      );
    } catch (error) {
      return `创建自定义牌阵时出错：${error instanceof Error ? error.message : String(error)}`;
    }
  }
}