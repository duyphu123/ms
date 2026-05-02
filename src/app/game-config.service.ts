import { Injectable } from '@angular/core';

export type GameMode = 'ultimate' | 'character';

export interface HistoryItem {
  order: number;
  card: Card;
  at: Date;
  playerName?: string;
}

export type CardTeam = 'wolf' | 'villager';

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
  team?: CardTeam;
  custom?: boolean;
}

export interface ExtraCardDef {
  id: string;
  name: string;
  team: CardTeam;
  img: string;
  enabled: boolean;
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
    'hunter',
    'cao',
    'gau',
    'giaLang',
    'lieu',
    'nhanBan',
    'sinhDoi',
    'soiBanSoi',
    'soiNgu',
    'soiTri',
    'hoangTu',
  ],
};

const ROLE_CARD_COPIES: Partial<Record<GameMode, Partial<Record<SpecialRoleKey, number>>>> = {
  character: {
    sinhDoi: 2,
  },
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
  private extraCards: Record<GameMode, Record<CardTeam, ExtraCardDef[]>> = {
    ultimate: { wolf: [], villager: [] },
    character: { wolf: [], villager: [] },
  };

  setMode(mode: GameMode) {
    this.currentMode = mode;
  }

  getMode(): GameMode {
    return this.currentMode;
  }

  getRolesForMode(mode: GameMode = this.currentMode): SpecialRoleDef[] {
    const allowedKeys = MODE_ROLE_KEYS[mode];
    return allowedKeys
      .map(key => SPECIAL_ROLE_DEFS.find(role => role.key === key))
      .filter((role): role is SpecialRoleDef => !!role);
  }

  getWolfRolesForMode(mode: GameMode = this.currentMode): SpecialRoleDef[] {
    const wolfKeys = MODE_WOLF_ROLE_KEYS[mode];
    return this.getRolesForMode(mode).filter(role => wolfKeys.indexOf(role.key) >= 0);
  }

  getVillagerRolesForMode(mode: GameMode = this.currentMode): SpecialRoleDef[] {
    const wolfKeys = MODE_WOLF_ROLE_KEYS[mode];
    return this.getRolesForMode(mode).filter(role => wolfKeys.indexOf(role.key) < 0);
  }

  isWolfCardName(name: string, mode: GameMode = this.currentMode): boolean {
    if (name === 'Sói') return true;
    if (this.getExtraCards('wolf', mode).some(card => card.enabled && card.name === name)) return true;
    return this.getWolfRolesForMode(mode).some(role => role.name === name);
  }

  getRoleCopies(key: SpecialRoleKey, mode: GameMode = this.currentMode): number {
    const copiesByMode = ROLE_CARD_COPIES[mode];
    if (!copiesByMode) return 1;
    return copiesByMode[key] || 1;
  }

  getExtraCards(team: CardTeam, mode: GameMode = this.currentMode): ExtraCardDef[] {
    return this.extraCards[mode][team].map(card => ({ ...card }));
  }

  addExtraCard(name: string, team: CardTeam, mode: GameMode = this.currentMode): ExtraCardDef | null {
    const trimmed = (name || '').trim().slice(0, 16);
    if (!trimmed) return null;

    const card: ExtraCardDef = {
      id: `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
      name: trimmed,
      team,
      img: this.buildExtraCardImage(trimmed, team),
      enabled: true,
    };

    this.extraCards[mode][team] = this.extraCards[mode][team].concat(card);
    return { ...card };
  }

  setExtraCardEnabled(id: string, team: CardTeam, enabled: boolean, mode: GameMode = this.currentMode) {
    this.extraCards[mode][team] = this.extraCards[mode][team].map(card =>
      card.id === id ? { ...card, enabled } : card
    );
  }

  clearExtraCards(mode: GameMode = this.currentMode) {
    this.extraCards[mode] = { wolf: [], villager: [] };
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
      deck.push({ name: 'Sói', img: this.imgOf('Sói'), team: 'wolf' });
    }

    for (let i = 0; i < (config.dan || 0); i++) {
      deck.push({ name: 'Dân', img: this.imgOf('Dân'), team: 'villager' });
    }

    this.getRolesForMode(mode).forEach(role => {
      if (config[role.key]) {
        const copies = this.getRoleCopies(role.key, mode);
        for (let i = 0; i < copies; i++) {
          deck.push({
            name: role.name,
            img: this.imgOf(role.name),
            team: this.getWolfRolesForMode(mode).some(wolfRole => wolfRole.key === role.key) ? 'wolf' : 'villager'
          });
        }
      }
    });

    this.getExtraCards('wolf', mode).filter(card => card.enabled).forEach(card => {
      deck.push({ name: card.name, img: card.img, team: 'wolf', custom: true });
    });

    this.getExtraCards('villager', mode).filter(card => card.enabled).forEach(card => {
      deck.push({ name: card.name, img: card.img, team: 'villager', custom: true });
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

  private buildExtraCardImage(name: string, team: CardTeam): string {
    const safeName = (name || '').slice(0, 16);
    const sideLabel = team === 'wolf' ? 'PHE SOI' : 'PHE DAN';
    const accent = team === 'wolf' ? '#ff8f8f' : '#8fffa8';
    const accentSoft = team === 'wolf' ? '#55252a' : '#214232';
    const border = team === 'wolf' ? '#8f2f2f' : '#2f8f52';
    const glow = team === 'wolf' ? 'rgba(255,143,143,0.28)' : 'rgba(143,255,168,0.24)';
    const titleLines = this.buildExtraCardTitleLines(safeName);

    const svg = `
      <svg xmlns="http://www.w3.org/2000/svg" width="240" height="360" viewBox="0 0 240 360">
        <defs>
          <linearGradient id="bg" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stop-color="#262127"/>
            <stop offset="50%" stop-color="#16171d"/>
            <stop offset="100%" stop-color="#0d0f14"/>
          </linearGradient>
          <linearGradient id="frame" x1="0" y1="0" x2="1" y2="1">
            <stop offset="0%" stop-color="#d9c8a1"/>
            <stop offset="45%" stop-color="#9d8760"/>
            <stop offset="100%" stop-color="#e9dbb8"/>
          </linearGradient>
          <filter id="softGlow" x="-20%" y="-20%" width="140%" height="140%">
            <feDropShadow dx="0" dy="0" stdDeviation="8" flood-color="${glow}"/>
          </filter>
        </defs>
        <rect x="8" y="8" width="224" height="344" rx="18" fill="#0c0d11" stroke="url(#frame)" stroke-width="6"/>
        <rect x="16" y="16" width="208" height="328" rx="14" fill="url(#bg)" stroke="${border}" stroke-width="1.8"/>
        <rect x="26" y="26" width="188" height="308" rx="10" fill="rgba(255,255,255,0.02)" stroke="rgba(255,255,255,0.08)" stroke-width="1.1"/>
        <rect x="38" y="40" width="164" height="28" rx="14" fill="${accentSoft}" opacity="0.95"/>
        <text x="120" y="59" text-anchor="middle" fill="${accent}" font-size="13" font-family="Arial, sans-serif" font-weight="700" letter-spacing="1.3">${sideLabel}</text>
        <g filter="url(#softGlow)">
          <circle cx="120" cy="180" r="56" fill="${accentSoft}" opacity="0.72"/>
        </g>
        <text x="120" y="170" text-anchor="middle" fill="#f5efe7" font-size="22" font-family="Arial, sans-serif" font-weight="800">
          ${titleLines}
        </text>
        <path d="M68 250 L120 224 L172 250" fill="none" stroke="${accent}" stroke-width="2.4" stroke-linecap="round" opacity="0.75"/>
        <path d="M78 262 L120 242 L162 262" fill="none" stroke="rgba(255,255,255,0.26)" stroke-width="1.3" stroke-linecap="round"/>
        <text x="120" y="306" text-anchor="middle" fill="rgba(255,255,255,0.36)" font-size="11" font-family="Arial, sans-serif" font-weight="700" letter-spacing="2">CUSTOM CARD</text>
      </svg>
    `;

    return `data:image/svg+xml;charset=UTF-8,${encodeURIComponent(svg)}`;
  }

  private buildExtraCardTitleLines(name: string): string {
    const words = name.trim().split(/\s+/).filter(Boolean);
    if (!words.length) return '';

    const lines: string[] = [];
    let current = '';

    words.forEach(word => {
      const next = current ? `${current} ${word}` : word;
      if (next.length <= 8 || !current) {
        current = next;
        return;
      }
      lines.push(current);
      current = word;
    });

    if (current) lines.push(current);

    const limited = lines.slice(0, 2);
    if (limited.length === 1) {
      return `<tspan x="120" dy="0">${this.escapeSvgText(limited[0])}</tspan>`;
    }

    return limited
      .map((line, index) => `<tspan x="120" dy="${index === 0 ? 0 : 28}">${this.escapeSvgText(line)}</tspan>`)
      .join('');
  }

  private escapeSvgText(value: string): string {
    return value
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;');
  }
}
