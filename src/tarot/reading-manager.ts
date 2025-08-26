import { TarotCardManager } from "./card-manager.js";
import { TarotSessionManager } from "./session-manager.js";
import { TarotReading, DrawnCard, CardOrientation, TarotCard } from "./types.js";
import { TAROT_SPREADS, getAllSpreads, getSpread, isValidSpreadType } from "./spreads.js";
import { getSecureRandom } from "./utils.js";

/**
 * Manages tarot readings and interpretations
 */
export class TarotReadingManager {
  private cardManager: TarotCardManager;
  private sessionManager: TarotSessionManager;

  constructor(cardManager: TarotCardManager, sessionManager: TarotSessionManager) {
    this.cardManager = cardManager;
    this.sessionManager = sessionManager;
  }

  /**
   * Perform a tarot reading
   */
  public performReading(spreadType: string, question: string, sessionId?: string): string {
    if (!isValidSpreadType(spreadType)) {
      return `无效的牌阵类型：${spreadType}。请使用 list_available_spreads 查看有效选项。`;
    }

    const spread = getSpread(spreadType)!;

    // Use cryptographically secure random card drawing
    const cards = this.cardManager.getRandomCards(spread.cardCount);

    // Generate random orientations for each card using secure randomness
    const drawnCards: DrawnCard[] = cards.map((card: any, index: number) => ({
      card,
      orientation: this.getSecureRandomOrientation(), // Cryptographically secure orientation
      position: spread.positions[index].name,
      positionMeaning: spread.positions[index].meaning
    }));

    // Create the reading
    const reading: TarotReading = {
      id: this.generateReadingId(),
      spreadType,
      question,
      cards: drawnCards,
      interpretation: this.generateInterpretation(drawnCards, question, spread.name),
      timestamp: new Date(),
      sessionId
    };

    // Add to session if provided
    if (sessionId) {
      this.sessionManager.addReadingToSession(sessionId, reading);
    }

    return this.formatReading(reading, spread.name, spread.description);
  }

  /**
   * List all available spreads
   */
  public listAvailableSpreads(): string {
    const spreads = getAllSpreads();
    
    let result = "# 可用的塔罗牌阵\n\n";
    
    spreads.forEach(spread => {
      result += `## ${spread.name} (${spread.cardCount} 张牌)\n\n`;
      result += `${spread.description}\n\n`;
      
      result += "**位置：**\n";
      spread.positions.forEach((position, index) => {
        result += `${index + 1}. **${position.name}**: ${position.meaning}\n`;
      });
      result += "\n";
    });

    result += "使用 `perform_reading` 工具和其中一种牌阵类型来获取占卜。";

    return result;
  }

  /**
   * Perform a custom tarot reading with user-defined spread
   */
  public performCustomReading(
    spreadName: string,
    description: string,
    positions: { name: string; meaning: string }[],
    question: string,
    sessionId?: string
  ): string {
    // Create a custom spread object
    const customSpread = {
      name: spreadName,
      description: description,
      positions: positions,
      cardCount: positions.length
    };

    // Use cryptographically secure random card drawing
    const cards = this.cardManager.getRandomCards(customSpread.cardCount);

    // Generate random orientations for each card using secure randomness
    const drawnCards: DrawnCard[] = cards.map((card: any, index: number) => ({
      card,
      orientation: this.getSecureRandomOrientation(), // Cryptographically secure orientation
      position: customSpread.positions[index].name,
      positionMeaning: customSpread.positions[index].meaning
    }));

    // Create the reading
    const reading: TarotReading = {
      id: this.generateReadingId(),
      spreadType: `custom_${spreadName.toLowerCase().replace(/\s+/g, '_')}`,
      question,
      cards: drawnCards,
      interpretation: this.generateInterpretation(drawnCards, question, customSpread.name),
      timestamp: new Date(),
      sessionId
    };

    // Add to session if provided
    if (sessionId) {
      this.sessionManager.addReadingToSession(sessionId, reading);
    }

    return this.formatReading(reading, customSpread.name, customSpread.description);
  }

  /**
   * Interpret a combination of cards
   */
  public interpretCardCombination(cards: Array<{name: string, orientation?: string}>, context: string): string {
    const drawnCards: DrawnCard[] = [];
    
    for (const cardInput of cards) {
      const card = this.cardManager.findCard(cardInput.name);
      if (!card) {
        return `未找到牌"${cardInput.name}"。请使用 list_all_cards 查看可用的牌。`;
      }
      
      drawnCards.push({
        card,
        orientation: (cardInput.orientation as CardOrientation) || "upright"
      });
    }

    let result = `# 牌组合解读\n\n`;
    result += `**背景：** ${context}\n\n`;
    
    result += `## 本次占卜中的牌\n\n`;
    drawnCards.forEach((drawnCard, index) => {
      result += `${index + 1}. **${drawnCard.card.name}** (${drawnCard.orientation === "upright" ? "正位" : "逆位"})\n`;
      const keywords = drawnCard.orientation === "upright" 
        ? drawnCard.card.keywords.upright 
        : drawnCard.card.keywords.reversed;
      result += `   *关键词: ${keywords.join("、")}*\n\n`;
    });

    result += `## 解读\n\n`;
    result += this.generateCombinationInterpretation(drawnCards, context);

    return result;
  }

