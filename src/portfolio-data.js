export const projects = [
  {
    slug: "skipisode",
    type: {
      en: "Browser Extension / YouTube Utility",
      zh: "浏览器扩展 / YouTube 工具"
    },
    title: {
      en: "Skipisode",
      zh: "Skipisode 剧集跳过助手"
    },
    description: {
      en: "A Manifest V3 Chrome and Brave extension for saving reusable YouTube intro and outro skip rules.",
      zh: "一个 Manifest V3 Chrome / Brave 扩展，用于保存可复用的 YouTube 片头与片尾跳过规则。"
    },
    features: {
      en: [
        "Saves intro endpoints from the current timestamp and outro starts from remaining time.",
        "Reuses skip rules across video, playlist, and channel scopes with deterministic priority.",
        "Keeps the in-page UI compact with a draggable button and testable TypeScript rule modules."
      ],
      zh: [
        "可从当前播放时间保存片头结束点，并用剩余时间记录片尾开始点。",
        "支持按单个视频、播放列表与频道范围复用规则，并保持确定性的优先级。",
        "页面内只保留可拖动圆形按钮和紧凑控制面板，核心规则逻辑由 TypeScript 模块和测试覆盖。"
      ]
    },
    tech: ["TypeScript", "Vite", "Vitest", "Manifest V3", "Chrome Extensions", "chrome.storage.local"],
    repo: "https://github.com/XYAN12/episode-skip",
    visual: {
      kind: "mockup",
      variant: "skipisode",
      kicker: {
        en: "YouTube Skip Rules",
        zh: "YouTube 跳过规则"
      },
      pills: ["Intro", "Outro", "Playlist"]
    }
  },
  {
    slug: "music-events",
    type: {
      en: "Web Platform / Admin System",
      zh: "Web 平台 / 管理系统"
    },
    title: {
      en: "Music Events Showcase System",
      zh: "音乐活动展示系统"
    },
    description: {
      en: "A CakePHP event platform with both public-facing discovery pages and a structured admin workflow for content management.",
      zh: "基于 CakePHP 的活动平台，兼顾面向访客的展示页面与后台内容管理流程。"
    },
    features: {
      en: [
        "Supports event, artist, venue, sponsor, photo, and homepage content management.",
        "Combines event discovery, authenticated administration, and image upload flows in one system.",
        "Designed to support polished event pages alongside practical content operations."
      ],
      zh: [
        "支持活动、艺人、场馆、赞助商、照片与主页内容的集中管理。",
        "同时覆盖活动浏览、后台登录与图片上传等完整业务流程。",
        "兼顾页面展示效果与实际内容管理需求。"
      ]
    },
    tech: ["PHP", "CakePHP 5", "MariaDB", "Composer", "Authentication", "CRUD"],
    repo: "https://github.com/XYAN12/musicEventsShowcaseSystem",
    visual: {
      kind: "mockup",
      variant: "events",
      kicker: {
        en: "Public Site + Admin Hub",
        zh: "前台展示 + 后台管理"
      },
      pills: ["Events", "Artists", "Photos"]
    }
  },
  {
    slug: "taskmaster",
    type: {
      en: "Mobile App / iOS",
      zh: "移动应用 / iOS"
    },
    title: {
      en: "TaskMaster",
      zh: "TaskMaster 任务管理应用"
    },
    description: {
      en: "A productivity-focused iOS app for task planning, focus sessions, project organization, and progress tracking.",
      zh: "一款面向效率场景的 iOS 应用，聚焦任务规划、专注模式、项目组织与进度追踪。"
    },
    features: {
      en: [
        "Supports multiple projects, task priorities, due dates, and progress states.",
        "Includes focus mode, relaxing music, local notifications, and an achievement system.",
        "Adds chart-based productivity views with Core Data-backed persistence."
      ],
      zh: [
        "支持多项目管理、任务优先级、截止日期与完成进度设置。",
        "提供专注模式、助眠音乐、本地通知与成就机制。",
        "结合图表视图与 Core Data 持久化，强化生产力反馈。"
      ]
    },
    tech: ["Swift", "UIKit", "Core Data", "SwiftUI", "Charts", "AVFoundation"],
    repo: "https://github.com/XYAN12/TaskMaster",
    visual: {
      kind: "image",
      src: "assets/images/taskmaster-focus.jpg",
      alt: {
        en: "TaskMaster visual asset",
        zh: "TaskMaster 项目视觉素材"
      }
    }
  },
  {
    slug: "craft-haven",
    type: {
      en: "E-commerce Platform / Full-Stack",
      zh: "电商平台 / 全栈"
    },
    title: {
      en: "Craft Haven E-commerce",
      zh: "Craft Haven 手工艺品电商"
    },
    description: {
      en: "A CakePHP-based e-commerce demo application for handcrafted products with customer-facing and admin workflows.",
      zh: "一个基于 CakePHP 的手工艺品电商演示项目，覆盖顾客端购物流程与后台管理功能。"
    },
    features: {
      en: [
        "Implements product browsing, authentication, authorization, admin management, and email-related workflows.",
        "Uses CakePHP 5 with MariaDB by default and SQLite support for automated tests.",
        "Includes documented setup, migrations, code checks, static analysis, and demo screenshots."
      ],
      zh: [
        "实现商品浏览、认证、授权、后台管理与邮件相关流程。",
        "默认使用 CakePHP 5 与 MariaDB，并支持 SQLite 测试环境。",
        "提供环境配置、数据库迁移、代码检查、静态分析与项目截图说明。"
      ]
    },
    tech: ["PHP", "CakePHP 5", "MariaDB", "SQLite", "Bootstrap", "PHPMailer", "Composer"],
    repo: "https://github.com/XYAN12/craft-haven-ecommerce",
    visual: {
      kind: "mockup",
      variant: "craft",
      kicker: {
        en: "Products + Admin",
        zh: "商品 + 后台"
      },
      pills: ["Products", "Auth", "Email"]
    }
  },
  {
    slug: "melbourne-discover",
    type: {
      en: "Data Visualization / City Guide",
      zh: "数据可视化 / 城市导览"
    },
    title: {
      en: "Melbourne Cultural & Artistic Travel Guide",
      zh: "墨尔本文化艺术旅行导览"
    },
    description: {
      en: "An interactive city-exploration experience combining maps, visual analysis, and cultural discovery content.",
      zh: "一个结合地图、可视化分析与文化探索内容的互动式城市导览项目。"
    },
    features: {
      en: [
        "Uses R-based components for interactive mapping and accommodation-related analysis.",
        "Brings together cultural venues, public artworks, and place-based exploration ideas.",
        "Pairs browser UI with Shiny, Leaflet, and Plotly-driven visualization workflows."
      ],
      zh: [
        "通过 R 组件实现交互地图与住宿相关分析。",
        "整合文化场馆、公共艺术与城市探索路径等内容。",
        "将浏览器界面与 Shiny、Leaflet、Plotly 可视化流程结合起来。"
      ]
    },
    tech: ["R", "Shiny", "Leaflet", "Plotly", "HTML/CSS", "Data Storytelling"],
    repo: "https://github.com/XYAN12/MelbourneDiscoverApp",
    visual: {
      kind: "image",
      src: "assets/images/melbourne-cafe.jpg",
      alt: {
        en: "Melbourne guide visual asset",
        zh: "墨尔本导览项目视觉素材"
      }
    }
  },
  {
    slug: "distributed-whiteboard",
    type: {
      en: "Distributed System / Collaboration",
      zh: "分布式系统 / 协作应用"
    },
    title: {
      en: "Distributed Whiteboard",
      zh: "分布式白板系统"
    },
    description: {
      en: "A Java RMI whiteboard that synchronizes drawing activity for concurrent users in a manager-client architecture.",
      zh: "一个基于 Java RMI 的白板系统，在管理者-客户端架构下实现多用户同步绘图。"
    },
    features: {
      en: [
        "Supports shared canvas updates across connected clients over TCP/IP.",
        "Implements manager approval for join requests and privileged board controls.",
        "Provides line, rectangle, oval, text, and free-draw tools with synchronized state."
      ],
      zh: [
        "支持基于 TCP/IP 的多客户端共享画布同步更新。",
        "实现了加入审批与管理员权限控制。",
        "提供线条、矩形、椭圆、文字和自由绘制等工具，并同步状态。"
      ]
    },
    tech: ["Java", "Java RMI", "Swing", "TCP/IP", "Concurrent Collaboration"],
    repo: "https://github.com/XYAN12/DistributedWhiteBoard",
    visual: {
      kind: "mockup",
      variant: "whiteboard",
      kicker: {
        en: "Collaborative Canvas",
        zh: "协作画布"
      },
      pills: ["RMI", "Sync", "GUI"]
    }
  }
];

