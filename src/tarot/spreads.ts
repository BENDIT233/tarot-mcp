import { TarotSpread } from "./types.js";

/**
 * Tarot spread definitions
 */
export const TAROT_SPREADS: Record<string, TarotSpread> = {
  single_card: {
    name: "单张牌",
    description: "简单的单张牌抽取，用于快速洞察或日常指导",
    cardCount: 1,
    positions: [
      {
        name: "信息",
        meaning: "针对你的问题的主要洞察、指导或能量"
      }
    ]
  },

  three_card: {
    name: "三张牌牌阵",
    description: "多功能的三张牌牌阵，可以代表过去/现在/未来、情况/行动/结果，或身/心/灵",
    cardCount: 3,
    positions: [
      {
        name: "过去/情况",
        meaning: "导致这种情况的原因或事情的根基"
      },
      {
        name: "现在/行动",
        meaning: "当前状态或应该采取的行动"
      },
      {
        name: "未来/结果",
        meaning: "可能的结果或未来发展"
      }
    ]
  },

  celtic_cross: {
    name: "凯尔特十字",
    description: "最著名的塔罗牌阵，用10张牌提供对情况的全面洞察",
    cardCount: 10,
    positions: [
      {
        name: "当前情况",
        meaning: "事情的核心，你当前的情况或心理状态"
      },
      {
        name: "挑战/阻碍",
        meaning: "你面临的挑战或在这种情况下阻碍你的因素"
      },
      {
        name: "遥远过去/根基",
        meaning: "情况的根基，遥远过去的影响"
      },
      {
        name: "近期过去",
        meaning: "最近的事件或正在消逝的影响"
      },
      {
        name: "可能结果",
        meaning: "如果事情按现状继续发展的一种可能结果"
      },
      {
        name: "近期未来",
        meaning: "在不久的将来即将到来的事情"
      },
      {
        name: "你的态度",
        meaning: "你对情况的态度，你如何看待自己"
      },
      {
        name: "外部影响",
        meaning: "他人如何看待你或影响情况的外部因素"
      },
      {
        name: "希望与恐惧",
        meaning: "你对情况的内心感受、希望和恐惧"
      },
      {
        name: "最终结果",
        meaning: "最终结果，所有影响的顶点"
      }
    ]
  },

  horseshoe: {
    name: "马蹄形牌阵",
    description: "7张牌的牌阵，为特定情况提供指导，显示过去影响、当前环境和未来可能性",
    cardCount: 7,
    positions: [
      {
        name: "过去影响",
        meaning: "导致当前情况的过去事件和影响"
      },
      {
        name: "当前情况",
        meaning: "你当前的环境和心理状态"
      },
      {
        name: "隐藏影响",
        meaning: "影响情况的隐藏因素或潜意识影响"
      },
      {
        name: "障碍",
        meaning: "你可能面临的挑战或障碍"
      },
      {
        name: "外部影响",
        meaning: "外部影响、他人的态度或环境因素"
      },
      {
        name: "建议",
        meaning: "你应该做什么或采取的最佳方法"
      },
      {
        name: "可能结果",
        meaning: "如果你遵循所给建议的最可能结果"
      }
    ]
  },

  relationship_cross: {
    name: "关系十字牌阵",
    description: "专门为检视关系而设计的7张牌牌阵，无论是恋爱、友谊还是家庭关系",
    cardCount: 7,
    positions: [
      {
        name: "你",
        meaning: "你在关系中的角色、感受和贡献"
      },
      {
        name: "你的伴侣",
        meaning: "他们在关系中的角色、感受和贡献"
      },
      {
        name: "关系本身",
        meaning: "关系本身的当前状态和动态"
      },
      {
        name: "联结你们的因素",
        meaning: "共同点、共同价值观和让你们走到一起的因素"
      },
      {
        name: "分离你们的因素",
        meaning: "差异、冲突和造成紧张的因素"
      },
      {
        name: "建议",
        meaning: "改善和培养关系的指导"
      },
      {
        name: "未来潜力",
        meaning: "关系的发展方向和潜在结果"
      }
    ]
  },

  career_path: {
    name: "职业道路牌阵",
    description: "用于职业指导的6张牌牌阵，探索你的职业旅程和机会",
    cardCount: 6,
    positions: [
      {
        name: "当前职业状况",
        meaning: "你目前的职业环境和对工作的感受"
      },
      {
        name: "你的技能和天赋",
        meaning: "服务于你职业的天生能力和已发展的技能"
      },
      {
        name: "职业挑战",
        meaning: "你在职业生活中面临的障碍或困难"
      },
      {
        name: "隐藏机会",
        meaning: "未见的可能性或值得探索的潜在职业道路"
      },
      {
        name: "应采取的行动",
        meaning: "推进职业发展的具体步骤或方法"
      },
      {
        name: "职业结果",
        meaning: "遵循所提供指导的可能结果"
      }
    ]
  },

  decision_making: {
    name: "决策制定牌阵",
    description: "5张牌的牌阵，通过检视你选择的各个方面来帮助你做出重要决定",
    cardCount: 5,
    positions: [
      {
        name: "情况",
        meaning: "需要做出决定的当前环境"
      },
      {
        name: "选择A",
        meaning: "第一个选择及其潜在后果"
      },
      {
        name: "选择B",
        meaning: "第二个选择及其潜在后果"
      },
      {
        name: "你需要知道的",
        meaning: "需要考虑的隐藏因素或重要信息"
      },
      {
        name: "推荐路径",
        meaning: "基于所有因素的最佳行动方案"
      }
    ]
  },

  spiritual_guidance: {
    name: "灵性指导牌阵",
    description: "用于灵性发展和与高我连接的6张牌牌阵",
    cardCount: 6,
    positions: [
      {
        name: "你的灵性状态",
        meaning: "你当前的灵性状况和觉知水平"
      },
      {
        name: "灵性课题",
        meaning: "宇宙现在试图教给你的东西"
      },
      {
        name: "成长阻碍",
        meaning: "阻碍你灵性发展的因素"
      },
      {
        name: "灵性天赋",
        meaning: "你天生的灵性能力和直觉天赋"
      },
      {
        name: "来自上方的指导",
        meaning: "来自你的高我或灵性向导的信息"
      },
      {
        name: "下一步",
        meaning: "如何在灵性旅程中前进"
      }
    ]
  },

  year_ahead: {
    name: "年度展望牌阵",
    description: "13张牌的牌阵，为来年提供洞察，每个月一张牌加上整体主题",
    cardCount: 13,
    positions: [
      {
        name: "整体主题",
        meaning: "整年的主要主题和能量"
      },
      {
        name: "一月",
        meaning: "一月的期待和关注重点"
      },
      {
        name: "二月",
        meaning: "二月的期待和关注重点"
      },
      {
        name: "三月",
        meaning: "三月的期待和关注重点"
      },
      {
        name: "四月",
        meaning: "四月的期待和关注重点"
      },
      {
        name: "五月",
        meaning: "五月的期待和关注重点"
      },
      {
        name: "六月",
        meaning: "六月的期待和关注重点"
      },
      {
        name: "七月",
        meaning: "七月的期待和关注重点"
      },
      {
        name: "八月",
        meaning: "八月的期待和关注重点"
      },
      {
        name: "九月",
        meaning: "九月的期待和关注重点"
      },
      {
        name: "十月",
        meaning: "十月的期待和关注重点"
      },
      {
        name: "十一月",
        meaning: "十一月的期待和关注重点"
      },
      {
        name: "十二月",
        meaning: "十二月的期待和关注重点"
      }
    ]
  },

  chakra_alignment: {
    name: "脉轮对齐牌阵",
    description: "检视身体能量中心以获得疗愈和平衡的7张牌牌阵",
    cardCount: 7,
    positions: [
      {
        name: "海底轮",
        meaning: "你的根基、安全感和与物质世界的连接"
      },
      {
        name: "脐轮",
        meaning: "你的创造力、性能量和情感表达"
      },
      {
        name: "太阳神经丛轮",
        meaning: "你的个人力量、自信和自我意识"
      },
      {
        name: "心轮",
        meaning: "你的爱的能力、慈悲和连接"
      },
      {
        name: "喉轮",
        meaning: "你的沟通、真理和真实表达"
      },
      {
        name: "眉心轮",
        meaning: "你的直觉、智慧和灵性洞察"
      },
      {
        name: "顶轮",
        meaning: "你与神性和更高意识的连接"
      }
    ]
  },

  shadow_work: {
    name: "阴影工作牌阵",
    description: "用于探索和整合阴影自我以促进个人成长的5张牌牌阵",
    cardCount: 5,
    positions: [
      {
        name: "你的阴影",
        meaning: "你隐藏或压抑的自我面向"
      },
      {
        name: "如何显现",
        meaning: "你的阴影如何在生活和关系中显现"
      },
      {
        name: "内在礼物",
        meaning: "隐藏在阴影中的积极潜能"
      },
      {
        name: "整合过程",
        meaning: "如何承认和整合这个自我面向"
      },
      {
        name: "转化",
        meaning: "阴影工作带来的成长和疗愈"
      }
    ]
  },

  venus_love: {
    name: "金星爱情牌阵",
    description: "通过金星能量探索爱情、关系、自我价值和浪漫潜力的7张牌牌阵",
    cardCount: 7,
    positions: [
      {
        name: "你当前的关系能量",
        meaning: "你在爱情和关系中的当前状态"
      },
      {
        name: "自爱与自我价值",
        meaning: "你如何重视和关爱自己"
      },
      {
        name: "吸引爱情的因素",
        meaning: "你的磁性品质和吸引爱情进入生活的因素"
      },
      {
        name: "接受爱情的阻碍",
        meaning: "阻止你完全接受和接纳爱情的因素"
      },
      {
        name: "如何增进关系",
        meaning: "改善当前或未来关系的行动"
      },
      {
        name: "内心隐藏的渴望",
        meaning: "你最深层的浪漫和情感需求"
      },
      {
        name: "爱情的未来潜力",
        meaning: "你的浪漫生活的未来前景"
      }
    ]
  },

  tree_of_life: {
    name: "生命之树牌阵",
    description: "基于卡巴拉生命之树的10张牌牌阵，提供深层灵性洞察和人生指导",
    cardCount: 10,
    positions: [
      {
        name: "王冠(Kether)",
        meaning: "神圣意志、最高目的和灵性连接"
      },
      {
        name: "智慧(Chokmah)",
        meaning: "创造力、灵感和动态能量"
      },
      {
        name: "理解(Binah)",
        meaning: "形式、结构和接受性智慧"
      },
      {
        name: "慈悲(Chesed)",
        meaning: "爱、慈悲和扩展"
      },
      {
        name: "严厉(Geburah)",
        meaning: "力量、纪律和必要的界限"
      },
      {
        name: "美丽(Tiphareth)",
        meaning: "平衡、和谐和对立面的整合"
      },
      {
        name: "胜利(Netzach)",
        meaning: "情感、欲望和艺术表达"
      },
      {
        name: "辉煌(Hod)",
        meaning: "智力、沟通和分析思维"
      },
      {
        name: "基础(Yesod)",
        meaning: "潜意识、梦境和心灵印象"
      },
      {
        name: "王国(Malkuth)",
        meaning: "物质显化和物质世界的结果"
      }
    ]
  },

  astrological_houses: {
    name: "占星宫位牌阵",
    description: "代表十二个占星宫位的12张牌牌阵，提供全面的人生洞察",
    cardCount: 12,
    positions: [
      {
        name: "第一宫 - 自我与身份",
        meaning: "你的个性、外表和他人对你的看法"
      },
      {
        name: "第二宫 - 价值观与资源",
        meaning: "金钱、财产、自我价值和个人价值观"
      },
      {
        name: "第三宫 - 沟通",
        meaning: "沟通、学习、兄弟姐妹和短途旅行"
      },
      {
        name: "第四宫 - 家庭与根基",
        meaning: "家庭、家族、根源和情感基础"
      },
      {
        name: "第五宫 - 创造力与浪漫",
        meaning: "创造力、孩子、浪漫和自我表达"
      },
      {
        name: "第六宫 - 工作与健康",
        meaning: "日常工作、健康、服务和例行公事"
      },
      {
        name: "第七宫 - 伙伴关系",
        meaning: "婚姻、商业伙伴关系和公开的敌人"
      },
      {
        name: "第八宫 - 转化",
        meaning: "共享资源、转化和隐秘事务"
      },
      {
        name: "第九宫 - 哲学",
        meaning: "高等教育、哲学、旅行和灵性"
      },
      {
        name: "第十宫 - 事业与声誉",
        meaning: "事业、声誉、公众形象和人生方向"
      },
      {
        name: "第十一宫 - 朋友与愿望",
        meaning: "朋友、团体、希望和未来愿望"
      },
      {
        name: "第十二宫 - 灵性与隐藏",
        meaning: "灵性、隐藏的敌人和潜意识模式"
      }
    ]
  },

  mandala: {
    name: "曼陀罗牌阵",
    description: "代表完整性和自我发现之旅的9张牌圆形牌阵",
    cardCount: 9,
    positions: [
      {
        name: "中心 - 核心自我",
        meaning: "你的本质天性和当前的灵性中心"
      },
      {
        name: "北方 - 灵性指导",
        meaning: "可获得的神圣指导和更高智慧"
      },
      {
        name: "东北 - 心智清晰",
        meaning: "需要关注的思想、想法和心理过程"
      },
      {
        name: "东方 - 新的开始",
        meaning: "即将到来的全新开始和机会"
      },
      {
        name: "东南 - 人际关系",
        meaning: "你与他人的联系和社交动态"
      },
      {
        name: "南方 - 激情与创造力",
        meaning: "你的创造之火和激励你的因素"
      },
      {
        name: "西南 - 疗愈与释放",
        meaning: "生活中需要疗愈或释放的事物"
      },
      {
        name: "西方 - 直觉与情感",
        meaning: "你的情感景观和直觉洞察"
      },
      {
        name: "西北 - 智慧与知识",
        meaning: "从经验中学到的课题和获得的智慧"
      }
    ]
  },

  pentagram: {
    name: "五芒星牌阵",
    description: "基于五元素的5张牌牌阵，探索平衡与灵性和谐",
    cardCount: 5,
    positions: [
      {
        name: "灵(顶部)",
        meaning: "神圣指导和你最高的灵性目的"
      },
      {
        name: "风(右上)",
        meaning: "思想、沟通和智力事务"
      },
      {
        name: "火(右下)",
        meaning: "激情、行动和创造能量"
      },
      {
        name: "土(左下)",
        meaning: "物质世界、稳定性和实际关切"
      },
      {
        name: "水(左上)",
        meaning: "情感、直觉和潜意识影响"
      }
    ]
  },

  mirror_of_truth: {
    name: "真相之镜",
    description: "通过四束光线澄清关系困惑的4张牌牌阵：照亮你的视角、探索他们的意图、揭示客观真相、指导未来方向",
    cardCount: 4,
    positions: [
      {
        name: "第一束光：照亮自己",
        meaning: "你的视角 - 你的情感、内在过滤器、焦虑、恐惧或期望如何影响你对情况的理解"
      },
      {
        name: "第二束光：探索他们的内心",
        meaning: "他们的意图 - 超越表面行为，探索他们真正的动机、想法和内在状态"
      },
      {
        name: "第三束光：恢复原始真相",
        meaning: "客观事实 - 剥离情感和主观判断，呈现最中性和真实的事件画面"
      },
      {
        name: "第四束光：指导未来方向",
        meaning: "影响和指导 - 基于对真相的理解，为你指出前进的方向和应采取的行动"
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
