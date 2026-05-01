import { Injectable } from '@angular/core';

export type GameMode = 'ultimate' | 'character';

export interface HistoryItem {
  order: number;
  card: Card;
  at: Date;
  playerName?: string;
}

export interface RoleConfig {
  soi: number;
  dan: number;
  phanBoi: boolean;
  soiNguyen: boolean;
  soiNguoi: boolean;
  baoVe: boolean;
  tietLo: boolean;
  phuThuy: boolean;
  tienTri: boolean;
  cungCoi: boolean;
  hoangTu: boolean;
  tuSi: boolean;
  tamLinh: boolean;
  thauCam: boolean;
  matNgu: boolean;
  soiCon: boolean;
  cao: boolean;
  gau: boolean;
  giaLang: boolean;
  lieu: boolean;
  nhanBan: boolean;
  sinhDoi: boolean;
  soiBanSoi: boolean;
  soiNgu: boolean;
  soiTri: boolean;
  hunter: boolean;
}

export interface Card {
  name: string;
  img: string;
}

export type SpecialRoleKey = Exclude<keyof RoleConfig, 'soi' | 'dan'>;

export interface SpecialRoleDef {
  key: SpecialRoleKey;
  name: string;
  fileName: string;
}

export const SPECIAL_ROLE_DEFS: ReadonlyArray<SpecialRoleDef> = [
  { key: 'phanBoi', name: 'Phản bội', fileName: 'phanboi.jpg' },
  { key: 'soiNguyen', name: 'Sói nguyền', fileName: 'soi_nguyen.jpg' },
  { key: 'soiNguoi', name: 'Sói người', fileName: 'soi_nguoi.jpg' },
  { key: 'baoVe', name: 'Bảo vệ', fileName: 'baove.jpg' },
  { key: 'tietLo', name: 'Tiết lộ', fileName: 'tietlo.jpg' },
  { key: 'phuThuy', name: 'Phù thủy', fileName: 'phuthuy.jpg' },
  { key: 'tienTri', name: 'Tiên tri', fileName: 'tientri.jpg' },
  { key: 'cungCoi', name: 'Cứng cỏi', fileName: 'cungcoi.jpg' },
  { key: 'hoangTu', name: 'Hoàng tử', fileName: 'hoangtu.jpg' },
  { key: 'tuSi', name: 'Tu sĩ', fileName: 'tusi.jpg' },
  { key: 'tamLinh', name: 'Tâm linh', fileName: 'tamlinh.jpg' },
  { key: 'thauCam', name: 'Thấu cảm', fileName: 'thaucam.jpg' },
  { key: 'matNgu', name: 'Mất ngủ', fileName: 'matngu.jpg' },
  { key: 'soiCon', name: 'Sói con', fileName: 'soi_con.jpg' },
  { key: 'cao', name: 'Cáo', fileName: 'cao.jpg' },
  { key: 'gau', name: 'Gấu', fileName: 'gau.jpg' },
  { key: 'giaLang', name: 'Già làng', fileName: 'gialang.jpg' },
  { key: 'lieu', name: 'Liễu', fileName: 'lieu.jpg' },
  { key: 'nhanBan', name: 'Nhân bản', fileName: 'nhanban.jpg' },
  { key: 'sinhDoi', name: 'Sinh đôi', fileName: 'sinhdoi.jpg' },
  { key: 'soiBanSoi', name: 'Bán sói', fileName: 'soi_bansoi.jpg' },
  { key: 'soiNgu', name: 'Sói ngu', fileName: 'soi_ngu.jpg' },
  { key: 'soiTri', name: 'Sói tri', fileName: 'soi_tri.jpg' },
  { key: 'hunter', name: 'Thợ săn', fileName: 'hunter.jpg' },
];

export const MODE_WOLF_ROLE_KEYS: Record<GameMode, SpecialRoleKey[]> = {
  ultimate: ['soiNguyen', 'soiNguoi', 'soiCon', 'phanBoi'],
  character: ['soiNguyen', 'soiBanSoi', 'soiNgu', 'soiTri'],
};

