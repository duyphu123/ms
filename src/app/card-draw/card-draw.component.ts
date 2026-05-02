import { Component, ElementRef, OnInit, ViewChild } from '@angular/core';
import { Router } from '@angular/router';
import { Card, GameConfigService } from '../game-config.service';

@Component({
  selector: 'app-card-draw',
  templateUrl: './card-draw.component.html',
  styleUrls: ['./card-draw.component.scss']
})
export class CardDrawComponent implements OnInit {
  queue: Card[] = [];
  revealed: Card | null = null;
  showDoneModal = false;
  readonly backImg = 'assets/cards/back2.jpg';
  @ViewChild('hideButton') hideButton?: ElementRef;
  @ViewChild('actionAnchor') actionAnchor?: ElementRef;

  private currentMode = this.cfg.getMode();

  constructor(private cfg: GameConfigService, private router: Router) {}

  ngOnInit(): void {
    const config = this.cfg.getConfig();
    if (!config) {
      this.router.navigateByUrl('/cau-hinh');
      return;
    }

    this.currentMode = this.cfg.getMode();
    const full = this.cfg.buildDeck();
    this.queue = this.shuffleBalanced(full);
    this.revealed = null;
    this.showDoneModal = false;
    this.preloadFrontImages();
    setTimeout(() => this.scrollToActionZone(), 0);
  }

  get remaining(): number {
    return this.queue.length + (this.revealed ? 1 : 0);
  }

  onClickBack() {
    if (this.revealed) return;
    if (this.queue.length === 0) {
      this.openDoneModal();
      return;
    }

    const card = this.queue.shift()!;
    this.revealed = card;
    this.cfg.addHistory(card);
    setTimeout(() => this.scrollToActionZone(), 0);
  }

  hideCurrent() {
    if (!this.revealed) return;
    this.revealed = null;
    if (this.queue.length === 0) this.openDoneModal();
  }

  resetDeck() {
    const config = this.cfg.getConfig();
    if (!config) return;

    this.currentMode = this.cfg.getMode();
    const full = this.cfg.buildDeck();
    this.queue = this.shuffleBalanced(full);
    this.revealed = null;
    this.showDoneModal = false;
    this.preloadFrontImages();
  }

  getCounts(): Array<{ name: string; count: number }> {
    const map = new Map<string, number>();
    this.queue.forEach(c => map.set(c.name, (map.get(c.name) || 0) + 1));
    return Array.from(map.entries()).map(([name, count]) => ({ name, count }));
  }

  private preloadFrontImages() {
    const set = new Set(this.queue.map(c => c.img));
    set.forEach(src => {
      const i = new Image();
      i.src = src;
    });
  }

  onImgError(e: Event) {
    (e.target as HTMLImageElement).src = 'assets/card2/dan.jpg';
  }

  private isWolfCard(name: string): boolean {
    return this.cfg.isWolfCardName(name, this.currentMode);
  }

  private isTwinCard(card: Card): boolean {
    return /sinhdoi\.jpg$/i.test(card.img || '');
  }

  private adjacencyPenalty(deck: Card[]): number {
    let score = 0;
    let run = 1;
    const sameGroup = (a: Card, b: Card) => this.isWolfCard(a.name) === this.isWolfCard(b.name);

    for (let i = 1; i < deck.length; i++) {
      if (this.isTwinCard(deck[i]) && this.isTwinCard(deck[i - 1])) {
        score += 50;
      }

      if (sameGroup(deck[i], deck[i - 1])) {
        run++;
        if (run === 3) score += 2;
        else if (run >= 4) score += 5;
      } else {
        run = 1;
      }
    }

    return score;
  }

  private shuffleBalanced(input: Card[], tries = 200): Card[] {
    const candidates: Array<{ deck: Card[]; score: number }> = [];
    let bestScore = Number.POSITIVE_INFINITY;

    for (let t = 0; t < tries; t++) {
      const shuffled = input.slice();
      for (let i = shuffled.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
      }

      const score = this.adjacencyPenalty(shuffled);
      candidates.push({ deck: shuffled, score });
      if (score < bestScore) {
        bestScore = score;
      }
    }

    const acceptableThreshold = bestScore + 2;
    const acceptable = candidates.filter(candidate => candidate.score <= acceptableThreshold);
    const pool = acceptable.length ? acceptable : candidates;
    const picked = pool[Math.floor(Math.random() * pool.length)];
    return picked ? picked.deck : input.slice();
  }

  goBack() {
    this.router.navigateByUrl('/cau-hinh');
  }

  goToHistory() {
    this.router.navigate(['/cau-hinh'], { queryParams: { tab: 'history' } });
  }

  closeDoneModal() {
    this.showDoneModal = false;
  }

  private openDoneModal() {
    this.showDoneModal = true;
  }

  private scrollToActionZone() {
    const anchor = this.hideButton || this.actionAnchor;
    if (!anchor) return;

    const rect = anchor.nativeElement.getBoundingClientRect();
    const viewportHeight = window.innerHeight || document.documentElement.clientHeight || 0;
    const targetTop = window.pageYOffset + rect.bottom - viewportHeight + 24;

    window.scrollTo({
      top: Math.max(0, Math.round(targetTop)),
      behavior: 'smooth'
    });
  }
}
