import { AfterViewInit, Component, ElementRef, HostListener, ViewChild } from '@angular/core';
import { AbstractControl, FormArray, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { debounceTime, distinctUntilChanged } from 'rxjs/operators';
import { Subscription } from 'rxjs';
import {
  GameConfigService,
  GameMode,
  HistoryItem,
  MODE_ROLE_KEYS,
  MODE_WOLF_ROLE_KEYS,
  RoleConfig,
  SPECIAL_ROLE_DEFS,
  SpecialRoleDef,
  SpecialRoleKey,
} from '../game-config.service';

interface ConfirmCardItem {
  name: string;
  img: string;
  count?: number;
}

@Component({
  selector: 'app-role-config',
  templateUrl: './role-config.component.html',
  styleUrls: ['./role-config.component.scss']
})
export class RoleConfigComponent implements AfterViewInit {
  form: FormGroup;
  activeMode: GameMode = 'ultimate';
  activeTab: 'config' | 'history' = 'config';
  history: HistoryItem[] = [];
  showConfirmModal = false;
  configPanelHeight = 0;
  configPanelTop = 0;

  readonly modeTabs: Array<{ key: GameMode; label: string }> = [
    { key: 'ultimate', label: 'Ultimate' },
    { key: 'character', label: 'Character' },
  ];

  private sub?: Subscription;
  private defaults: RoleConfig = {
    soi: 0,
    dan: 0,
    phanBoi: false,
    soiNguyen: true,
    soiNguoi: true,
    baoVe: true,
    tietLo: true,
    phuThuy: true,
    tienTri: true,
    cungCoi: true,
    hoangTu: false,
    tuSi: false,
    tamLinh: false,
    thauCam: false,
    matNgu: false,
    soiCon: false,
    cao: false,
    gau: false,
    giaLang: false,
    lieu: false,
    nhanBan: false,
    sinhDoi: false,
    soiBanSoi: false,
    soiNgu: false,
    soiTri: false,
    hunter: false,
  };

  constructor(
    private fb: FormBuilder,
    private router: Router,
    private gameCfg: GameConfigService
  ) {
    this.form = this.fb.group({
      soi: [this.defaults.soi, [Validators.required, Validators.min(0)]],
      dan: [this.defaults.dan, [Validators.required, Validators.min(0)]],
      phanBoi: [this.defaults.phanBoi],
      soiNguyen: [this.defaults.soiNguyen],
      soiNguoi: [this.defaults.soiNguoi],
      baoVe: [this.defaults.baoVe],
      tietLo: [this.defaults.tietLo],
      phuThuy: [this.defaults.phuThuy],
      tienTri: [this.defaults.tienTri],
      cungCoi: [this.defaults.cungCoi],
      hoangTu: [this.defaults.hoangTu],
      tuSi: [this.defaults.tuSi],
      tamLinh: [this.defaults.tamLinh],
      thauCam: [this.defaults.thauCam],
      matNgu: [this.defaults.matNgu],
      soiCon: [this.defaults.soiCon],
      cao: [this.defaults.cao],
      gau: [this.defaults.gau],
      giaLang: [this.defaults.giaLang],
      lieu: [this.defaults.lieu],
      nhanBan: [this.defaults.nhanBan],
      sinhDoi: [this.defaults.sinhDoi],
      soiBanSoi: [this.defaults.soiBanSoi],
      soiNgu: [this.defaults.soiNgu],
      soiTri: [this.defaults.soiTri],
      hunter: [this.defaults.hunter],
    });
  }

  @ViewChild('tabsAnchor') tabsAnchor?: ElementRef;
  @ViewChild('configPanel') configPanel?: ElementRef;

  get wolfRoles(): SpecialRoleDef[] {
    const wolfKeys = MODE_WOLF_ROLE_KEYS[this.activeMode];
    const allowedKeys = MODE_ROLE_KEYS[this.activeMode];
    return SPECIAL_ROLE_DEFS.filter(role => {
      return allowedKeys.indexOf(role.key) >= 0 && wolfKeys.indexOf(role.key) >= 0;
    });
  }

  get villagerRoles(): SpecialRoleDef[] {
    const wolfKeys = MODE_WOLF_ROLE_KEYS[this.activeMode];
    const allowedKeys = MODE_ROLE_KEYS[this.activeMode];
    return SPECIAL_ROLE_DEFS.filter(role => {
      return allowedKeys.indexOf(role.key) >= 0 && wolfKeys.indexOf(role.key) < 0;
    });
  }

  get total(): number {
    const v = this.form.value as RoleConfig;
    const visibleRoles = this.wolfRoles.concat(this.villagerRoles);
    const base = (v.soi || 0) + (v.dan || 0);
    const extra = visibleRoles.reduce((acc, role) => acc + (v[role.key] ? 1 : 0), 0);
    return base + extra;
  }

  get wolfCount(): number {
    const v = this.form.value as RoleConfig;
    return (v.soi || 0) + this.wolfRoles.reduce((acc, role) => acc + (v[role.key] ? 1 : 0), 0);
  }

  get villagerCount(): number {
    const v = this.form.value as RoleConfig;
    return (v.dan || 0) + this.villagerRoles.reduce((acc, role) => acc + (v[role.key] ? 1 : 0), 0);
  }

  get confirmWolfCards(): string[] {
    const v = this.form.value as RoleConfig;
    const cards: string[] = [];
    if (v.soi > 0) cards.push(`Sói thường x${v.soi}`);
    this.wolfRoles.forEach(role => {
      if (v[role.key]) cards.push(role.name);
    });
    return cards;
  }

  get confirmVillagerCards(): string[] {
    const v = this.form.value as RoleConfig;
    const cards: string[] = [];
    if (v.dan > 0) cards.push(`Dân thường x${v.dan}`);
    this.villagerRoles.forEach(role => {
      if (v[role.key]) cards.push(role.name);
    });
    return cards;
  }

  get confirmWolfItems(): ConfirmCardItem[] {
    const v = this.form.value as RoleConfig;
    const items: ConfirmCardItem[] = [];

    if (v.soi > 0) {
      items.push({ name: 'Sói thường', img: this.thumbPath('soi_thuong.jpg'), count: v.soi });
    }

    this.wolfRoles.forEach(role => {
      if (v[role.key]) {
        items.push({ name: role.name, img: this.thumbPath(role.fileName) });
      }
    });

    return items;
  }

  get confirmWolfBaseItems(): ConfirmCardItem[] {
    return this.confirmWolfItems.filter(item => !!item.count);
  }

  get confirmWolfSpecialItems(): ConfirmCardItem[] {
    return this.confirmWolfItems.filter(item => !item.count);
  }

  get confirmVillagerItems(): ConfirmCardItem[] {
    const v = this.form.value as RoleConfig;
    const items: ConfirmCardItem[] = [];

    if (v.dan > 0) {
      items.push({ name: 'Dân thường', img: this.thumbPath('dan.jpg'), count: v.dan });
    }

    this.villagerRoles.forEach(role => {
      if (v[role.key]) {
        items.push({ name: role.name, img: this.thumbPath(role.fileName) });
      }
    });

    return items;
  }

  get confirmVillagerBaseItems(): ConfirmCardItem[] {
    return this.confirmVillagerItems.filter(item => !!item.count);
  }

  get confirmVillagerSpecialItems(): ConfirmCardItem[] {
    return this.confirmVillagerItems.filter(item => !item.count);
  }

  switchMode(mode: GameMode) {
    if (this.activeMode === mode) return;
    this.activeMode = mode;
    this.showConfirmModal = false;
    this.gameCfg.setMode(mode);
    this.loadModeState();
    if (this.activeTab === 'history') this.reloadHistory();
    setTimeout(() => this.measureConfigPanel(), 0);
  }

  switchTab(tab: 'config' | 'history') {
    this.activeTab = tab;
    this.showConfirmModal = false;
    if (tab === 'history') {
      this.reloadHistory();
      return;
    }
    setTimeout(() => this.measureConfigPanel(), 0);
  }

  ngOnInit(): void {
    this.activeMode = this.gameCfg.getMode();
    this.gameCfg.setMode(this.activeMode);
    this.loadModeState();

    this.sub = this.form.valueChanges
      .pipe(debounceTime(200), distinctUntilChanged())
      .subscribe(val => this.gameCfg.setConfig(val as RoleConfig, this.activeMode));

    this.reloadHistory();
  }

  ngAfterViewInit(): void {
    setTimeout(() => this.measureConfigPanel(), 0);
  }

  ngOnDestroy(): void {
    if (this.sub) this.sub.unsubscribe();
  }

  @HostListener('window:scroll')
  onWindowScroll() {
    this.measureConfigPanel();
  }

  @HostListener('window:resize')
  onWindowResize() {
    this.measureConfigPanel();
  }

  private loadModeState() {
    const saved = this.gameCfg.getConfig(this.activeMode);
    if (saved) {
      this.form.patchValue(saved, { emitEvent: false });
      return;
    }

    this.form.reset(this.defaults, { emitEvent: false });
    this.gameCfg.setConfig(this.form.value as RoleConfig, this.activeMode);
  }

  private reloadHistory() {
    this.history = this.gameCfg.getHistory(this.activeMode);
  }

  private measureConfigPanel() {
    if (this.activeTab !== 'config') return;
    if (!this.tabsAnchor || !this.configPanel) return;

    const tabsRect = this.tabsAnchor.nativeElement.getBoundingClientRect();
    const panelRect = this.configPanel.nativeElement.getBoundingClientRect();
    this.configPanelTop = Math.max(8, Math.round(tabsRect.bottom + 8));
    this.configPanelHeight = Math.ceil(panelRect.height);
  }

  private markAllTouched(control: AbstractControl): void {
    if (!control) return;

    if (control instanceof FormGroup) {
      Object.values(control.controls).forEach(c => this.markAllTouched(c));
    } else if (control instanceof FormArray) {
      control.controls.forEach(c => this.markAllTouched(c));
    }

    control.markAsTouched();
    control.updateValueAndValidity();
  }

  numbersOnly(e: KeyboardEvent) {
    const allowed = ['Backspace', 'Delete', 'ArrowLeft', 'ArrowRight', 'Tab', 'Home', 'End'];
    if (allowed.indexOf(e.key) >= 0) return;
    if (!/^\d$/.test(e.key)) e.preventDefault();
  }

  onCountInput(controlName: 'soi' | 'dan', event: Event) {
    const input = event.target as HTMLInputElement;
    const digitsOnly = (input.value || '').replace(/\D+/g, '');
    const normalized = digitsOnly.replace(/^0+(?=\d)/, '');
    const nextValue = normalized === '' ? 0 : Number(normalized);

    if (input.value !== String(nextValue)) {
      input.value = String(nextValue);
    }

    const control = this.form.get(controlName);
    if (control) control.setValue(nextValue, { emitEvent: false });
    this.gameCfg.setConfig(this.form.value as RoleConfig, this.activeMode);
  }

  reset() {
    this.showConfirmModal = false;
    this.form.reset(this.defaults);
    this.gameCfg.setConfig(this.form.value as RoleConfig, this.activeMode);
  }

  confirm() {
    this.markAllTouched(this.form);
    if (this.form.invalid) {
      alert('Vui lòng nhập số hợp lệ cho Sói và Dân.');
      return;
    }

    this.gameCfg.setMode(this.activeMode);
    this.gameCfg.setConfig(this.form.value as RoleConfig, this.activeMode);
    this.showConfirmModal = true;
  }

  closeConfirmModal() {
    this.showConfirmModal = false;
  }

  submitConfirmedGame() {
    this.showConfirmModal = false;
    this.clearHistory();
    this.gameCfg.setMode(this.activeMode);
    this.gameCfg.setConfig(this.form.value as RoleConfig, this.activeMode);
    this.router.navigateByUrl('/chon-bai');
  }

  getRoleClass(name: string): string {
    const n = (name || '').toLowerCase().normalize('NFC');
    if (n.includes('phản bội')) return 'traitor';
    if (n.includes('sói người')) return 'wolf-human';
    if (this.isWolfRoleName(name)) return 'wolf';
    return '';
  }

  onPlayerNameChange(h: HistoryItem) {
    this.gameCfg.updateHistoryName(h.order, h.playerName || '', this.activeMode);
  }

  trackRole(_: number, role: { key: SpecialRoleKey }) {
    return role.key;
  }

  thumbPath(fileName: string): string {
    return `assets/card2/${fileName}`;
  }

  clearHistory() {
    this.gameCfg.clearHistory(this.activeMode);
    this.reloadHistory();
  }

  private isWolfRoleName(name: string): boolean {
    return this.wolfRoles.some(role => role.name === name) || name === 'Sói';
  }
}
