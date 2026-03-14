// Physics
export const GRAVITY = -38;
export const JUMP_FORCE = 18;
export const MOVE_SPEED = 8;
export const MAX_FALL_SPEED = -22;
export const PLAYER_WIDTH = 1.2;
export const PLAYER_HEIGHT = 2.1;

// Camera (smaller = more zoomed in)
export const VIEW_WIDTH = 26;
export const VIEW_HEIGHT = 18;

// Colors
export const COLORS = {
  drupalBlue:    0x0678BE,
  drupalDark:    0x044d7a,
  sky:           0x87CEEB,
  skyDark:       0x4A90D9,
  grass:         0x4CAF50,
  grassDark:     0x2E7D32,
  dirt:          0x8B4513,
  dirtDark:      0x5D2F0E,
  cloud:         0xFFFFFF,
  cloudShadow:   0xDDDDDD,
  apiBlock:      0x1A237E,
  apiLight:      0x3949AB,
  stone:         0x757575,
  stoneDark:     0x424242,
  gold:          0xFFD700,
  enemyRed:      0xE53935,
  enemyPurple:   0x7B1FA2,
  bossGray:      0x37474F,
  bossRed:       0xD32F2F,
  powerGreen:    0x4CAF50,
  powerPink:     0xE91E63,
  shieldBlue:    0x2196F3,
  heartRed:      0xF44336,
  portalGold:    0xFFD700,
};

// Platforms: [x, y, width, height, type]
export const PLATFORMS = [
  // === Section 1: Welcome — "Getting Started" (x: 0–55) ===
  [-2, -2.5, 58, 5, 'grass'],         // main ground
  [8,   2.5, 3, 0.5, 'grass'],        // low stepping stone – teaches jumping
  [12,  3,   4, 0.5, 'grass'],        // (original)
  [17,  4.5, 3, 0.5, 'grass'],        // staircase up to first API block
  [20,  5,   3, 0.5, 'api'],          // (original)
  [28,  3.5, 5, 0.5, 'grass'],        // (original)
  [36,  6,   4, 0.5, 'api'],          // (original)
  [44,  4,   3, 0.5, 'grass'],        // (original)

  // === Section 2: API Jungle — "API Integration" (x: 58–130) ===
  [58,  -2.5, 15, 5, 'grass'],        // ground island 1
  [65,  3,    3,  0.5, 'api'],         // (original)
  [69,  5.5,  2,  0.5, 'api'],        // high API stepping stone
  [72,  5,    4,  0.5, 'api'],         // (original)
  [76,  -2.5, 8,  5, 'grass'],        // ground island 2
  [80,  8,    3,  0.5, 'cloud'],       // (original) secret high cloud
  [84,  4,    2,  0.5, 'api'],        // jumping puzzle step 1
  [87,  5.5,  2,  0.5, 'api'],        // jumping puzzle step 2
  [90,  3.5,  2,  0.5, 'api'],        // jumping puzzle step 3
  [88,  3,    5,  0.5, 'api'],         // (original)
  [87,  -2.5, 10, 5, 'grass'],        // ground island 3
  [96,  6,    3,  0.5, 'api'],         // (original)
  [99,  8.5,  2,  0.5, 'cloud'],      // secret upper path
  [100, -2.5, 12, 5, 'grass'],        // ground island 4
  [104, 4,    4,  0.5, 'cloud'],       // (original)
  [108, 6.5,  2,  0.5, 'api'],        // upper API route
  [110, 7,    3,  0.5, 'api'],         // (original)
  [115, 3,    4,  0.5, 'grass'],       // (original)
  [120, -2.5, 12, 5, 'grass'],        // ground island 5

  // === Section 3: Cloud Nine — "Cloud Deployment" (x: 135–210) ===
  [135, 2,  5, 0.5, 'cloud'],         // (original)
  [140, 5,  3, 0.5, 'cloud'],         // new stepping cloud
  [144, 4,  4, 0.5, 'cloud'],         // (original)
  [148, 7,  3, 0.5, 'cloud'],         // new mid cloud
  [152, 6,  5, 0.5, 'cloud'],         // (original)
  [155, 9,  3, 0.5, 'cloud'],         // secret high cloud – bonus coins
  [159, 3,  3, 0.5, 'cloud'],         // (original)
  [163, 6,  2, 0.5, 'cloud'],         // stepping cloud
  [166, 5,  4, 0.5, 'cloud'],         // (original)
  [170, 8,  3, 0.5, 'cloud'],         // new upper route
  [173, 7,  5, 0.5, 'cloud'],         // (original)
  [177,10,  3, 0.5, 'cloud'],         // secret high platform – AI star
  [180, 4,  4, 0.5, 'cloud'],         // (original)
  [186, 2,  5, 0.5, 'cloud'],         // (original)
  [190, 5,  3, 0.5, 'cloud'],         // new stepping cloud
  [193, 5,  4, 0.5, 'cloud'],         // (original)
  [197, 8,  3, 0.5, 'cloud'],         // secret upper path
  [200, 3,  5, 0.5, 'cloud'],         // (original)
  [207, -2.5, 6, 5, 'grass'],         // landing pad

  // === Section 4: Monolith Fortress — "Boss Arena" (x: 215–285) ===
  [215, -2.5, 72, 5, 'stone'],        // fortress ground
  [218, 3,    3,  0.5, 'stone'],       // approach step 1
  [222, 5,    3,  0.5, 'stone'],       // approach step 2
  [226, 3.5,  3,  0.5, 'stone'],      // approach step 3
  [230, 3,    3,  0.5, 'stone'],       // (original)
  [234, 5.5,  3,  0.5, 'stone'],      // gauntlet high step
  [238, 5,    4,  0.5, 'stone'],       // (original)
  [242, 3,    3,  0.5, 'stone'],      // gauntlet low step
  [246, 6,    3,  0.5, 'stone'],      // gauntlet high step
  [250, 3,    4,  0.5, 'stone'],       // (original)
  [260, 4.5,  3,  0.5, 'stone'],      // boss arena side platform
  [270, 5,    3,  0.5, 'stone'],      // boss arena center platform
  [278, 4,    3,  0.5, 'stone'],      // boss arena far platform
];