export const stackGroups = [
  {
    title: {
      en: "Languages",
      zh: "语言"
    },
    items: ["TypeScript", "JavaScript", "Python", "Swift", "Java", "PHP", "R"]
  },
  {
    title: {
      en: "Frameworks",
      zh: "框架"
    },
    items: ["Vite", "Vitest", "CakePHP", "Bootstrap", "UIKit", "Shiny"]
  },
  {
    title: {
      en: "Data & Infrastructure",
      zh: "数据与基础设施"
    },
    items: ["Chrome Extensions", "Manifest V3", "MariaDB", "SQLite", "Core Data", "Leaflet", "Plotly"]
  }
];

export const techIconMeta = {
  TypeScript: { slug: "typescript", label: "TypeScript" },
  JavaScript: { slug: "javascript", label: "JavaScript" },
  Python: { slug: "python", label: "Python" },
  Swift: { slug: "swift", label: "Swift" },
  Java: { slug: "openjdk", label: "Java" },
  PHP: { slug: "php", label: "PHP" },
  R: { slug: "r", label: "R" },
  Vite: { slug: "vite", label: "Vite" },
  Vitest: { slug: "vitest", label: "Vitest" },
  CakePHP: { slug: "cakephp", label: "CakePHP" },
  Bootstrap: { slug: "bootstrap", label: "Bootstrap" },
  UIKit: { slug: "apple", label: "UIKit" },
  Shiny: { slug: "r", label: "Shiny" },
  "Chrome Extensions": { slug: "googlechrome", label: "Chrome Extensions" },
  "Manifest V3": { slug: "googlechrome", label: "Manifest V3" },
  MariaDB: { slug: "mariadb", label: "MariaDB" },
  SQLite: { slug: "sqlite", label: "SQLite" },
  "Core Data": { slug: "apple", label: "Core Data" },
  Leaflet: { slug: "leaflet", label: "Leaflet" },
  Plotly: { slug: "plotly", label: "Plotly" }
};

