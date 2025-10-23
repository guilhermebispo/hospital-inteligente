import { Component, OnDestroy, OnInit } from '@angular/core';
import { AuthService } from '../../security/auth.service';
import { UsuarioService } from '../../services/usuario.service';
import { Usuario } from '../../models/usuario';
import { ToastrService } from 'ngx-toastr';
import { TranslateService } from '@ngx-translate/core';
import { Subscription } from 'rxjs';

@Component({
  selector: 'app-home',
  standalone: false,
  templateUrl: './home.component.html',
  styleUrls: ['./home.component.scss']
})
export class HomeComponent implements OnInit, OnDestroy {

  usuario = '';
  tips: string[] = [];
  private langChangeSub!: Subscription;

  constructor(
    private usuarioService: UsuarioService,
    private toastrService: ToastrService,
    private authService: AuthService,
    private translateService: TranslateService
  ) { }

  ngOnInit(): void {
    this.langChangeSub = this.translateService.onLangChange.subscribe(() => this.carregarDicas());
    this.carregarDicas();
    this.carregarUsuario();
  }

  ngOnDestroy(): void {
    this.langChangeSub?.unsubscribe();
  }

  private carregarDicas(): void {
    this.translateService.get('home.tips.items').subscribe((items) => {
      this.tips = Array.isArray(items) ? items : [];
    });
  }

  private carregarUsuario(): void {
    const email = this.authService.getUser()?.email || this.authService.getUserName();

    if (!email) {
      this.usuario = this.translateService.instant('home.defaultUser');
      return;
    }

    this.usuarioService.buscarPorEmail(email).subscribe({
      next: (res: Usuario) => {
        this.usuario = res.nome;
      },
      error: () => {
        this.usuario = email;
        this.toastrService.error(this.translateService.instant('home.errors.loadUser'));
      }
    });
  }
}
