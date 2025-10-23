import { Component, OnDestroy, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { ToastrService } from 'ngx-toastr';
import { Credencial } from '../../models/credencial';
import { AuthService } from '../../security/auth.service';
import { HttpResponse } from '@angular/common/http';
import { TranslateService } from '@ngx-translate/core';
import { Subscription } from 'rxjs';

type SupportedLanguage = 'pt-BR' | 'en';

interface LanguageOption {
  code: SupportedLanguage;
  flag: string;
  labelKey: string;
}

@Component({
  selector: 'app-login',
  standalone: false,
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.scss']
})
export class LoginComponent implements OnInit, OnDestroy {

  loginForm!: FormGroup;
  hide = true;
  currentLanguage: SupportedLanguage = 'pt-BR';
  readonly languages: LanguageOption[] = [
    { code: 'pt-BR', flag: 'assets/flags/pt.svg', labelKey: 'app.language.pt-BR' },
    { code: 'en', flag: 'assets/flags/en.svg', labelKey: 'app.language.en' }
  ];
  private langChangeSub?: Subscription;

  constructor(
    private fb: FormBuilder,
    private toast: ToastrService,
    private service: AuthService,
    private router: Router,
    private translate: TranslateService
  ) { }

  ngOnInit(): void {
    this.loginForm = this.fb.group({
      email: ['', [Validators.required, Validators.email]],
      senha: ['', [Validators.required, Validators.minLength(6)]]
    });

    this.currentLanguage = this.resolveCurrentLanguage();
    this.langChangeSub = this.translate.onLangChange.subscribe(({ lang }) => {
      this.currentLanguage = this.normalizeLanguage(lang) ?? 'pt-BR';
    });
  }

  ngOnDestroy(): void {
    this.langChangeSub?.unsubscribe();
  }

  logar(): void {
    if (this.loginForm.invalid) {
      this.toast.warning(this.translate.instant('login.messages.fillFields'));
      return;
    }

    const creds: Credencial = this.loginForm.value;

    this.service.authenticate(creds).subscribe({
      next: (resposta: HttpResponse<any>) => {
        const authHeader = (resposta.headers.get('Authorization') ?? '').trim();
        const headerToken = authHeader.replace(/^Bearer\s+/i, '').trim();

        const body: any = resposta.body ?? {};
        const bodyToken = (body.token ?? body.access_token ?? '').toString().trim();

        const token = headerToken || bodyToken;

        if (token) {
          this.service.successfulLogin(token);

          this.router.navigateByUrl('/', { replaceUrl: true });
        } else {
          this.toast.error(this.translate.instant('login.messages.tokenError'));
        }
      },
      error: (err) => {
        const errorMessage = err?.error?.message || this.translate.instant('login.messages.invalidCredentials');
        this.toast.error(errorMessage);
      }
    });

  }

  get email() {
    return this.loginForm.get('email');
  }

  get senha() {
    return this.loginForm.get('senha');
  }

  validaCampos(): boolean {
    return this.loginForm.valid;
  }

  changeLanguage(lang: SupportedLanguage): void {
    const normalized = this.normalizeLanguage(lang) ?? 'pt-BR';
    this.currentLanguage = normalized;
    this.translate.use(normalized);
    localStorage.setItem('app_lang', normalized);
  }

  get currentLanguageFlag(): string {
    return (
      this.languages.find((lang) => lang.code === this.currentLanguage)?.flag ??
      this.languages[0].flag
    );
  }

  private resolveCurrentLanguage(): SupportedLanguage {
    const stored = this.normalizeLanguage(localStorage.getItem('app_lang'));
    if (stored) {
      return stored;
    }

    const current = this.normalizeLanguage(this.translate.currentLang);
    if (current) {
      return current;
    }

    const fallback = this.normalizeLanguage(this.translate.getDefaultLang());
    return fallback ?? 'pt-BR';
  }

  private isSupported(lang: string): lang is SupportedLanguage {
    return this.languages.some((option) => option.code === lang);
  }

  private normalizeLanguage(lang: string | null | undefined): SupportedLanguage | null {
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

    return this.isSupported(lang) ? (lang as SupportedLanguage) : null;
  }
}