  /**
   * Generate interpretation for a reading
   */
  private generateInterpretation(drawnCards: DrawnCard[], question: string, spreadName: string): string {
    let interpretation = `这个${spreadName}占卜回答你的问题："${question}"\n\n`;

    // Individual card interpretations with context
    drawnCards.forEach((drawnCard, index) => {
      const meanings = drawnCard.orientation === "upright"
        ? drawnCard.card.meanings.upright
        : drawnCard.card.meanings.reversed;

      interpretation += `**${drawnCard.position}**: ${drawnCard.card.name} (${drawnCard.orientation === "upright" ? "正位" : "逆位"})\n`;

      // Choose the most relevant meaning based on position
      const relevantMeaning = this.selectRelevantMeaning(meanings, drawnCard.position || "General", question);
      interpretation += `${relevantMeaning}\n\n`;
    });

    // Add spread-specific analysis
    const spreadNameLower = spreadName.toLowerCase();
    if (spreadNameLower.includes("celtic cross") || spreadNameLower.includes("凯尔特十字")) {
      interpretation += this.generateCelticCrossAnalysis(drawnCards);
    } else if (spreadNameLower.includes("three card") || spreadNameLower.includes("三张牌")) {
      interpretation += this.generateThreeCardAnalysis(drawnCards);
    } else if (spreadNameLower.includes("relationship") || spreadNameLower.includes("关系")) {
      interpretation += this.generateRelationshipAnalysis(drawnCards);
    } else if (spreadNameLower.includes("career") || spreadNameLower.includes("职业") || spreadNameLower.includes("事业")) {
      interpretation += this.generateCareerAnalysis(drawnCards);
    } else if (spreadNameLower.includes("spiritual") || spreadNameLower.includes("灵性")) {
      interpretation += this.generateSpiritualAnalysis(drawnCards);
    } else if (spreadNameLower.includes("chakra") || spreadNameLower.includes("脉轮")) {
      interpretation += this.generateChakraAnalysis(drawnCards);
    } else if (spreadNameLower.includes("year ahead") || spreadNameLower.includes("年度展望")) {
      interpretation += this.generateYearAheadAnalysis(drawnCards);
    } else if (spreadNameLower.includes("venus") || spreadNameLower.includes("love") || spreadNameLower.includes("金星") || spreadNameLower.includes("爱情")) {
      interpretation += this.generateVenusLoveAnalysis(drawnCards);
    } else if (spreadNameLower.includes("tree of life") || spreadNameLower.includes("生命之树")) {
      interpretation += this.generateTreeOfLifeAnalysis(drawnCards);
    } else if (spreadNameLower.includes("astrological") || spreadNameLower.includes("占星")) {
      interpretation += this.generateAstrologicalAnalysis(drawnCards);
    } else if (spreadNameLower.includes("mandala") || spreadNameLower.includes("曼陀罗")) {
      interpretation += this.generateMandalaAnalysis(drawnCards);
    } else if (spreadNameLower.includes("pentagram") || spreadNameLower.includes("五芒星")) {
      interpretation += this.generatePentagramAnalysis(drawnCards);
    } else if (spreadNameLower.includes("mirror of truth") || spreadNameLower.includes("真相之镜")) {
      interpretation += this.generateMirrorOfTruthAnalysis(drawnCards);
    }

    // Overall interpretation
    interpretation += this.generateOverallInterpretation(drawnCards, question);

    return interpretation;
  }

  /**
   * Select the most relevant meaning based on position and question
   */
  private selectRelevantMeaning(meanings: any, position: string, question: string): string {
    const questionLower = question.toLowerCase();
    const positionLower = position.toLowerCase();

    // Determine the most relevant aspect based on question content
    if (questionLower.includes("love") || questionLower.includes("relationship") || questionLower.includes("romance") || 
        questionLower.includes("爱情") || questionLower.includes("感情") || questionLower.includes("恋爱") || questionLower.includes("关系")) {
      return meanings.love;
    } else if (questionLower.includes("career") || questionLower.includes("job") || questionLower.includes("work") || questionLower.includes("money") ||
               questionLower.includes("职业") || questionLower.includes("工作") || questionLower.includes("事业") || questionLower.includes("金钱") || questionLower.includes("财富")) {
      return meanings.career;
    } else if (questionLower.includes("health") || questionLower.includes("wellness") || questionLower.includes("body") ||
               questionLower.includes("健康") || questionLower.includes("身体") || questionLower.includes("养生")) {
      return meanings.health;
    } else if (questionLower.includes("spiritual") || questionLower.includes("purpose") || questionLower.includes("meaning") ||
               questionLower.includes("灵性") || questionLower.includes("精神") || questionLower.includes("目的") || questionLower.includes("意义")) {
      return meanings.spirituality;
    }

    // Default to general meaning, but consider position context
    if (positionLower.includes("love") || positionLower.includes("relationship") || 
        positionLower.includes("爱情") || positionLower.includes("感情") || positionLower.includes("关系")) {
      return meanings.love;
    } else if (positionLower.includes("career") || positionLower.includes("work") ||
               positionLower.includes("职业") || positionLower.includes("工作") || positionLower.includes("事业")) {
      return meanings.career;
    }

    return meanings.general;
  }

  /**
   * Generate Celtic Cross specific analysis
   */
  private generateCelticCrossAnalysis(drawnCards: DrawnCard[]): string {
    if (drawnCards.length !== 10) return "";

    let analysis = "**Celtic Cross Analysis:**\n\n";

    // Analyze key relationships between positions
    const present = drawnCards[0];
    const challenge = drawnCards[1];
    const past = drawnCards[2];
    const future = drawnCards[3];
    const above = drawnCards[4];
    const below = drawnCards[5];
    const advice = drawnCards[6];
    const external = drawnCards[7];
    const hopesFearsCard = drawnCards[8];
    const outcome = drawnCards[9];

    // Above vs Below analysis
    analysis += `**Conscious vs Subconscious:** The ${above.card.name} above represents your conscious goals, while the ${below.card.name} below reveals your subconscious drives. `;
    if (above.orientation === below.orientation) {
      analysis += "These are aligned, suggesting harmony between your conscious desires and unconscious motivations. ";
    } else {
      analysis += "The different orientations suggest some tension between what you consciously want and what unconsciously drives you. ";
    }

    // Above vs Outcome analysis
    analysis += `**Goal vs Outcome:** Your conscious goal (${above.card.name}) `;
    if (this.cardsHaveSimilarEnergy(above, outcome)) {
      analysis += "aligns well with the likely outcome, suggesting you're on the right path. ";
    } else {
      analysis += "differs from the projected outcome, indicating you may need to adjust your approach. ";
    }

    // Future vs Outcome analysis
    analysis += `**Near Future Impact:** The ${future.card.name} in your near future will `;
    if (future.orientation === "upright") {
      analysis += "support your journey toward the final outcome. ";
    } else {
      analysis += "present challenges that need to be navigated carefully to reach your desired outcome. ";
    }

    analysis += "\n";
    return analysis;
  }

