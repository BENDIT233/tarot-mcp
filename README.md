# 🔮 Tarot MCP 服务器

这是一个专业的 Rider-Waite 塔罗牌解读 MCP (Model Context Protocol) 服务器，使用 Node.js 和 TypeScript 构建。本项目基于原仓库 <mcurl name="https://github.com/fzlzjerry/tarot-mcp" url="https://github.com/fzlzjerry/tarot-mcp"></mcurl> 进行二次开发。

> **注意**：本项目的二次开发完全由 AI 完成。

## 📜 版本历史

- **v1.1.0 (2025-07-29)**：新增对 MCP 2025-03-26 协议中 Streamable HTTP 格式的原生支持，为 AI Agent 集成提供实时、双向的通信能力。
- **v1.0.0 (2025-07-28)**：初始版本，提供基于 Rider-Waite 牌组的专业塔罗牌解读功能。

## ✨ 核心功能

- **🃏 专业的塔罗牌系统**：
  - 完整的 78 张 Rider-Waite 牌组，包含详细的正逆位解读。
  - 支持多种专业牌阵，如单张牌、三牌阵、凯尔特十字等。
  - AI 可根据用户问题动态创建自定义牌阵。
- **🧠 高级解读引擎**：
  - 结合元素、数字、原型模式进行多维度分析。
  - 根据问题情境（如事业、爱情）提供定制化解读。
- **🚀 技术实现**：
  - **多协议支持**：原生支持 Streamable HTTP (MCP 2025-03-26)，兼容 Dify 等主流 AI Agent 平台。
  - **会话管理**：严格遵循 MCP 2025-06-18 规范，实现稳健的会话生命周期管理。
  - **Docker 化**：提供 Dockerfile 和 docker-compose.yml，支持一键部署。
  - **完全类型安全**：使用 TypeScript 编写，保证代码质量。

## 🔌 API 与使用示例

### Streamable HTTP API (MCP 2025-03-26)

您可以将任何兼容 MCP 2025-03-26 的客户端（如 Dify）连接到以下端点：

- **URL**：`http://<your-server-ip>:9801/mcp`
- **协议**：`HTTP`
- **会话管理**：服务器会自动处理会话创建。`Mcp-Session-Id` 将在 `initialize` 请求的响应头中返回。

#### 1. 初始化会话

此请求将初始化一个新会话并返回会话 ID。

```bash
curl -i -X POST http://localhost:9801/mcp \
-H "Content-Type: application/json" \
-H "Accept: application/json, text/event-stream" \
-d '{
  "mcp_protocol_version": "2025-03-26",
  "method": "initialize",
  "params": {}
}'
```

**预期响应**：
- `200 OK` 状态码，并在响应头中包含 `Mcp-Session-Id`。
- 包含服务器信息的 JSON 响应体。

#### 2. 获取可用工具列表

使用上一步获取的 `Mcp-Session-Id` 来请求可用工具列表。

```bash
# 将 <your-session-id> 替换为 initialize 请求返回的 ID
curl -X POST http://localhost:9801/mcp \
-H "Content-Type: application/json" \
-H "Accept: application/json, text/event-stream" \
-H "Mcp-Session-Id: <your-session-id>" \
-d '{
  "mcp_protocol_version": "2025-03-26",
  "method": "tools/list",
  "params": {}
}'
```

**预期响应**：
- 包含所有可用工具信息的 Server-Sent Events (SSE) 事件流。

#### 3. 调用工具

执行一个工具调用，例如 `get_random_cards`。

```bash
# 将 <your-session-id> 替换为你的会话 ID
curl -X POST http://localhost:9801/mcp \
-H "Content-Type: application/json" \
-H "Accept: application/json, text/event-stream" \
-H "Mcp-Session-Id: <your-session-id>" \
-d '{
  "mcp_protocol_version": "2025-03-26",
  "method": "tools/call",
  "params": {
    "tool_name": "get_random_cards",
    "parameters": {
      "count": 3
    }
  }
}'
```

**预期响应**：
- 包含工具调用结果（例如随机抽取的塔罗牌）的 SSE 事件流。

## 🐳 Docker 部署

为了方便部署，项目提供了 `docker-compose.yml` 文件。

```bash
docker-compose up --build -d
```

服务将在 `http://localhost:9801` 上可用。
