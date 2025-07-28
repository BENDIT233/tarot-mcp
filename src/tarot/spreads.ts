import { TarotSpread } from "./types.js";

/**
 * Tarot spread definitions
 */
export const TAROT_SPREADS: Record<string, TarotSpread> = {
  single_card: {
    name: "Single Card",
    description: "A simple one-card draw for quick insight or daily guidance",
    cardCount: 1,
    positions: [
      {
        name: "The Message",
        meaning: "The main insight, guidance, or energy for your question"
      }
    ]
  },

  three_card: {
    name: "Three Card Spread",
    description: "A versatile three-card spread that can represent past/present/future, situation/action/outcome, or mind/body/spirit",
    cardCount: 3,
    positions: [
      {
        name: "Past/Situation",
        meaning: "What has led to this situation or the foundation of the matter"
      },
      {
        name: "Present/Action",
        meaning: "The current state or what action should be taken"
      },
      {
        name: "Future/Outcome",
        meaning: "The likely outcome or future development"
      }
    ]
  },

  celtic_cross: {
    name: "Celtic Cross",
    description: "The most famous tarot spread, providing comprehensive insight into a situation with 10 cards",
    cardCount: 10,
    positions: [
      {
        name: "Present Situation",
        meaning: "The heart of the matter, your current situation or state of mind"
      },
      {
        name: "Challenge/Cross",
        meaning: "The challenge you face or what crosses you in this situation"
      },
      {
        name: "Distant Past/Foundation",
        meaning: "The foundation of the situation, distant past influences"
      },
      {
        name: "Recent Past",
        meaning: "Recent events or influences that are now passing away"
      },
      {
        name: "Possible Outcome",
        meaning: "One possible outcome if things continue as they are"
      },
      {
        name: "Near Future",
        meaning: "What is approaching in the immediate future"
      },
      {
        name: "Your Approach",
        meaning: "Your approach to the situation, how you see yourself"
      },
      {
        name: "External Influences",
        meaning: "How others see you or external influences affecting the situation"
      },
      {
        name: "Hopes and Fears",
        meaning: "Your inner feelings, hopes, and fears about the situation"
      },
      {
        name: "Final Outcome",
        meaning: "The final outcome, the culmination of all influences"
      }
    ]
  },

  horseshoe: {
    name: "Horseshoe Spread",
    description: "A 7-card spread that provides guidance on a specific situation, showing past influences, present circumstances, and future possibilities",
    cardCount: 7,
    positions: [
      {
        name: "Past Influences",
        meaning: "Past events and influences that have led to the current situation"
      },
      {
        name: "Present Situation",
        meaning: "Your current circumstances and state of mind"
      },
      {
        name: "Hidden Influences",
        meaning: "Hidden factors or subconscious influences affecting the situation"
      },
      {
        name: "Obstacles",
        meaning: "Challenges or obstacles you may face"
      },
      {
        name: "External Influences",
        meaning: "Outside influences, other people's attitudes, or environmental factors"
      },
      {
        name: "Advice",
        meaning: "What you should do or the best approach to take"
      },
      {
        name: "Likely Outcome",
        meaning: "The most probable outcome if you follow the advice given"
      }
    ]
  },

  relationship_cross: {
    name: "Relationship Cross",
    description: "A 7-card spread specifically designed for examining relationships, whether romantic, friendship, or family",
    cardCount: 7,
    positions: [
      {
        name: "You",
        meaning: "Your role, feelings, and contribution to the relationship"
      },
      {
        name: "Your Partner",
        meaning: "Their role, feelings, and contribution to the relationship"
      },
      {
        name: "The Relationship",
        meaning: "The current state and dynamic of the relationship itself"
      },
      {
        name: "What Unites You",
        meaning: "Common ground, shared values, and what brings you together"
      },
      {
        name: "What Divides You",
        meaning: "Differences, conflicts, and what creates tension"
      },
      {
        name: "Advice",
        meaning: "Guidance for improving and nurturing the relationship"
      },
      {
        name: "Future Potential",
        meaning: "Where the relationship is heading and its potential outcome"
      }
    ]
  },

  career_path: {
    name: "Career Path Spread",
    description: "A 6-card spread for career guidance, exploring your professional journey and opportunities",
    cardCount: 6,
    positions: [
      {
        name: "Current Career Situation",
        meaning: "Your present professional circumstances and feelings about work"
      },
      {
        name: "Your Skills and Talents",
        meaning: "Your natural abilities and developed skills that serve your career"
      },
      {
        name: "Career Challenges",
        meaning: "Obstacles or difficulties you face in your professional life"
      },
      {
        name: "Hidden Opportunities",
        meaning: "Unseen possibilities or potential career paths to explore"
      },
      {
        name: "Action to Take",
        meaning: "Specific steps or approaches to advance your career"
      },
      {
        name: "Career Outcome",
        meaning: "The likely result of following the guidance provided"
      }
    ]
  },

  decision_making: {
    name: "Decision Making Spread",
    description: "A 5-card spread to help you make important decisions by examining all aspects of your choices",
    cardCount: 5,
    positions: [
      {
        name: "The Situation",
        meaning: "The current circumstances requiring a decision"
      },
      {
        name: "Option A",
        meaning: "The first choice and its potential consequences"
      },
      {
        name: "Option B",
        meaning: "The second choice and its potential consequences"
      },
      {
        name: "What You Need to Know",
        meaning: "Hidden factors or important information to consider"
      },
      {
        name: "Recommended Path",
        meaning: "The best course of action based on all factors"
      }
    ]
  },

  spiritual_guidance: {
    name: "Spiritual Guidance Spread",
    description: "A 6-card spread for spiritual development and connecting with your higher self",
    cardCount: 6,
    positions: [
      {
        name: "Your Spiritual State",
        meaning: "Your current spiritual condition and level of awareness"
      },
      {
        name: "Spiritual Lessons",
        meaning: "What the universe is trying to teach you right now"
      },
      {
        name: "Blocks to Growth",
        meaning: "What is hindering your spiritual development"
      },
      {
        name: "Spiritual Gifts",
        meaning: "Your natural spiritual abilities and intuitive talents"
      },
      {
        name: "Guidance from Above",
        meaning: "Messages from your higher self or spiritual guides"
      },
      {
        name: "Next Steps",
        meaning: "How to advance on your spiritual journey"
      }
    ]
  },

  year_ahead: {
    name: "Year Ahead Spread",
    description: "A 13-card spread providing insights for the coming year, with one card for each month plus an overall theme",
    cardCount: 13,
    positions: [
      {
        name: "Overall Theme",
        meaning: "The main theme and energy for the entire year"
      },
      {
        name: "January",
        meaning: "What to expect and focus on in January"
      },
      {
        name: "February",
        meaning: "What to expect and focus on in February"
      },
      {
        name: "March",
        meaning: "What to expect and focus on in March"
      },
      {
        name: "April",
        meaning: "What to expect and focus on in April"
      },
      {
        name: "May",
        meaning: "What to expect and focus on in May"
      },
      {
        name: "June",
        meaning: "What to expect and focus on in June"
      },
      {
        name: "July",
        meaning: "What to expect and focus on in July"
      },
      {
        name: "August",
        meaning: "What to expect and focus on in August"
      },
      {
        name: "September",
        meaning: "What to expect and focus on in September"
      },
      {
        name: "October",
        meaning: "What to expect and focus on in October"
      },
      {
        name: "November",
        meaning: "What to expect and focus on in November"
      },
      {
        name: "December",
        meaning: "What to expect and focus on in December"
      }
    ]
  },

  chakra_alignment: {
    name: "Chakra Alignment Spread",
    description: "A 7-card spread examining the energy centers of your body for healing and balance",
    cardCount: 7,
    positions: [
      {
        name: "Root Chakra",
        meaning: "Your foundation, security, and connection to the physical world"
      },
      {
        name: "Sacral Chakra",
        meaning: "Your creativity, sexuality, and emotional expression"
      },
      {
        name: "Solar Plexus Chakra",
        meaning: "Your personal power, confidence, and sense of self"
      },
      {
        name: "Heart Chakra",
        meaning: "Your capacity for love, compassion, and connection"
      },
      {
        name: "Throat Chakra",
        meaning: "Your communication, truth, and authentic expression"
      },
      {
        name: "Third Eye Chakra",
        meaning: "Your intuition, wisdom, and spiritual insight"
      },
      {
        name: "Crown Chakra",
        meaning: "Your connection to the divine and higher consciousness"
      }
    ]
  },

  shadow_work: {
    name: "Shadow Work Spread",
    description: "A 5-card spread for exploring and integrating your shadow self for personal growth",
    cardCount: 5,
    positions: [
      {
        name: "Your Shadow",
        meaning: "The hidden or repressed aspects of yourself"
      },
      {
        name: "How It Manifests",
        meaning: "How your shadow shows up in your life and relationships"
      },
      {
        name: "The Gift Within",
        meaning: "The positive potential hidden within your shadow"
      },
      {
        name: "Integration Process",
        meaning: "How to acknowledge and integrate this aspect of yourself"
      },
      {
        name: "Transformation",
        meaning: "The growth and healing that comes from shadow work"
      }
    ]
  }
};

/**
 * Get all available spreads
 */
export function getAllSpreads(): TarotSpread[] {
  return Object.values(TAROT_SPREADS);
}

/**
 * Get a specific spread by name
 */
export function getSpread(name: string): TarotSpread | undefined {
  return TAROT_SPREADS[name];
}

/**
 * Validate if a spread type is supported
 */
export function isValidSpreadType(spreadType: string): boolean {
  return spreadType in TAROT_SPREADS;
}
