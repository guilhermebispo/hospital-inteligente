import { Component, OnDestroy, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { ToastrService } from 'ngx-toastr';
import { AuthService } from '../../security/auth.service';
import { DialogService } from '../dialog/dialog.service';
import { SenhaFormComponent } from './senha-form/senha-form.component';
import { UsuarioService } from '../../services/usuario.service';
import { Usuario } from '../../models/usuario';
import { TranslateService } from '@ngx-translate/core';
import { Subscription } from 'rxjs';

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

  usuario!: string;
  usuarioId?: string;
  perfil!: string;
  role!: string;
  menuAberto = false;
  currentLanguage: SupportedLanguage = 'pt-BR';
  readonly languages: LanguageOption[] = [
    { code: 'pt-BR', flag: 'assets/flags/pt.svg', labelKey: 'app.language.pt-BR' },
    { code: 'en', flag: 'assets/flags/en.svg', labelKey: 'app.language.en' }
  ];
  private perfilLabelPadrao?: string;
  private langChangeSub?: Subscription;

  constructor(
    private router: Router,
    private usuarioService: UsuarioService,
    private authService: AuthService,
    private dialogService: DialogService,
    private toastrService: ToastrService,
    private translateService: TranslateService
  ) { }

  ngOnInit(): void {
    this.currentLanguage = this.resolveCurrentLanguage();
    this.langChangeSub = this.translateService.onLangChange.subscribe(({ lang }) => {
      this.currentLanguage = this.normalizeLanguage(lang) ?? 'pt-BR';
      this.atualizarRoleTraduzida();
    });

    this.router.navigate(['home']);

    const email = this.authService.getUser()?.email || this.authService.getUserName();

    this.usuarioService.buscarPorEmail(email).subscribe({
      next: (res: Usuario) => {
        this.usuarioId = res.id;
        this.usuario = res.nome;
        this.perfil = res.perfil.code;
        this.perfilLabelPadrao = res.perfil.label;
        this.atualizarRoleTraduzida();
      },
      error: (err) => {
        this.toastrService.error(this.translateService.instant('nav.errors.loadUser'));
      }
    });
  }

  ngOnDestroy(): void {
    this.langChangeSub?.unsubscribe();
  }

  toggleMenu(): void {
    this.menuAberto = !this.menuAberto;
  }

  closeMenu(): void {
    this.menuAberto = false;
  }

  alterarSenha(): void {
    this.dialogService.openForm({
      formComponent: SenhaFormComponent,
      title: this.translateService.instant('nav.menu.changePassword').toUpperCase(),
    }).subscribe((result: any) => {
      if (result?.senha && this.usuarioId) {
        this.usuarioService.atualizarSenha(this.usuarioId, result.senha).subscribe({
          next: () => {
            this.toastrService.success(this.translateService.instant('auth.messages.passwordChanged'));
          },
          error: () => this.toastrService.error(this.translateService.instant('auth.errors.changePassword'))
        });
      } else if (!this.usuarioId) {
        this.toastrService.error(this.translateService.instant('auth.errors.fetchUser'));
      }
    });
  }

  logout() {
    this.closeMenu();
    this.router.navigate(['login']);
    this.authService.logout();
    this.toastrService.info(this.translateService.instant('auth.messages.logout'));
  }

  changeLanguage(lang: SupportedLanguage): void {
    const normalized = this.normalizeLanguage(lang) ?? 'pt-BR';
    this.currentLanguage = normalized;
    this.translateService.use(normalized);
    localStorage.setItem('app_lang', normalized);
    this.atualizarRoleTraduzida();
  }

  get currentLanguageFlag(): string {
    return (
      this.languages.find((lang) => lang.code === this.currentLanguage)?.flag ??
      this.languages[0].flag
    );
  }

  private resolveCurrentLanguage(): SupportedLanguage {
    const stored = localStorage.getItem('app_lang');
    const normalizedStored = this.normalizeLanguage(stored);
    if (normalizedStored) {
      return normalizedStored;
    }

    const current = this.normalizeLanguage(this.translateService.currentLang);
    if (current) {
      return current;
    }

    const fallback = this.normalizeLanguage(this.translateService.getDefaultLang());
    return fallback ?? 'pt-BR';
  }

  private isSupported(lang: string): lang is SupportedLanguage {
    return this.languages.some((opt) => opt.code === lang);
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

  private atualizarRoleTraduzida(): void {
    if (!this.perfil) {
      return;
    }

    const roleKey = `users.roles.${this.perfil}`;
    const translatedRole = this.translateService.instant(roleKey);
    this.role = translatedRole === roleKey ? (this.perfilLabelPadrao ?? this.perfil) : translatedRole;
  }
}
