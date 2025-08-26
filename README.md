# 🔮 Tarot MCP 服务器

这是一个专业的 Rider-Waite 塔罗牌解读 MCP (Model Context Protocol) 服务器，使用 Node.js 和 TypeScript 构建。

> [!NOTE] 
> 本项目为开源项目，在[tarot-mcp](https://github.com/fzlzjerry/tarot-mcp)的基础上进行二次开发，本项目的二次开发完全由 AI 完成。

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


## 🚀 部署指南

### 方法一：Docker Compose 部署（推荐）

1. **克隆项目**
```bash
git clone <repository-url>
cd tarot-mcp
```

2. **启动服务**
```bash
docker-compose up --build -d
```

3. **使用**
服务将在 `http://localhost:9801` 上可用。

### 方法二：NPM 部署

1. **克隆项目**
```bash
git clone <repository-url>
cd tarot-mcp
```

2. **安装依赖**
```bash
npm install
```

3. **构建项目**
```bash
npm run build
```

4. **启动服务**
```bash
# 开发模式（自动重载）
npm run dev

# 生产模式
npm start
```

## 相关项目
- [tarot-mcp](https://github.com/fzlzjerry/tarot-mcp)：原版项目