  /**
   * Generate Three Card specific analysis
   */
  private generateThreeCardAnalysis(drawnCards: DrawnCard[]): string {
    if (drawnCards.length !== 3) return "";

    let analysis = "**Three Card Flow Analysis:**\n\n";

    const [past, present, future] = drawnCards;

    analysis += `**The Journey:** From ${past.card.name} in the past, through ${present.card.name} in the present, to ${future.card.name} in the future, `;

    // Analyze the progression
    const pastEnergy = past.orientation === "upright" ? "positive" : "challenging";
    const presentEnergy = present.orientation === "upright" ? "positive" : "challenging";
    const futureEnergy = future.orientation === "upright" ? "positive" : "challenging";

    if (pastEnergy === "challenging" && presentEnergy === "positive" && futureEnergy === "positive") {
      analysis += "shows a clear progression from difficulty to resolution and success. ";
    } else if (pastEnergy === "positive" && presentEnergy === "challenging" && futureEnergy === "positive") {
      analysis += "indicates a temporary setback that will resolve positively. ";
    } else if (pastEnergy === "positive" && presentEnergy === "positive" && futureEnergy === "positive") {
      analysis += "reveals a consistently positive trajectory with continued growth. ";
    } else {
      analysis += "shows a complex journey requiring careful attention to the lessons each phase offers. ";
    }

    analysis += "\n";
    return analysis;
  }

  /**
   * Generate Relationship spread specific analysis
   */
  private generateRelationshipAnalysis(drawnCards: DrawnCard[]): string {
    if (drawnCards.length !== 7) return "";

    let analysis = "**Relationship Dynamics Analysis:**\n\n";

    const you = drawnCards[0];
    const partner = drawnCards[1];
    const relationship = drawnCards[2];
    const unites = drawnCards[3];
    const divides = drawnCards[4];

    // Analyze compatibility
    analysis += `**Compatibility Assessment:** `;
    if (you.orientation === partner.orientation) {
      analysis += "You and your partner are currently in similar emotional states, which can create harmony. ";
    } else {
      analysis += "You and your partner are in different emotional phases, which requires understanding and patience. ";
    }

    // Analyze relationship balance
    const positiveCards = [you, partner, relationship, unites].filter(c => c.orientation === "upright").length;
    if (positiveCards >= 3) {
      analysis += "The overall energy of the relationship is positive and supportive. ";
    } else {
      analysis += "The relationship may need attention and conscious effort to improve dynamics. ";
    }

    analysis += "\n";
    return analysis;
  }

  /**
   * Generate Career spread specific analysis
   */
  private generateCareerAnalysis(drawnCards: DrawnCard[]): string {
    if (drawnCards.length !== 6) return "";

    let analysis = "**Career Path Analysis:**\n\n";

    const current = drawnCards[0];
    const skills = drawnCards[1];
    const challenges = drawnCards[2];
    const opportunities = drawnCards[3];

    // Analyze career readiness
    analysis += `**Career Readiness:** `;
    if (skills.orientation === "upright" && opportunities.orientation === "upright") {
      analysis += "You have strong skills and good opportunities ahead. This is a favorable time for career advancement. ";
    } else if (challenges.orientation === "reversed") {
      analysis += "Previous obstacles are clearing, making way for new professional growth. ";
    } else {
      analysis += "Focus on developing your skills and overcoming current challenges before pursuing new opportunities. ";
    }

    analysis += "\n";
    return analysis;
  }

  /**
   * Generate Spiritual Guidance spread analysis
   */
  private generateSpiritualAnalysis(drawnCards: DrawnCard[]): string {
    if (drawnCards.length !== 6) return "";

    let analysis = "**Spiritual Development Analysis:**\n\n";

    const spiritualState = drawnCards[0];
    const lessons = drawnCards[1];
    const blocks = drawnCards[2];
    const gifts = drawnCards[3];

    // Analyze spiritual progress
    analysis += `**Spiritual Progress:** `;
    if (spiritualState.orientation === "upright") {
      analysis += "You are in a positive phase of spiritual growth and awareness. ";
    } else {
      analysis += "You may be experiencing spiritual challenges or confusion that require inner work. ";
    }

    if (blocks.orientation === "reversed") {
      analysis += "Previous spiritual blocks are dissolving, allowing for greater growth. ";
    }

    analysis += "\n";
    return analysis;
  }

  /**
   * Generate Chakra Alignment spread analysis
   */
  private generateChakraAnalysis(drawnCards: DrawnCard[]): string {
    if (drawnCards.length !== 7) return "";

    let analysis = "**Chakra Energy Analysis:**\n\n";

    const uprightChakras = drawnCards.filter(c => c.orientation === "upright").length;
    const balancePercentage = (uprightChakras / 7) * 100;

    analysis += `**Overall Energy Balance:** `;
    if (balancePercentage >= 70) {
      analysis += "Your chakras are well-balanced with strong energy flow. ";
    } else if (balancePercentage >= 50) {
      analysis += "Your energy centers have moderate balance with some areas needing attention. ";
    } else {
      analysis += "Several chakras need healing and rebalancing for optimal energy flow. ";
    }

    // Identify energy patterns
    const lowerChakras = drawnCards.slice(0, 3).filter(c => c.orientation === "upright").length;
    const upperChakras = drawnCards.slice(4, 7).filter(c => c.orientation === "upright").length;

    if (lowerChakras > upperChakras) {
      analysis += "Your grounding and physical energy centers are stronger than your spiritual centers. ";
    } else if (upperChakras > lowerChakras) {
      analysis += "Your spiritual and intuitive centers are more active than your grounding centers. ";
    }

    analysis += "\n";
    return analysis;
  }

