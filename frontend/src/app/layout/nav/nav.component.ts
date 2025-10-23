import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { ToastrService } from 'ngx-toastr';
import { AuthService } from '../../security/auth.service';
import { DialogService } from '../dialog/dialog.service';
import { SenhaFormComponent } from './senha-form/senha-form.component';
import { UsuarioService } from '../../services/usuario.service';
import { Usuario } from '../../models/usuario';
import { TranslateService } from '@ngx-translate/core';

@Component({
  selector: 'app-nav',
  standalone: false,
  templateUrl: './nav.component.html',
  styleUrls: ['./nav.component.scss']
})
export class NavComponent implements OnInit {

  usuario!: string;
  perfil!: string;
  role!: string;
  menuAberto = false;

  constructor(
    private router: Router,
    private usuarioService: UsuarioService,
    private authService: AuthService,
    private dialogService: DialogService,
    private toastrService: ToastrService,
    private translateService: TranslateService
  ) { }

  ngOnInit(): void {
    this.router.navigate(['home']);

    const email = this.authService.getUser()?.email || this.authService.getUserName();

    this.usuarioService.buscarPorEmail(email).subscribe({
      next: (res: Usuario) => {
        this.usuario = res.nome;
        this.perfil = res.perfil.code;
        const roleKey = `users.roles.${res.perfil.code}`;
        const translatedRole = this.translateService.instant(roleKey);
        this.role = translatedRole === roleKey ? res.perfil.label : translatedRole;
      },
      error: (err) => {
        this.toastrService.error(this.translateService.instant('nav.errors.loadUser'));
      }
    });
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
      if (result) {
        this.usuarioService.atualizarSenha('', result.perfil).subscribe({
          next: () => {
            this.toastrService.success(this.translateService.instant('auth.messages.passwordChanged'));
          },
          error: () => this.toastrService.error(this.translateService.instant('auth.errors.changePassword'))
        });
      }
    });
  }

  logout() {
    this.closeMenu();
    this.router.navigate(['login']);
    this.authService.logout();
    this.toastrService.info(this.translateService.instant('auth.messages.logout'));
  }

  changeLanguage(lang: 'pt' | 'en'): void {
    this.translateService.use(lang);
    localStorage.setItem('app_lang', lang);
    if (this.perfil) {
      const roleKey = `users.roles.${this.perfil}`;
      const translatedRole = this.translateService.instant(roleKey);
      this.role = translatedRole === roleKey ? this.role : translatedRole;
    }
  }
}