export const responsibilities = [
  {
    title: {
      en: "User-Centered Product Thinking",
      zh: "以用户为中心的产品思维"
    },
    body: {
      en: "I like building software around clear user journeys, turning complex tasks into interfaces that feel understandable and useful.",
      zh: "我喜欢围绕清晰的用户流程构建软件，把复杂任务转化成更容易理解、也更实用的界面体验。"
    }
  },
  {
    title: {
      en: "Full-Stack Delivery",
      zh: "全栈交付"
    },
    body: {
      en: "The work spans interfaces, APIs, persistence, admin workflows, and local deployment details.",
      zh: "项目覆盖界面、API、数据持久化、后台流程与本地部署等完整链路。"
    }
  },
  {
    title: {
      en: "Useful Tooling",
      zh: "实用工具设计"
    },
    body: {
      en: "The projects focus on practical workflows: browser automation, e-commerce operations, data visualization, and structured collaboration.",
      zh: "这些项目聚焦实际工作流：浏览器自动化、电商运营、数据可视化与结构化协作。"
    }
  }
];

export const copy = {
  en: {
    nav: {
      about: "About",
      projects: "Projects",
      stack: "Tech Stack",
      responsibilities: "Focus",
      contact: "Contact"
    },
    hero: {
      eyebrow: "Software Portfolio",
      title: "Building thoughtful software across web, data, mobile, and product experiences.",
      description:
        "I build practical software projects across web development, browser tools, data visualization, mobile apps, and interactive systems.",
      primaryCta: "Explore Projects",
      secondaryCta: "View GitHub",
      stats: {
        projects: "Featured projects",
        scope: "Cross-domain product work",
        bilingual: "Bilingual presentation"
      },
      panelLabel: "Portfolio Snapshot",
      panel: {
        projects: "A selection of projects across software, browser tools, and interactive product design.",
        stacks: "Experience spanning frontend, backend, mobile development, and data-driven tools."
      },
      ribbonOne: "Full-stack delivery",
      ribbonTwo: "Browser tooling",
      ribbonThree: "Data storytelling"
    },
    about: {
      eyebrow: "About",
      title: "A practical builder with an eye for clarity and experience.",
      body:
        "I enjoy building user-facing software that makes repeated workflows feel clear and approachable, whether that means a YouTube skip extension, an e-commerce platform, or a collaborative whiteboard.",
      points: {
        one: "Comfortable moving between frontend polish, backend structure, and product thinking.",
        two: "Interested in browser tooling, interactive systems, and useful everyday software.",
        three: "Careful about privacy, presentation quality, and deployable project delivery."
      }
    },
    projects: {
      eyebrow: "Projects",
      title: "A selection of projects across web development, browser tools, data visualization, and interactive systems.",
      description:
        "These projects reflect how I design, build, and improve practical software experiences.",
      featuresLabel: "Key features",
      repo: "GitHub Repo",
      live: "Live Demo"
    },
    stack: {
      eyebrow: "Tech Stack",
      title: "Tools that show up repeatedly across these builds."
    },
    responsibilities: {
      eyebrow: "Focus Areas",
      title: "How I like to approach software projects."
    },
    contact: {
      eyebrow: "Contact",
      title: "Open to software, web, and product-oriented opportunities.",
      description:
        "You can find more of my work on GitHub. I am especially interested in learning-oriented, product-minded software opportunities.",
      githubLabel: "GitHub Profile",
      cta: "Open GitHub"
    },
    footer: {
      note: "A bilingual portfolio focused on software, web tools, and product development."
    },
    chatbot: {
      buttonLabel: "Open portfolio chatbot",
      title: "Portfolio Assistant",
      subtitle:
        "Hi, I’m Xiaoyu’s portfolio assistant. Ask me about projects, skills, tech stack, or experience.",
      inputLabel: "Ask a portfolio question",
      placeholder: "Ask about Xiaoyu's projects, skills, or tech stack...",
      send: "Send",
      emptyState:
        "Hi, I’m Xiaoyu’s portfolio assistant. Ask me about projects, skills, tech stack, or experience.",
      processTitle: "Process",
      working: "Looking through Xiaoyu's portfolio...",
      stepOne: "Parsed question",
      stepTwo: "Checked portfolio data",
      stepThree: "Found relevant projects",
      stepFour: "Generated answer",
      unavailable:
        "The portfolio assistant is temporarily unavailable. Please try again shortly.",
      endpointMissing:
        "The portfolio chatbot endpoint is not configured yet. Please try again shortly.",
      redirect:
        "I can help with Xiaoyu's portfolio, projects, skills, tech stack, and experience. Try asking about a specific project or technology."
    }
  },
  zh: {
    nav: {
      about: "关于我",
      projects: "项目",
      stack: "技术栈",
      responsibilities: "能力侧重",
      contact: "联系"
    },
    hero: {
      eyebrow: "软件作品集",
      title: "围绕 Web、数据、移动端与产品体验，持续构建有完成度的软件作品。",
      description:
        "我关注 Web 开发、浏览器工具、数据可视化、移动应用与交互式系统，也持续在这些方向打磨更实用的软件项目。",
      primaryCta: "查看项目",
      secondaryCta: "访问 GitHub",
      stats: {
        projects: "代表项目",
        scope: "跨领域产品实践",
        bilingual: "中英双语展示"
      },
      panelLabel: "作品集概览",
      panel: {
        projects: "涵盖软件开发、浏览器工具与交互式产品设计的部分项目。",
        stacks: "覆盖前端、后端、移动开发与数据驱动工具的实践经验。"
      },
      ribbonOne: "全栈交付",
      ribbonTwo: "浏览器工具",
      ribbonThree: "数据叙事"
    },
    about: {
      eyebrow: "关于我",
      title: "偏实战型的构建者，也重视表达清晰与体验质量。",
      body:
        "我喜欢做面向真实使用场景的软件，把重复流程整理成更清晰、更容易上手的体验，无论是 YouTube 跳过扩展、电商平台，还是协作式白板系统。",
      points: {
        one: "能够在前端呈现、后端结构与产品思考之间切换。",
        two: "关注浏览器工具、交互系统以及真正有用的日常软件。",
        three: "在公开展示时会主动考虑隐私、表达质量与可部署性。"
      }
    },
    projects: {
      eyebrow: "项目",
      title: "这里展示了我在 Web 开发、浏览器工具、数据可视化和交互式系统方向的部分项目。",
      description:
        "这些项目体现了我在设计、实现与打磨软件体验上的一些实践。",
      featuresLabel: "核心特性",
      repo: "GitHub 仓库",
      live: "在线演示"
    },
    stack: {
      eyebrow: "技术栈",
      title: "这些项目中反复出现、能体现能力边界的工具组合。"
    },
    responsibilities: {
      eyebrow: "能力侧重",
      title: "我通常会如何理解和推进一个软件项目。"
    },
    contact: {
      eyebrow: "联系",
      title: "适合软件开发、Web 工具与产品导向岗位的作品展示。",
      description:
        "如果你想了解更多我的项目，可以先从 GitHub 开始。我也很期待继续学习和参与产品导向的软件实践。",
      githubLabel: "GitHub 主页",
      cta: "打开 GitHub"
    },
    footer: {
      note: "一个围绕软件、Web 工具与产品开发的双语作品集。"
    },
    chatbot: {
      buttonLabel: "打开作品集聊天助手",
      title: "作品集助手",
      subtitle:
        "你好，我是 Xiaoyu 的作品集助手。你可以问我关于项目、技能、技术栈或经历的问题。",
      inputLabel: "输入作品集相关问题",
      placeholder: "例如：介绍xiaoyu的项目或技能",
      send: "发送",
      emptyState:
        "你好，我是 Xiaoyu 的作品集助手。你可以问我关于项目、技能、技术栈或经历的问题。",
      processTitle: "回答过程",
      working: "正在查看 Xiaoyu 的作品集信息...",
      stepOne: "已解析问题",
      stepTwo: "已检查作品集数据",
      stepThree: "已找到相关项目",
      stepFour: "已生成回答",
      unavailable: "作品集助手暂时不可用，请稍后再试。",
      endpointMissing: "聊天接口尚未配置，请先在页面配置中填写 Cloudflare Worker 地址。",
      redirect:
        "我可以帮助介绍 Xiaoyu 的作品集、项目、技能、技术栈和经验。你可以试着问某个具体项目或技术。"
    }
  }
};
