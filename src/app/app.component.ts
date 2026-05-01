import { Component, OnInit } from '@angular/core';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss']
})
export class AppComponent implements OnInit {
  title = 'first-angular-app';
  loading = true;
  loadingPercent = 0;

  private readonly preloadSources: string[] = [
    'assets/cards/back2.jpg',
    'assets/cards/matsauback.jpg',
    'assets/card2/baove.jpg',
    'assets/card2/cao.jpg',
    'assets/card2/cungcoi.jpg',
    'assets/card2/dan.jpg',
    'assets/card2/gau.jpg',
    'assets/card2/gialang.jpg',
    'assets/card2/hoangtu.jpg',
    'assets/card2/hunter.jpg',
    'assets/card2/lieu.jpg',
    'assets/card2/matngu.jpg',
    'assets/card2/nhanban.jpg',
    'assets/card2/phanboi.jpg',
    'assets/card2/phuthuy.jpg',
    'assets/card2/sinhdoi.jpg',
    'assets/card2/soi_bansoi.jpg',
    'assets/card2/soi_con.jpg',
    'assets/card2/soi_ngu.jpg',
    'assets/card2/soi_nguoi.jpg',
    'assets/card2/soi_nguyen.jpg',
    'assets/card2/soi_thuong.jpg',
    'assets/card2/soi_tri.jpg',
    'assets/card2/tamlinh.jpg',
    'assets/card2/thaucam.jpg',
    'assets/card2/tientri.jpg',
    'assets/card2/tietlo.jpg',
    'assets/card2/tusi.jpg',
  ];

  ngOnInit(): void {
    this.preloadAllImages();
  }

  private preloadAllImages(): void {
    const sources = this.preloadSources.slice();
    const total = sources.length;

    if (!total) {
      this.loadingPercent = 100;
      this.loading = false;
      return;
    }

    let loaded = 0;
    const onDone = () => {
      loaded++;
      this.loadingPercent = Math.min(100, Math.round((loaded / total) * 100));
      if (loaded >= total) {
        this.loading = false;
      }
    };

    sources.forEach(src => {
      const image = new Image();
      image.onload = onDone;
      image.onerror = onDone;
      image.src = src;
    });
  }
}
