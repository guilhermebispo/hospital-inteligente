import { Component, OnInit, ViewChild } from '@angular/core';
import { PageEvent } from '@angular/material/paginator';
import { MatSort, Sort } from '@angular/material/sort';
import { Usuario, UsuarioCreatePayload } from '../../models/usuario';
import { UsuarioService } from '../../services/usuario.service';
import { UsuarioFormComponent } from './usuario-form/usuario-form.component';
import { ToastrService } from 'ngx-toastr';
import { DialogService } from '../../layout/dialog/dialog.service';
import { PerfilFormComponent } from './perfil-form/perfil-form.component';
import { ActivatedRoute, Router } from '@angular/router';
import { Dominio } from '../../models/dominio';
import { DominioService } from '../../services/dominio.service';

@Component({
  selector: 'app-usuario',
  standalone: false,
  templateUrl: './usuario.component.html',
  styleUrls: ['./usuario.component.scss']
})
export class UsuarioComponent implements OnInit {
  @ViewChild(MatSort) sort!: MatSort;

  usuarios: Usuario[] = [];
  totalRegistros = 0;
  pageIndex = 0;
  pageSize = 10;
  filtroTexto = '';
  filtroPerfil = '';

  perfisList: Dominio[] = [];

  constructor(
    private usuarioService: UsuarioService,
    private dominioService: DominioService,
    private toastrService: ToastrService,
    private dialogService: DialogService,
    private activatedRoute: ActivatedRoute,
    private router: Router
  ) { }

  ngOnInit(): void {
    this.dominioService.buscarPerfis().subscribe(data => this.perfisList = data);

    this.activatedRoute.queryParamMap.subscribe(params => {
      this.pageIndex = +params.get('page')! || 0;
      this.pageSize = +params.get('size')! || 10;
      this.filtroTexto = params.get('texto') || '';
      this.filtroPerfil = params.get('perfil') || '';
      const sortParam = params.get('sort');
      if (sortParam) {
        const [active, direction] = sortParam.split(',');
        if (this.sort) {
          this.sort.active = active;
          this.sort.direction = direction as 'asc' | 'desc';
        }
      }
      this.carregarUsuarios();
    });
  }

  carregarUsuarios(): void {
    this.usuarioService.listar({
      page: this.pageIndex,
      size: this.pageSize,
      sort: this.sort ? `${this.sort.active},${this.sort.direction}` : undefined,
      texto: this.filtroTexto,
      perfil: this.filtroPerfil
    }).subscribe(response => {
      this.usuarios = response.content;
      this.totalRegistros = response.totalElements;
    });
  }

  atualizarUrl() {
    this.router.navigate([], {
      relativeTo: this.activatedRoute,
      queryParams: {
        page: this.pageIndex,
        size: this.pageSize,
        texto: this.filtroTexto || null,
        perfil: this.filtroPerfil || null,
        sort: this.sort ? `${this.sort.active},${this.sort.direction}` : null
      },
      queryParamsHandling: 'merge'
    });
  }


  onPageChange(event: PageEvent): void {
    this.pageIndex = event.pageIndex;
    this.pageSize = event.pageSize;
    this.atualizarUrl();
    this.carregarUsuarios();
  }

  onSortChange(sort: Sort): void {
    this.usuarioService.listar({
      page: this.pageIndex,
      size: this.pageSize,
      sort: `${sort.active},${sort.direction}`,
      texto: this.filtroTexto,
      perfil: this.filtroPerfil
    }).subscribe(response => {
      this.usuarios = response.content;
      this.totalRegistros = response.totalElements;
      this.atualizarUrl();
    });
  }

  aplicarFiltros(): void {
    this.pageIndex = 0;
    this.atualizarUrl();
    this.carregarUsuarios();
  }

  cadastrarUsuario(): void {
    this.dialogService.openForm({
      formComponent: UsuarioFormComponent,
      title: 'CADASTRAR USUÁRIO',
      resources: {
        perfisList: this.perfisList
      }
    }).subscribe((result: any) => {
      if (result) {
        const payload: UsuarioCreatePayload = {
          nome: result.nome,
          email: result.email,
          perfil: result.perfil,
          senha: '123456'
        };

        this.usuarioService.criar(payload).subscribe({
          next: () => {
            this.toastrService.success('Usuário cadastrado com sucesso!');
            this.carregarUsuarios();
          },
          error: () => this.toastrService.error('Erro ao cadastrar usuário.')
        });
      }
    });
  }

  editarUsuario(usuario: Usuario): void {
    this.dialogService.openForm({
      formComponent: UsuarioFormComponent,
      title: 'EDITAR USUÁRIO',
      value: usuario
    }).subscribe((result: any) => {
      if (result) {
        this.usuarioService.atualizar({ ...usuario, ...result }).subscribe({
          next: () => {
            this.toastrService.success('Usuário atualizado com sucesso!');
            this.carregarUsuarios();
          },
          error: () => this.toastrService.error('Erro ao atualizar usuário.')
        });
      }
    });
  }

  alterarPerfil(usuario: Usuario): void {
    this.dialogService.openForm({
      formComponent: PerfilFormComponent,
      title: 'ALTERAR PERFIL',
      value: usuario,
      resources: {
        perfisList: this.perfisList
      }
    }).subscribe((result: any) => {
      if (result?.perfil && result.perfil !== usuario.perfil) {
        this.usuarioService.atualizarPerfil(usuario.id!, result.perfil).subscribe({
          next: () => {
            this.toastrService.success('Perfil atualizado com sucesso!');
            this.carregarUsuarios();
          },
          error: () => this.toastrService.error('Erro ao atualizar perfil.')
        });
      }
    });
  }

  deletarUsuario(usuario: Usuario): void {
    this.dialogService.openConfirm({
      title: 'Excluir Usuário',
      message: `Tem certeza que deseja deletar o usuário ${usuario.nome}?`
    }).subscribe(confirmado => {
      if (confirmado) {
        this.usuarioService.deletar(usuario.id!).subscribe({
          next: () => {
            this.toastrService.success('Usuário excluído com sucesso!');
            this.carregarUsuarios();
          },
          error: err => this.toastrService.error('Erro ao excluir usuário.')
        });
      }
    });
  }
}