export const MODE_ROLE_KEYS: Record<GameMode, SpecialRoleKey[]> = {
  ultimate: [
    'phanBoi',
    'soiNguyen',
    'soiNguoi',
    'baoVe',
    'tietLo',
    'phuThuy',
    'tienTri',
    'cungCoi',
    'hoangTu',
    'tuSi',
    'tamLinh',
    'thauCam',
    'matNgu',
    'soiCon',
    'lieu',
  ],
  character: [
    'soiNguyen',
    'baoVe',
    'phuThuy',
    'tienTri',
    'hoangTu',
    'cao',
    'gau',
    'giaLang',
    'lieu',
    'nhanBan',
    'sinhDoi',
    'soiBanSoi',
    'soiNgu',
    'soiTri',
    'hunter',
  ],
};

const BASE_FILE_MAP: Record<string, string> = {
  'Sói': 'soi_thuong.jpg',
  'Dân': 'dan.jpg',
};

@Injectable({ providedIn: 'root' })
export class GameConfigService {
  private currentMode: GameMode = 'ultimate';
  private configs: Record<GameMode, RoleConfig | null> = {
    ultimate: null,
    character: null,
  };
  private histories: Record<GameMode, HistoryItem[]> = {
    ultimate: [],
    character: [],
  };
  private orderSeqs: Record<GameMode, number> = {
    ultimate: 0,
    character: 0,
  };

  setMode(mode: GameMode) {
    this.currentMode = mode;
  }

  getMode(): GameMode {
    return this.currentMode;
  }

  getRolesForMode(mode: GameMode = this.currentMode): SpecialRoleDef[] {
    const allowedKeys = MODE_ROLE_KEYS[mode];
    return SPECIAL_ROLE_DEFS.filter(role => allowedKeys.indexOf(role.key) >= 0);
  }

  getWolfRolesForMode(mode: GameMode = this.currentMode): SpecialRoleDef[] {
    const allowedKeys = MODE_ROLE_KEYS[mode];
    const wolfKeys = MODE_WOLF_ROLE_KEYS[mode];
    return SPECIAL_ROLE_DEFS.filter(role => {
      return allowedKeys.indexOf(role.key) >= 0 && wolfKeys.indexOf(role.key) >= 0;
    });
  }

  getVillagerRolesForMode(mode: GameMode = this.currentMode): SpecialRoleDef[] {
    const allowedKeys = MODE_ROLE_KEYS[mode];
    const wolfKeys = MODE_WOLF_ROLE_KEYS[mode];
    return SPECIAL_ROLE_DEFS.filter(role => {
      return allowedKeys.indexOf(role.key) >= 0 && wolfKeys.indexOf(role.key) < 0;
    });
  }

  isWolfCardName(name: string, mode: GameMode = this.currentMode): boolean {
    if (name === 'Sói') return true;
    return this.getWolfRolesForMode(mode).some(role => role.name === name);
  }

  setConfig(cfg: RoleConfig, mode: GameMode = this.currentMode) {
    this.configs[mode] = { ...cfg };
  }

  getConfig(mode: GameMode = this.currentMode): RoleConfig | null {
    const cfg = this.configs[mode];
    return cfg ? { ...cfg } : null;
  }

  buildDeck(mode: GameMode = this.currentMode): Card[] {
    const config = this.configs[mode];
    if (!config) return [];

    const deck: Card[] = [];

    for (let i = 0; i < (config.soi || 0); i++) {
      deck.push({ name: 'Sói', img: this.imgOf('Sói') });
    }

    for (let i = 0; i < (config.dan || 0); i++) {
      deck.push({ name: 'Dân', img: this.imgOf('Dân') });
    }

    this.getRolesForMode(mode).forEach(role => {
      if (config[role.key]) {
        deck.push({ name: role.name, img: this.imgOf(role.name) });
      }
    });

    return deck;
  }

  addHistory(card: Card, mode: GameMode = this.currentMode) {
    this.histories[mode].push({
      order: ++this.orderSeqs[mode],
      card,
      at: new Date(),
    });
  }

  updateHistoryName(order: number, name: string, mode: GameMode = this.currentMode) {
    const item = this.histories[mode].find(x => x.order === order);
    if (item) item.playerName = name;
  }

  getHistory(mode: GameMode = this.currentMode): HistoryItem[] {
    return this.histories[mode].slice();
  }

  clearHistory(mode: GameMode = this.currentMode) {
    this.histories[mode] = [];
    this.orderSeqs[mode] = 0;
  }

  private imgOf(name: string): string {
    const special = SPECIAL_ROLE_DEFS.find(role => role.name === name);
    if (special) return `assets/card2/${special.fileName}`;
    return `assets/card2/${BASE_FILE_MAP[name] || 'dan.jpg'}`;
  }
}