  /**
   * Generate Year Ahead spread analysis
   */
  private generateYearAheadAnalysis(drawnCards: DrawnCard[]): string {
    if (drawnCards.length !== 13) return "";

    let analysis = "**Year Ahead Overview:**\n\n";

    const overallTheme = drawnCards[0];
    const monthlyCards = drawnCards.slice(1);

    // Analyze overall year energy
    analysis += `**Year Theme:** The ${overallTheme.card.name} sets the tone for your year, `;
    if (overallTheme.orientation === "upright") {
      analysis += "indicating a positive and growth-oriented period ahead. ";
    } else {
      analysis += "suggesting a year of inner work and overcoming challenges. ";
    }

    // Analyze seasonal patterns
    const quarters = [
      monthlyCards.slice(0, 3), // Q1: Jan-Mar
      monthlyCards.slice(3, 6), // Q2: Apr-Jun
      monthlyCards.slice(6, 9), // Q3: Jul-Sep
      monthlyCards.slice(9, 12) // Q4: Oct-Dec
    ];

    quarters.forEach((quarter, index) => {
      const uprightCount = quarter.filter(c => c.orientation === "upright").length;
      const quarterNames = ["First Quarter", "Second Quarter", "Third Quarter", "Fourth Quarter"];

      analysis += `**${quarterNames[index]}:** `;
      if (uprightCount >= 2) {
        analysis += "A positive and productive period. ";
      } else {
        analysis += "A time for patience and inner work. ";
      }
    });

    analysis += "\n";
    return analysis;
  }

  /**
   * Generate Venus Love spread analysis
   */
  private generateVenusLoveAnalysis(drawnCards: DrawnCard[]): string {
    if (drawnCards.length !== 7) return "";

    let analysis = "**Venus Love Energy Analysis:**\n\n";

    const [currentEnergy, selfLove, attraction, blocks, enhancement, desires, future] = drawnCards;

    // Analyze love energy flow
    analysis += `**Love Energy Flow:** Your current relationship energy (${currentEnergy.card.name}) `;
    if (currentEnergy.orientation === "upright") {
      analysis += "shows positive romantic vibrations and openness to love. ";
    } else {
      analysis += "suggests some healing or inner work is needed before fully opening to love. ";
    }

    // Self-love foundation
    analysis += `Your self-love foundation (${selfLove.card.name}) `;
    if (selfLove.orientation === "upright") {
      analysis += "indicates healthy self-worth that attracts genuine love. ";
    } else {
      analysis += "reveals areas where self-compassion and self-acceptance need attention. ";
    }

    // Attraction and blocks
    analysis += `What attracts love to you (${attraction.card.name}) works in harmony with `;
    analysis += `overcoming blocks (${blocks.card.name}) to create a path forward. `;

    // Future potential
    analysis += `The future potential (${future.card.name}) `;
    if (future.orientation === "upright") {
      analysis += "promises beautiful developments in your love life. ";
    } else {
      analysis += "suggests patience and continued inner work will lead to love. ";
    }

    analysis += "\n";
    return analysis;
  }

  /**
   * Generate Tree of Life spread analysis
   */
  private generateTreeOfLifeAnalysis(drawnCards: DrawnCard[]): string {
    if (drawnCards.length !== 10) return "";

    let analysis = "**Tree of Life Spiritual Analysis:**\n\n";

    const [kether, chokmah, binah, chesed, geburah, tiphareth, netzach, hod, yesod, malkuth] = drawnCards;

    // Analyze the three pillars
    const leftPillar = [binah, geburah, hod]; // Severity
    const rightPillar = [chokmah, chesed, netzach]; // Mercy
    const middlePillar = [kether, tiphareth, yesod, malkuth]; // Balance

    // Pillar analysis
    const leftUprightCount = leftPillar.filter(c => c.orientation === "upright").length;
    const rightUprightCount = rightPillar.filter(c => c.orientation === "upright").length;
    const middleUprightCount = middlePillar.filter(c => c.orientation === "upright").length;

    analysis += `**Pillar Balance:** `;
    if (rightUprightCount > leftUprightCount) {
      analysis += "The Pillar of Mercy dominates, indicating expansion, growth, and positive energy. ";
    } else if (leftUprightCount > rightUprightCount) {
      analysis += "The Pillar of Severity is prominent, suggesting discipline, boundaries, and necessary restrictions. ";
    } else {
      analysis += "The pillars are balanced, showing harmony between expansion and contraction. ";
    }

    // Crown to Kingdom flow
    analysis += `**Divine Flow:** From Kether (${kether.card.name}) to Malkuth (${malkuth.card.name}), `;
    if (kether.orientation === malkuth.orientation) {
      analysis += "there's alignment between your highest purpose and material manifestation. ";
    } else {
      analysis += "there's a need to bridge the gap between spiritual ideals and earthly reality. ";
    }

    analysis += "\n";
    return analysis;
  }

