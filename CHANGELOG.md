# 📝 塔罗牌 MCP 服务器更新日志

## 🎯 版本 1.1.0 - 公平随机性更新 (2025-07-28)

### 🔄 重大改变：正位/逆位分布调整

#### 从 70/30 改为 50/50 分布

**之前 (70/30):**
- 正位牌：70% 概率
- 逆位牌：30% 概率
- 基于传统塔罗牌实践

**现在 (50/50):**
- 正位牌：50% 概率
- 逆位牌：50% 概率
- 完全公平的随机分布

#### 🎯 改变原因

1. **完全公正性**
   - 每种方向有相等的概率
   - 消除任何潜在的偏差
   - 符合现代公平原则

2. **统计准确性**
   - 更容易验证随机性
   - 简化质量评估算法
   - 便于长期统计分析

3. **用户反馈**
   - 用户要求更公平的分布
   - 避免过度倾向正位解读
   - 提供更平衡的占卜体验

#### 🔧 技术实现

```typescript
// 之前的实现
private getSecureRandomOrientation(): CardOrientation {
  const random = this.getSecureRandom();
  return random < 0.7 ? "upright" : "reversed"; // 70% 正位
}

// 现在的实现
private getSecureRandomOrientation(): CardOrientation {
  const random = this.getSecureRandom();
  return random < 0.5 ? "upright" : "reversed"; // 50% 正位
}
```

#### 📊 验证工具更新

随机性验证工具 (`verify_randomness`) 已更新：
- 期望正位比例：从 ~70% 改为 ~50%
- 偏差计算：基于50%基准线
- 质量评分：调整评分算法

#### 🧪 测试结果

使用新的50/50分布进行测试：
- ✅ 统计分布更加均匀
- ✅ 验证工具正常工作
- ✅ 占卜结果更加平衡
- ✅ 加密级随机性保持不变

## 🔒 随机性保证系统 (版本 1.0.0)

### ✅ 已实现的功能

1. **加密级随机数生成**
   - Web Crypto API / Node.js crypto 模块
   - 操作系统级熵源
   - 自动降级机制

2. **Fisher-Yates 洗牌算法**
   - 数学证明的均匀分布
   - O(n) 时间复杂度
   - 无统计偏差

3. **13个专业工具**
   - 基础塔罗牌工具 (4个)
   - 专业牌阵工具 (4个)
   - 高级分析工具 (5个)

4. **11种专业牌阵**
   - 通用指导牌阵 (4种)
   - 关系与个人牌阵 (3种)
   - 事业与人生道路牌阵 (2种)
   - 灵性与能量工作牌阵 (2种)

5. **随机性验证系统**
   - Chi-square 统计检验
   - 方向分布验证
   - 性能指标分析
   - 质量评分系统

## 🎯 使用指南

### 启动服务器

```bash
# HTTP 模式（推荐用于测试）
npm run start:http

# MCP 协议模式（用于 AI 客户端）
npm start

# 开发模式（带热重载）
npm run dev:http
```

### 验证随机性

```bash
# 验证50/50分布
curl -X POST http://localhost:3000/mcp \
  -H "Content-Type: application/json" \
  -d '{
    "jsonrpc": "2.0",
    "id": 1,
    "method": "tools/call",
    "params": {
      "name": "verify_randomness",
      "arguments": {
        "testCount": 100,
        "cardCount": 3
      }
    }
  }'
```

### 测试占卜

```bash
# 三张牌占卜
curl -X POST http://localhost:3000/api/reading \
  -H "Content-Type: application/json" \
  -d '{
    "spreadType": "three_card",
    "question": "测试50/50分布"
  }'

# 关系十字牌阵
curl -X POST http://localhost:3000/api/reading \
  -H "Content-Type: application/json" \
  -d '{
    "spreadType": "relationship_cross",
    "question": "如何改善我的人际关系？"
  }'
```

## 📚 文档更新

- **RANDOMNESS.md**: 更新了50/50分布说明
- **README.md**: 更新了技术特性描述
- **SPREADS.md**: 完整的牌阵指南
- **CHANGELOG.md**: 本更新日志

## 🔮 质量保证

### 随机性质量标准

- **优秀级别 (90-100分)**: 完全符合50/50分布，统计偏差 < 5%
- **良好级别 (75-89分)**: 轻微偏差，可接受范围内
- **一般级别 (60-74分)**: 存在一些偏差，需要关注
- **差级别 (<60分)**: 显著偏差，需要调查

### 验证指标

1. **方向分布**: 正位/逆位比例接近50/50
2. **卡片分布**: Chi-square 检验确保均匀性
3. **性能指标**: 抽牌速度和算法效率
4. **熵值计算**: 真实随机性验证

## 🎉 总结

这次更新将塔罗牌方向分布从70/30调整为50/50，提供了：

- ✅ **完全公正的随机性**：每种方向概率相等
- ✅ **更好的统计特性**：便于验证和测试
- ✅ **现代化设计**：符合公平原则
- ✅ **保持专业品质**：加密级随机性不变
- ✅ **全面的验证工具**：确保质量可控

现在您的塔罗牌占卜系统提供了真正公正、统计学上可验证的随机性保证！🔮✨
