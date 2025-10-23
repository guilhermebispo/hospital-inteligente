import { Component } from '@angular/core';
import { TranslateService } from '@ngx-translate/core';

@Component({
  selector: 'app-root',
  standalone: false,
  templateUrl: './app.component.html'
})
export class AppComponent {
  title = 'Hospital Inteligente';

  constructor(private translateService: TranslateService) {
    this.translateService.addLangs(['pt', 'en']);
    this.translateService.setDefaultLang('pt');

    const storedLang = localStorage.getItem('app_lang');
    const browserLang = this.translateService.getBrowserLang();
    const fallback = browserLang && ['pt', 'en'].includes(browserLang) ? browserLang : 'pt';
    const langToUse = storedLang && ['pt', 'en'].includes(storedLang) ? storedLang : fallback;

    this.translateService.use(langToUse);
    this.translateService.stream('app.name').subscribe((name) => {
      this.title = name;
    });
  }
}
