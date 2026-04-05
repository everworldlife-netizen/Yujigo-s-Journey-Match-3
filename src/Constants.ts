/**
 * Enum-like constants for the entire game.
 * Import from here — never use raw strings for types, events, or scene keys.
 */

// Piece Types (berry-based, matching real sprite names)
export enum PieceType {
  STRAWBERRY = 'strawberry',
  BLUEBERRY = 'blueberry',
  BLACKBERRY = 'blackberry',
  RASPBERRY = 'raspberry',
  LEMON = 'lemon',
  MOON = 'moon',
  DARK = 'dark',
}

// Ordered list for iteration / weighted random
export const ALL_PIECE_TYPES = Object.values(PieceType);

// Powerup Types
export enum PowerupType {
  LINE_H = 'line_h',
  LINE_V = 'line_v',
  BOMB = 'bomb',
  RAINBOW = 'rainbow',
}

// Obstacle Types
export enum ObstacleType {
  ICE = 'ice',
  STONE = 'stone',
  CRATE = 'crate',
  CHAIN = 'chain',
  HONEY = 'honey',
}

// Goal Types
export enum GoalType {
  CLEAR_PIECE = 'clear_piece',
  CLEAR_OBSTACLE = 'clear_obstacle',
  REACH_SCORE = 'reach_score',
  DROP_ITEM = 'drop_item',
  COLLECT_POWERUP = 'collect_powerup',
}

// Scene Keys
export enum SceneKey {
  BOOT = 'Boot',
  PRELOAD = 'Preload',
  MAIN_MENU = 'MainMenu',
  LEVEL_SELECT = 'LevelSelect',
  GAME = 'Game',
  UI = 'UI',
  PAUSE = 'Pause',
  RESULTS = 'Results',
}

// World Keys
export enum WorldKey {
  PILLOW_PATCH = 'pillowpatch',
  SUNBERRY_MEADOW = 'sunberrymeadow',
  FROSTBERRY_FALLS = 'frostberryfalls',
  BRAMBLE_THICKET = 'bramblethicket',
  MOONBERRY_GLADE = 'moonberryglade',
}

// Combo Labels
export enum ComboLabel {
  GREAT = 'Great!',
  AMAZING = 'Amazing!',
  MAGICAL = 'Magical!',
  INCREDIBLE = 'INCREDIBLE!',
}

// Match Patterns
export enum MatchPattern {
  MATCH3 = 'match3',
  MATCH4_ROW = 'match4row',
  MATCH4_COL = 'match4col',
  MATCH5_LINE = 'match5line',
  MATCH5_TL = 'match5TL', // T-shape or L-shape
}

// Piece States (emotional states for berry faces)
export enum PieceState {
  NORMAL = 'normal',
  HAPPY = 'happy',
  EXCITED = 'excited',
  ICE = 'ice',
}

// Game Events — all event strings used by controllers & scenes
export const EVENTS = {
  // Board
  PIECE_REMOVED: 'piece:removed',
  // Swap
  SWAP_VALID: 'swap:valid',
  SWAP_INVALID: 'swap:invalid',
  SWAP_START: 'swap:start',
  // Match
  MATCH_FOUND: 'match:found',
  MATCH_CLEAR: 'match:clear',
  // Cascade
  CASCADE_START: 'cascade:start',
  CASCADE_END: 'cascade:end',
  // Spawn
  SPAWN_PIECES: 'spawn:pieces',
  BOARD_RESHUFFLE: 'board:reshuffle',
  // Combo
  COMBO_UPDATE: 'combo:update',
  COMBO_RESET: 'combo:reset',
  // Score
  SCORE_UPDATE: 'score:update',
  // Goals
  GOAL_PROGRESS: 'goal:progress',
  GOAL_COMPLETE: 'goal:complete',
  GOAL_FAILED: 'goal:failed',
  // Powerups
  POWERUP_CREATED: 'powerup:created',
  POWERUP_ACTIVATED: 'powerup:activated',
  POWERUP_COMBO: 'powerup:combo',
  // Obstacles
  OBSTACLE_DAMAGED: 'obstacle:damaged',
  OBSTACLE_DESTROYED: 'obstacle:destroyed',
  // Economy
  COINS_CHANGED: 'economy:coins_changed',
  LIFE_LOST: 'economy:life_lost',
  LIFE_REGEN: 'economy:life_regen',
  BOOSTER_ADDED: 'economy:booster_added',
  BOOSTER_USED: 'economy:booster_used',
  // Game flow
  LEVEL_START: 'level:start',
  LEVEL_WIN: 'level:win',
  LEVEL_LOSE: 'level:lose',
  TURN_END: 'turn:end',
  INPUT_LOCKED: 'input:locked',
  INPUT_UNLOCKED: 'input:unlocked',
} as const;

// Grid Defaults
export const GRID_DEFAULTS = {
  rows: 9,
  cols: 9,
  minCellSize: 36,
  maxCellSize: 56,
  touchPadding: 4,
} as const;
