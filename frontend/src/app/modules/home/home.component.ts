import { Component, OnInit } from '@angular/core';
import { AuthService } from '../../security/auth.service';
import { UsuarioService } from '../../services/usuario.service';
import { Usuario } from '../../models/usuario';
import { ToastrService } from 'ngx-toastr';

@Component({
  selector: 'app-home',
  standalone: false,
  templateUrl: './home.component.html',
  styleUrls: ['./home.component.scss']
})
export class HomeComponent implements OnInit {

  usuario = '';

  constructor(
    private usuarioService: UsuarioService,
    private toastrService: ToastrService,
    private authService: AuthService
  ) { }

  ngOnInit(): void {
    this.carregarUsuario();
  }

  private carregarUsuario(): void {
    const email = this.authService.getUser()?.email || this.authService.getUserName();

    if (!email) {
      this.usuario = 'Colaborador';
      return;
    }

    this.usuarioService.buscarPorEmail(email).subscribe({
      next: (res: Usuario) => {
        this.usuario = res.nome;
      },
      error: () => {
        this.usuario = email;
        this.toastrService.error('Erro ao buscar dados do usuário');
      }
    });
  }
}
