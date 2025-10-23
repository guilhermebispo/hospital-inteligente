import { Component, OnDestroy, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { Subscription } from 'rxjs';
import { ToastrService } from 'ngx-toastr';
import { TranslateService } from '@ngx-translate/core';

import { AuthService } from '../../security/auth.service';
import { DialogService } from '../dialog/dialog.service';
import { PasswordFormComponent } from './password-form/password-form.component';
import { UserService } from '../../services/user.service';
import { User } from '../../models/user';

type SupportedLanguage = 'pt-BR' | 'en';

interface LanguageOption {
  code: SupportedLanguage;
  flag: string;
  labelKey: string;
}

@Component({
  selector: 'app-nav',
  standalone: false,
  templateUrl: './nav.component.html',
  styleUrls: ['./nav.component.scss']
})
export class NavComponent implements OnInit, OnDestroy {
  userName = '';
  userId?: string;
  userRoleCode = '';
  userRoleLabel = '';
  menuOpen = false;
  currentLanguage: SupportedLanguage = 'pt-BR';
  readonly languages: LanguageOption[] = [
    { code: 'pt-BR', flag: 'assets/flags/pt.svg', labelKey: 'app.language.pt-BR' },
    { code: 'en', flag: 'assets/flags/en.svg', labelKey: 'app.language.en' }
  ];

  private languageSubscription?: Subscription;
  private roleFallbackLabel?: string;

  constructor(
    private readonly router: Router,
    private readonly userService: UserService,
    private readonly authService: AuthService,
    private readonly dialogService: DialogService,
    private readonly toastr: ToastrService,
    private readonly translate: TranslateService
  ) {
    this.currentLanguage = this.resolveCurrentLanguage();
    this.languageSubscription = this.translate.onLangChange.subscribe(({ lang }) => {
      this.currentLanguage = this.normalizeLanguage(lang) ?? 'pt-BR';
      this.updateRoleLabel();
    });
  }

  ngOnInit(): void {
    this.router.navigate(['home']);
    this.loadCurrentUser();
  }

  ngOnDestroy(): void {
    this.languageSubscription?.unsubscribe();
  }

  toggleMenu(): void {
    this.menuOpen = !this.menuOpen;
  }

  closeMenu(): void {
    this.menuOpen = false;
  }

  changePassword(): void {
    this.dialogService.openForm({
      formComponent: PasswordFormComponent,
      title: this.translate.instant('nav.menu.changePassword').toUpperCase(),
    }).subscribe((result: any) => {
      if (!result?.password || !this.userId) {
        if (!this.userId) {
          this.toastr.error(this.translate.instant('auth.errors.fetchUser'));
        }
        return;
      }

      this.userService.updatePassword(this.userId, result.password).subscribe({
        next: () => this.toastr.success(this.translate.instant('auth.messages.passwordChanged')),
        error: () => this.toastr.error(this.translate.instant('auth.errors.changePassword'))
      });
    });
  }

  logout(): void {
    this.closeMenu();
    this.router.navigate(['login']);
    this.authService.logout();
    this.toastr.info(this.translate.instant('auth.messages.logout'));
  }

  changeLanguage(language: SupportedLanguage): void {
    const normalized = this.normalizeLanguage(language) ?? 'pt-BR';
    this.currentLanguage = normalized;
    this.translate.use(normalized);
    localStorage.setItem('app_lang', normalized);
    this.updateRoleLabel();
  }

  get currentLanguageFlag(): string {
    return (
      this.languages.find((lang) => lang.code === this.currentLanguage)?.flag ??
      this.languages[0].flag
    );
  }

  private loadCurrentUser(): void {
    const tokenUser = this.authService.getUser();
    const email = tokenUser?.email || tokenUser?.sub;

    if (!email) {
      this.userName = this.translate.instant('home.defaultUser');
      return;
    }

    this.userService.findByEmail(email).subscribe({
      next: (user: User) => {
        this.userId = user.id;
        this.userName = user.name;
        this.userRoleCode = user.role.code;
        this.roleFallbackLabel = user.role.label;
        this.updateRoleLabel();
      },
      error: () => {
        this.userName = email;
        this.toastr.error(this.translate.instant('nav.errors.loadUser'));
      }
    });
  }

  private resolveCurrentLanguage(): SupportedLanguage {
    const stored = localStorage.getItem('app_lang');
    const normalizedStored = this.normalizeLanguage(stored);
    if (normalizedStored) {
      return normalizedStored;
    }

    const current = this.normalizeLanguage(this.translate.currentLang);
    if (current) {
      return current;
    }

    const fallback = this.normalizeLanguage(this.translate.getDefaultLang());
    return fallback ?? 'pt-BR';
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

    return this.languages.some((opt) => opt.code === lang) ? (lang as SupportedLanguage) : null;
  }

  private updateRoleLabel(): void {
    if (!this.userRoleCode) {
      return;
    }

    const roleKey = `users.roles.${this.userRoleCode}`;
    const translatedRole = this.translate.instant(roleKey);
    this.userRoleLabel = translatedRole === roleKey ? (this.roleFallbackLabel ?? this.userRoleCode) : translatedRole;
  }
}