  /**
   * Generate Astrological Houses spread analysis
   */
  private generateAstrologicalAnalysis(drawnCards: DrawnCard[]): string {
    if (drawnCards.length !== 12) return "";

    let analysis = "**Astrological Houses Analysis:**\n\n";

    // Group houses by element
    const fireHouses = [drawnCards[0], drawnCards[4], drawnCards[8]]; // 1st, 5th, 9th
    const earthHouses = [drawnCards[1], drawnCards[5], drawnCards[9]]; // 2nd, 6th, 10th
    const airHouses = [drawnCards[2], drawnCards[6], drawnCards[10]]; // 3rd, 7th, 11th
    const waterHouses = [drawnCards[3], drawnCards[7], drawnCards[11]]; // 4th, 8th, 12th

    // Analyze elemental balance
    const fireUpright = fireHouses.filter(c => c.orientation === "upright").length;
    const earthUpright = earthHouses.filter(c => c.orientation === "upright").length;
    const airUpright = airHouses.filter(c => c.orientation === "upright").length;
    const waterUpright = waterHouses.filter(c => c.orientation === "upright").length;

    analysis += `**Elemental Balance:** `;
    const elements = [
      { name: "Fire (Identity/Creativity/Philosophy)", count: fireUpright },
      { name: "Earth (Resources/Work/Career)", count: earthUpright },
      { name: "Air (Communication/Partnerships/Community)", count: airUpright },
      { name: "Water (Home/Transformation/Spirituality)", count: waterUpright }
    ];

    const strongestElement = elements.reduce((max, current) =>
      current.count > max.count ? current : max
    );

    analysis += `${strongestElement.name} energy is strongest in your chart, `;
    analysis += `indicating focus in these life areas. `;

    // Angular houses analysis (1st, 4th, 7th, 10th)
    const angularHouses = [drawnCards[0], drawnCards[3], drawnCards[6], drawnCards[9]];
    const angularUpright = angularHouses.filter(c => c.orientation === "upright").length;

    analysis += `**Life Direction:** With ${angularUpright} out of 4 angular houses upright, `;
    if (angularUpright >= 3) {
      analysis += "you have strong momentum and clear direction in major life areas. ";
    } else if (angularUpright >= 2) {
      analysis += "you have moderate stability with some areas needing attention. ";
    } else {
      analysis += "focus on building stronger foundations in key life areas. ";
    }

    analysis += "\n";
    return analysis;
  }

  /**
   * Generate Mandala spread analysis
   */
  private generateMandalaAnalysis(drawnCards: DrawnCard[]): string {
    if (drawnCards.length !== 9) return "";

    let analysis = "**Mandala Wholeness Analysis:**\n\n";

    const [center, north, northeast, east, southeast, south, southwest, west, northwest] = drawnCards;

    // Analyze center in relation to outer cards
    analysis += `**Core Integration:** Your center (${center.card.name}) `;
    if (center.orientation === "upright") {
      analysis += "shows a strong, balanced core that can integrate the surrounding energies. ";
    } else {
      analysis += "suggests the need for inner healing before achieving wholeness. ";
    }

    // Analyze directional balance
    const directions = [north, northeast, east, southeast, south, southwest, west, northwest];
    const uprightDirections = directions.filter(c => c.orientation === "upright").length;

    analysis += `**Directional Balance:** With ${uprightDirections} out of 8 directions upright, `;
    if (uprightDirections >= 6) {
      analysis += "your life energies are well-balanced and flowing harmoniously. ";
    } else if (uprightDirections >= 4) {
      analysis += "you have good balance with some areas needing attention. ";
    } else {
      analysis += "focus on healing and balancing multiple life areas. ";
    }

    // Opposite directions analysis
    const opposites = [
      [north, south], [east, west], [northeast, southwest], [southeast, northwest]
    ];

    let balancedPairs = 0;
    opposites.forEach(([dir1, dir2]) => {
      if (dir1.orientation === dir2.orientation) {
        balancedPairs++;
      }
    });

    analysis += `**Polarity Integration:** ${balancedPairs} out of 4 opposite pairs are balanced, `;
    if (balancedPairs >= 3) {
      analysis += "showing excellent integration of opposing forces. ";
    } else {
      analysis += "indicating opportunities to harmonize conflicting energies. ";
    }

    analysis += "\n";
    return analysis;
  }

  /**
   * Generate Pentagram spread analysis
   */
  private generatePentagramAnalysis(drawnCards: DrawnCard[]): string {
    if (drawnCards.length !== 5) return "";

    let analysis = "**Pentagram Elemental Analysis:**\n\n";

    const [spirit, air, fire, earth, water] = drawnCards;

    // Analyze elemental balance
    const elements = [air, fire, earth, water];
    const uprightElements = elements.filter(c => c.orientation === "upright").length;

    analysis += `**Elemental Harmony:** With ${uprightElements} out of 4 elements upright, `;
    if (uprightElements === 4) {
      analysis += "all elements are in perfect harmony, creating powerful manifestation energy. ";
    } else if (uprightElements >= 3) {
      analysis += "strong elemental balance with minor adjustments needed. ";
    } else if (uprightElements >= 2) {
      analysis += "moderate balance requiring attention to weaker elements. ";
    } else {
      analysis += "significant elemental imbalance requiring healing and rebalancing. ";
    }

    // Spirit connection analysis
    analysis += `**Divine Connection:** Spirit (${spirit.card.name}) `;
    if (spirit.orientation === "upright") {
      analysis += "shows strong divine connection guiding your elemental balance. ";
    } else {
      analysis += "suggests the need to strengthen your spiritual foundation. ";
    }

    // Element-specific insights
    analysis += `**Elemental Flow:** `;
    if (air.orientation === "upright") analysis += "Clear thinking and communication support your goals. ";
    if (fire.orientation === "upright") analysis += "Passionate energy drives your actions. ";
    if (earth.orientation === "upright") analysis += "Practical foundations support manifestation. ";
    if (water.orientation === "upright") analysis += "Emotional wisdom guides your intuition. ";

    analysis += "\n";
    return analysis;
  }

