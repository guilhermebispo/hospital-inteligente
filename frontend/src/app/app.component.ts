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
    this.translateService.addLangs(['pt-BR', 'en']);
    this.translateService.setDefaultLang('pt-BR');

    const storedLang = localStorage.getItem('app_lang');
    const browserLang = this.translateService.getBrowserLang();
    const normalizedBrowserLang = this.normalizeLanguage(browserLang);
    const fallback = normalizedBrowserLang ?? 'pt-BR';
    const normalizedStored = this.normalizeLanguage(storedLang);
    const langToUse = normalizedStored ?? fallback;

    this.translateService.use(langToUse);
    this.translateService.stream('app.name').subscribe((name) => {
      this.title = name;
    });
  }

  private normalizeLanguage(lang: string | null | undefined): 'pt-BR' | 'en' | null {
    if (!lang) {
      return null;
    }

    const lowered = lang.toLowerCase();
    if (lowered === 'en' || lowered.startsWith('en-')) {
      return 'en';
    }

    if (lowered === 'pt' || lowered === 'pt-br' || lowered.startsWith('pt-')) {
      return 'pt-BR';
    }

    return null;
  }
}