// Enemies: [x, y, type, patrolRange]
// y = ground_top + half_height  (bugs=0.45, monoliths=1.5, drama=floating)
export const ENEMIES = [
  // Section 1 — gentle intro (ground: x -31..27)
  [20,  0.45, 'bug',      6],         // (original) first enemy
  [10,  0.45, 'bug',      4],         // new – guards early mid-section

  // Section 2 — API Jungle (ground islands)
  [56,  0.45, 'bug',      5],         // (original) on S1 ground edge
  [62,  0.45, 'bug',      5],         // new – on S2 ground island 1 (50.5..65.5)
  [76,  0.45, 'bug',      6],         // (original) on ground island 2 (72..80)
  [87,  0.45, 'bug',      5],         // (original) on ground island 3 (82..92)
  [90,  6,    'drama',    8],         // (original) floating
  [100, 0.45, 'bug',      6],         // (original) on ground island 4 (94..106)
  [104, 7,    'drama',    6],         // new – guards cloud area above island 4
  [112, 5,    'drama',   10],         // (original) floating
  [118, 1.5,  'monolith', 6],         // (original) on ground island 5 (114..126)
  [122, 0.45, 'bug',      4],         // new – on ground island 5 (114..126)

  // Section 3 — Cloud Nine (all floating/cloud enemies)
  [142, 7,    'drama',    6],         // new – guards stepping cloud area
  [148, 8,    'drama',    8],         // (original)
  [160, 6,    'drama',    8],         // new – guards path forward
  [165, 9,    'drama',   10],         // (original)
  [178, 6,    'drama',    8],         // (original)
  [195, 8,    'drama',   10],         // (original)

  // Section 4 — Monolith Fortress (ground: x 179..251)
  [222, 0.45, 'bug',      5],         // (original)
  [228, 1.5,  'monolith', 6],         // (original) approach monolith
  [235, 0.45, 'bug',      5],         // (original)
  [240, 0.45, 'bug',      5],         // (original)
  [245, 1.5,  'monolith', 6],         // (original) gauntlet monolith
  [248, 0.45, 'bug',      4],         // new – right before boss arena
];

// Powerups: [x, y, type]
export const POWERUPS = [
  [20,  6.5,  'graphql'],             // S1: first weapon pickup
  [80,  10,   'ai'],                  // S2: AI star on secret cloud
  [104, 6,    'graphql'],             // S2: weapon before drama cloud cluster
  [110, 8.5,  'heart'],              // S2: heal after jungle gauntlet
  [152, 8,    'graphql'],             // S3: weapon on cloud
  [177, 11.5, 'ai'],                 // S3: AI star on secret high cloud
  [186, 4,    'oauth'],              // S3: shield before fortress
  [230, 5,    'heart'],              // S4: heal before gauntlet
  [250, 4.5,  'oauth'],              // S4: shield right before boss arena
  [260, 6,    'graphql'],            // S4: weapon inside boss arena
];