  /**
   * Generate Mirror of Truth spread analysis
   */
  private generateMirrorOfTruthAnalysis(drawnCards: DrawnCard[]): string {
    if (drawnCards.length !== 4) return "";

    let analysis = "**Mirror of Truth - Four Beams of Light Analysis:**\n\n";
    const [yourPerspective, theirIntention, objectiveTruth, futureGuidance] = drawnCards;

    // First Light Analysis - Your Perspective
    analysis += `**First Light - Illuminate Yourself:** ${yourPerspective.card.name} (${yourPerspective.orientation})\n`;
    analysis += `Your current emotional state and inner filters show: `;
    if (yourPerspective.orientation === "upright") {
      analysis += "Your perception of the situation is relatively clear, your emotional state is stable, and you can view the problem objectively.";
    }
    else {
      analysis += "Your perspective may be influenced by strong emotions, anxiety, or expectations, requiring inner calm to see the truth clearly.";
    }
    analysis += "\n\n";

    // Second Light Analysis - Their Intention
    analysis += `**Second Light - Explore Their Heart:** ${theirIntention.card.name} (${theirIntention.orientation})\n`;
    analysis += `Their true intentions and inner state indicate: `;
    if (theirIntention.orientation === "upright") {
      analysis += "Their motivations are relatively positive and sincere, with good intentions or at least neutral intent behind their actions.";
    }
    else {
      analysis += "They may have complex inner states, their true intentions might not align with surface behavior, or they themselves are confused.";
    }
    analysis += "\n\n";

    // Third Light Analysis - Objective Truth
    analysis += `**Third Light - Restore Original Truth:** ${objectiveTruth.card.name} (${objectiveTruth.orientation})\n`;
    analysis += `Stripping away all subjective emotions, the truth is: `;
    if (objectiveTruth.orientation === "upright") {
      analysis += "The situation itself is relatively simple and clear, you and the other person may have over-interpreted it. The facts are more direct than imagined.";
    }
    else {
      analysis += "The situation does have complexity and hidden layers, requiring more time and information to fully understand.";
    }
    analysis += "\n\n";

    // Fourth Light Analysis - Future Guidance
    analysis += `**Fourth Light - Guide Future Direction:** ${futureGuidance.card.name} (${futureGuidance.orientation})\n`;
    analysis += `Based on understanding the truth, you should: `;
    if (futureGuidance.orientation === "upright") {
      analysis += "Take positive and proactive action, now is a good time to clarify misunderstandings, improve relationships, or make decisions.";
    }
    else {
      analysis += "Maintain patience and observation, don't rush into action, let time and more information reveal the best path forward.";
    }
    analysis += "\n\n";

    // Comprehensive Analysis of Four Lights
    analysis += `**Comprehensive Insights from Four Lights:**\n`;
    const uprightCount = drawnCards.filter(c => c.orientation === "upright").length;

    // Analyze relationship between your perspective and their intention
    if (yourPerspective.orientation === theirIntention.orientation) {
      analysis += `Your perception and their intention are in similar energy states, indicating some synchronicity between you. `;
    }
    else {
      analysis += `Your perception and their intention have energy differences, which may be the source of misunderstanding. `;
    }

    // Analyze relationship between objective truth and guidance
    if (objectiveTruth.orientation === futureGuidance.orientation) {
      analysis += `The nature of the facts aligns with future guidance, indicating you can trust this direction. `;
    }
    else {
      analysis += `The complexity of the facts requires flexibility and openness in your actions. `;
    }

    // Overall clarity assessment
    analysis += `\n\n**Clarity of Truth:** ${uprightCount} out of 4 lights shine clearly, `;
    if (uprightCount === 4) {
      analysis += "all dimensions are clear, this is a moment of complete truth where decisive action can be taken.";
    }
    else if (uprightCount === 3) {
      analysis += "most of the truth has been revealed, requiring only patience and understanding in one dimension.";
    }
    else if (uprightCount === 2) {
      analysis += "truth is gradually emerging, requiring balance of information from different dimensions to make judgments.";
    }
    else if (uprightCount === 1) {
      analysis += "currently only one dimension is relatively clear, more time is needed for other truths to surface.";
    }
    else {
      analysis += "all dimensions are still in fog, this is a period requiring great patience and inner calm.";
    }

    analysis += "\n";
    return analysis;
  }

  /**
   * Check if two cards have similar energy
   */
  private cardsHaveSimilarEnergy(card1: DrawnCard, card2: DrawnCard): boolean {
    // Simple heuristic: same orientation and similar themes
    if (card1.orientation !== card2.orientation) return false;

    // Check for similar suits or arcana
    if (card1.card.suit && card2.card.suit && card1.card.suit === card2.card.suit) return true;
    if (card1.card.arcana === card2.card.arcana) return true;

    return false;
  }

