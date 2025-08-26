import { StreamableHTTPServer } from "./transport/streamable-http.js";
import { TarotFastMCPServer } from "./fastmcp-server.js";
import { TarotServer } from "./tarot-server.js";

/**
 * HTTP Server for Tarot MCP with Streamable HTTP support
 * Compatible with Dify and other MCP clients
 */
export class TarotHttpServer {
  private streamableServer: StreamableHTTPServer;
  private fastMCPServer: TarotFastMCPServer;
  private tarotServer: TarotServer;
  private port: number;
  private serverType: 'streamable' | 'fastmcp';

  constructor(tarotServer: TarotServer, port: number = 9801, serverType: 'streamable' | 'fastmcp' = 'streamable') {
    this.port = port;
    this.tarotServer = tarotServer;
    this.serverType = serverType;
    
    // Initialize the appropriate server type
    this.streamableServer = new StreamableHTTPServer(tarotServer, port);
    this.fastMCPServer = new TarotFastMCPServer();
  }

  /**
   * Get server information
   */
  public getServerInfo() {
    return {
      name: 'tarot-mcp-server',
      version: '1.0.0',
      port: this.port,
      serverType: this.serverType,
      transport: this.serverType === 'streamable' ? 'streamable-http' : 'fastmcp-http',
      capabilities: ['tools'],
      toolCount: this.tarotServer.getAvailableTools().length
    };
  }

  /**
   * Start the appropriate server type
   */
  public async start(): Promise<void> {
    if (this.serverType === 'fastmcp') {
      await this.fastMCPServer.initialize();
      await this.fastMCPServer.startHTTP({ port: this.port });
    } else {
      await this.streamableServer.start();
    }
  }

  /**
   * Stop the server
   */
  public async stop(): Promise<void> {
    if (this.serverType === 'streamable') {
      await this.streamableServer.stop();
    }
    // FastMCP server doesn't have a stop method in the current implementation
  }

  /**
   * Get the underlying server instance for advanced usage
   */
  public getStreamableServer(): StreamableHTTPServer {
    return this.streamableServer;
  }

  /**
   * Get the FastMCP server instance
   */
  public getFastMCPServer(): TarotFastMCPServer {
    return this.fastMCPServer;
  }
}