// Coins (API tokens): [x, y]
export const COINS = [
  // Section 1 — guide the player forward, arcs at jump peaks (~14 coins)
  [6,2],[8,2],                         // starting trail on ground
  [11,3],[13,4],                       // arc up to first platform
  [17,5],[19,5.5],                     // lead to API block
  [24,4],[26,3.5],                     // arc down from API
  [30,5],[32,5.5],                     // arc over grass platform
  [40,2],[42,2],                       // lead through mid-section
  [46,3],[48,4],                       // coin arc near end

  // Section 2 — reward exploration of upper paths (~17 coins)
  [60,2],[62,2],                       // ground trail on island 1
  [67,4],[69,5.5],                     // arc to API blocks
  [78,2],[80,2],                       // ground on island 2
  [80,9.5],[82,9.5],                   // secret cloud reward (2 bonus)
  [85,5],[87,6],[89,4],                // jumping puzzle coins
  [95,6.5],[97,5],                     // lead up to API
  [99,9],[100,9.5],                    // secret upper cloud reward (2 bonus)
  [102,2],[104,2],                     // ground trail on island 4
  [108,7],                             // upper API route reward

  // Section 3 — arcs between clouds, secret high rewards (~16 coins)
  [137,3],[139,4.5],                   // first cloud jump arc
  [144,5.5],[146,6],                   // stepping cloud arc
  [155,10],[157,10],                   // secret high cloud cluster (2 bonus)
  [161,4],[163,6.5],                   // stepping cloud path
  [170,8.5],                           // upper route reward
  [175,8],[177,9],                     // cloud arc to high plat
  [177,11],[178,11],                   // secret highest cloud (2 bonus)
  [182,5],[184,3.5],                   // descent arc
  [190,5.5],[193,6],                   // stepping cloud arc

  // Section 4 — guide through gauntlet, reward platforming (~12 coins)
  [217,2],[219,2],                     // fortress entrance
  [222,5.5],[224,4],                   // platform arc
  [230,4],[234,6],                     // gauntlet high points
  [242,4],[246,7],                     // gauntlet low-high arcs
  [258,2],[260,5.5],                   // boss arena coins
  [270,6],[278,5],                     // boss arena platforms
];

// Signs: [x, y, text]
// Ground signs sit at y=0.9 (ground_top + sign_half_height)
// Cloud signs sit at cloud_y + 1.15 (0.25 plat half-height + 0.9 sign half-height)
export const SIGNS = [
  [3,   0.9, "Welcome, Developer!\nYour quest begins..."],
  [15,  0.9, "Launch Drupal sites\nin seconds!"],
  [30,  0.9, "The AI-Agent-Friendly\nHeadless CMS"],
  [48,  0.9, "Free tier: 50GB CDN\n100K API calls/mo!"],
  [60,  0.9, "23 MCP Tools for\nfull content CRUD!"],
  [95,  0.9, "RAG-Powered Search\nAI-First Dev!"],
  [115, 0.9, "Next.js 15 + GraphQL\n+ OAuth ready!"],
  [125, 0.9, "Git-Native Workflows\nOne-Click Duplication!"],
  [136, 3.15,"Zero DevOps Drama!\nSmash those clouds!"],
  [166, 6.15,"No Lock-In! True\nVendor Independence!"],
  [186, 3.15,"Lightning Fast!\nBuilt to Ship!"],
  [200, 4.15,"Built for Developers\nWho Ship Fast!"],
  [209, 0.9, "The Fortress awaits!\nDefeat The Monolith!"],
  [255, 0.9, "FINAL BOSS! Deploy\nyour site to WIN!"],
];

// Boss
export const BOSS_CONFIG = {
  x: 268,
  y: 3,
  width: 4.5,
  height: 6,
  hp: 10,
  speed: 3,
  arenaLeft: 255,
  arenaRight: 282,
};

// Enemy stats (collision boxes match visual sizes)
export const ENEMY_STATS = {
  bug:      { width: 1.2, height: 0.9, hp: 1, speed: 2, score: 100, name: 'Complexity' },
  monolith: { width: 2.2, height: 3,   hp: 3, speed: 1, score: 300, name: 'Vendor Lock-in' },
  drama:    { width: 1.8, height: 1.5, hp: 1, speed: 1.5, score: 200, name: 'Slow Deploys' },
};