  /**
   * Generate overall interpretation considering card interactions
   */
  private generateOverallInterpretation(drawnCards: DrawnCard[], question: string): string {
    let overall = "**整体解读：**\n\n";

    // Analyze the energy of the reading
    const uprightCount = drawnCards.filter(c => c.orientation === "upright").length;
    const reversedCount = drawnCards.filter(c => c.orientation === "reversed").length;
    const majorArcanaCount = drawnCards.filter(c => c.card.arcana === "major").length;
    const totalCards = drawnCards.length;

    // Major Arcana influence analysis
    if (majorArcanaCount > totalCards / 2) {
      overall += "这次占卜受到大阿卡纳牌的强烈影响，表明重要的灵性力量、人生课题和业力影响正在发挥作用。宇宙正在引导你经历重要的转变。";
    } else if (majorArcanaCount === 0) {
      overall += "这次占卜只包含小阿卡纳牌，表明情况主要在你的掌控之中，与日常事务和实际关切相关。";
    } else {
      overall += "大阿卡纳和小阿卡纳牌的平衡表明需要将灵性指导与实际行动相结合。";
    }

    // Orientation analysis
    const uprightPercentage = (uprightCount / totalCards) * 100;
    if (uprightPercentage >= 80) {
      overall += "正位牌的主导地位表明积极的能量、清晰的方向和有利的环境。你与事件的自然流动保持一致。";
    } else if (uprightPercentage >= 60) {
      overall += "大多数牌都是正位，表明总体上是积极的能量，但有些领域需要关注或内在工作。";
    } else if (uprightPercentage >= 40) {
      overall += "正位和逆位牌的平衡表明这是一个复杂的情况，既有机会也有挑战。";
    } else if (uprightPercentage >= 20) {
      overall += "大多数逆位牌表明内在阻碍、延迟，或需要进行重要的内省和内在工作。";
    } else {
      overall += "逆位牌的主导地位表明这是一个深度内在转变、灵性危机或重大障碍的时期，需要耐心和自我反思。";
    }

    // Add specific guidance based on card combinations and spread type
    overall += this.generateAdvancedCombinationInterpretation(drawnCards, question);

    return overall;
  }

  /**
   * Generate advanced interpretation for card combinations
   */
  private generateAdvancedCombinationInterpretation(drawnCards: DrawnCard[], context: string): string {
    let interpretation = "";

    // Elemental analysis
    const elementCounts = this.analyzeElements(drawnCards);
    interpretation += this.interpretElementalBalance(elementCounts);

    // Suit analysis for Minor Arcana
    const suitAnalysis = this.analyzeSuits(drawnCards);
    interpretation += suitAnalysis;

    // Numerical patterns
    const numericalAnalysis = this.analyzeNumericalPatterns(drawnCards);
    interpretation += numericalAnalysis;

    // Court card analysis
    const courtCardAnalysis = this.analyzeCourtCards(drawnCards);
    interpretation += courtCardAnalysis;

    // Archetypal patterns in Major Arcana
    const archetypeAnalysis = this.analyzeMajorArcanaPatterns(drawnCards);
    interpretation += archetypeAnalysis;

    interpretation += "\n\n在反思这些洞察以及它们如何适用于你的具体情况时，请相信你的直觉。";

    return interpretation;
  }

  /**
   * Analyze elemental balance in the reading
   */
  private analyzeElements(drawnCards: DrawnCard[]): Record<string, number> {
    const elementCounts = { fire: 0, water: 0, air: 0, earth: 0 };

    drawnCards.forEach(drawnCard => {
      if (drawnCard.card.element) {
        elementCounts[drawnCard.card.element]++;
      }
    });

    return elementCounts;
  }

  /**
   * Interpret elemental balance
   */
  private interpretElementalBalance(elementCounts: Record<string, number>): string {
    const total = Object.values(elementCounts).reduce((a, b) => a + b, 0);
    if (total === 0) return "";

    let interpretation = "";
    const dominantElement = Object.entries(elementCounts)
      .sort(([,a], [,b]) => b - a)[0];

    if (dominantElement[1] > total / 2) {
      switch (dominantElement[0]) {
        case "fire":
          interpretation += "火元素的主导地位表明这是一个需要行动、创造力和热情追求目标的时期。";
          break;
        case "water":
          interpretation += "水元素的盛行表明这种情况深具情感性和直觉性，需要你相信自己的感受。";
          break;
        case "air":
          interpretation += "风元素的丰富表明这主要是一个心理问题，需要清晰的思考、沟通和理性的方法。";
          break;
        case "earth":
          interpretation += "土元素的强势表明这种情况需要实际行动、耐心和对物质关切的关注。";
          break;
      }
    }

    // Check for missing elements
    const missingElements = Object.entries(elementCounts)
      .filter(([, count]) => count === 0)
      .map(([element]) => element);

    if (missingElements.length > 0) {
      interpretation += `缺乏${missingElements.join("和")}元素能量表明你可能需要培养这些品质来实现平衡。`;
    }

    return interpretation;
  }

  /**
   * Analyze suit patterns
   */
  private analyzeSuits(drawnCards: DrawnCard[]): string {
    const suits = drawnCards
      .filter(c => c.card.suit)
      .map(c => c.card.suit!);

    const suitCounts = suits.reduce((acc, suit) => {
      acc[suit] = (acc[suit] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);

    const dominantSuit = Object.entries(suitCounts)
      .sort(([,a], [,b]) => b - a)[0];

    if (!dominantSuit || dominantSuit[1] <= 1) return "";

    let interpretation = "";
    switch (dominantSuit[0]) {
      case "wands":
        interpretation += "多张权杖牌表明这种情况涉及创意项目、事业雄心和需要果断行动。";
        break;
      case "cups":
        interpretation += "多张圣杯牌的出现表明这根本上关于情感、关系和精神事务。";
        break;
      case "swords":
        interpretation += "宝剑牌的主导地位揭示了这种情况涉及心理挑战、冲突和需要清晰沟通。";
        break;
      case "pentacles":
        interpretation += "多张星币牌强调物质关切、财务事务和需要实际、脚踏实地的行动。";
        break;
    }

    return interpretation;
  }

  /**
   * Analyze numerical patterns in the reading
   */
  private analyzeNumericalPatterns(drawnCards: DrawnCard[]): string {
    const numbers = drawnCards
      .filter(c => c.card.number !== undefined)
      .map(c => c.card.number!);

    if (numbers.length < 2) return "";

    let interpretation = "";
    const avgNumber = numbers.reduce((a, b) => a + b, 0) / numbers.length;

    // Analyze the journey stage
    if (avgNumber <= 3) {
      interpretation += "低数字牌表明这种情况处于初始阶段，充满潜力和新能量。";
    } else if (avgNumber <= 6) {
      interpretation += "中等数字表明这种情况处于发展阶段，需要稳步进展和耐心。";
    } else if (avgNumber <= 9) {
      interpretation += "较高的数字表明这种情况正在接近完成或掌握，需要最后的努力。";
    } else {
      interpretation += "高数字和宫廷牌的出现表明掌握、完成或重要人物的参与。";
    }

    // Look for repeated numbers
    const numberCounts = numbers.reduce((acc, num) => {
      acc[num] = (acc[num] || 0) + 1;
      return acc;
    }, {} as Record<number, number>);

    const repeatedNumbers = Object.entries(numberCounts)
      .filter(([, count]) => count > 1)
      .map(([num]) => parseInt(num));

    if (repeatedNumbers.length > 0) {
      interpretation += `数字${repeatedNumbers.join("和")}的重复强调了以下主题：`;
      repeatedNumbers.forEach(num => {
        switch (num) {
          case 1: interpretation += "新开始和潜力，"; break;
          case 2: interpretation += "平衡和伙伴关系，"; break;
          case 3: interpretation += "创造力和成长，"; break;
          case 4: interpretation += "稳定和基础，"; break;
          case 5: interpretation += "变化和挑战，"; break;
          case 6: interpretation += "和谐和责任，"; break;
          case 7: interpretation += "精神发展和内省，"; break;
          case 8: interpretation += "物质掌握和成就，"; break;
          case 9: interpretation += "完成和智慧，"; break;
          case 10: interpretation += "满足和新循环，"; break;
        }
      });
      interpretation = interpretation.slice(0, -1) + "。";
    }

    return interpretation;
  }

  /**
   * Analyze court cards in the reading
   */
  private analyzeCourtCards(drawnCards: DrawnCard[]): string {
    const courtCards = drawnCards.filter(c =>
      c.card.name.includes("Page") ||
      c.card.name.includes("Knight") ||
      c.card.name.includes("Queen") ||
      c.card.name.includes("King")
    );

    if (courtCards.length === 0) return "";

    let interpretation = "";
    if (courtCards.length === 1) {
      interpretation += "宫廷牌的出现表明特定的人或人格方面对这种情况很重要。";
    } else {
      interpretation += `${courtCards.length}张宫廷牌表明多个人或人格方面正在影响这种情况。`;
    }

    return interpretation;
  }

  /**
   * Analyze Major Arcana patterns and archetypal themes
   */
  private analyzeMajorArcanaPatterns(drawnCards: DrawnCard[]): string {
    const majorCards = drawnCards.filter(c => c.card.arcana === "major");
    if (majorCards.length === 0) return "";

    let interpretation = "";

    // Analyze the Fool's Journey progression
    const majorNumbers = majorCards
      .map(c => c.card.number!)
      .sort((a, b) => a - b);

    if (majorNumbers.length > 1) {
      const span = majorNumbers[majorNumbers.length - 1] - majorNumbers[0];
      if (span > 10) {
        interpretation += "大阿卡纳牌的广泛跨度表明你正在经历一个重大的生命转变，触及你精神旅程的许多方面。";
      } else if (span < 5) {
        interpretation += "大阿卡纳牌的紧密分组表明你正在经历精神发展的特定阶段。";
      }
    }

    // Look for specific archetypal themes
    const cardNames = majorCards.map(c => c.card.name.toLowerCase());

    if (cardNames.includes("the fool") && cardNames.includes("the magician")) {
      interpretation += "愚者和魔术师的同时出现表明新开始和实现愿望能力的强大结合。";
    }

    if (cardNames.includes("the high priestess") && cardNames.includes("the hierophant")) {
      interpretation += "女祭司和教皇一起出现表明内在智慧和传统教导之间的平衡。";
    }

    return interpretation;
  }

  /**
   * Generate interpretation for card combinations (legacy method for compatibility)
   */
  private generateCombinationInterpretation(drawnCards: DrawnCard[], context: string): string {
    return this.generateAdvancedCombinationInterpretation(drawnCards, context);
  }

  /**
   * Format a reading for display
   */
  private formatReading(reading: TarotReading, spreadName: string, spreadDescription: string): string {
    let result = `# ${spreadName} Reading\n\n`;
    result += `**Question:** ${reading.question}\n`;
    result += `**Date:** ${reading.timestamp.toLocaleString()}\n`;
    result += `**Reading ID:** ${reading.id}\n\n`;
    
    result += `*${spreadDescription}*\n\n`;
    
    result += `## Your Cards\n\n`;
    reading.cards.forEach((drawnCard, index) => {
      result += `### ${index + 1}. ${drawnCard.position}\n`;
      if (drawnCard.positionMeaning) {
        result += `*${drawnCard.positionMeaning}*\n\n`;
      }
      result += `**${drawnCard.card.name}** (${drawnCard.orientation})\n\n`;
      
      const keywords = drawnCard.orientation === "upright" 
        ? drawnCard.card.keywords.upright 
        : drawnCard.card.keywords.reversed;
      result += `*Keywords: ${keywords.join(", ")}*\n\n`;
    });

    result += `## Interpretation\n\n`;
    result += reading.interpretation;

    return result;
  }

  /**
   * Get a specific spread by type
   */
  public getSpreadByType(spreadType: string): any {
    return getSpread(spreadType);
  }

  /**
   * Generate cryptographically secure random orientation
   */
  private getSecureRandomOrientation(): CardOrientation {
    // Use the same secure random method as card manager
    const random = getSecureRandom();
    return random < 0.5 ? "upright" : "reversed"; // 50% chance upright, 50% reversed
  }


  /**
   * Generate a unique reading ID with secure randomness
   */
  private generateReadingId(): string {
    const timestamp = Date.now();
    const randomPart = Math.floor(getSecureRandom() * 1000000000).toString(36);
    return `reading_${timestamp}_${randomPart}`;
  }
}
