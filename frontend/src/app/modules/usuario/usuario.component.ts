import { AfterViewInit, Component, OnInit, ViewChild } from '@angular/core';
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
import { TranslateService } from '@ngx-translate/core';

@Component({
  selector: 'app-usuario',
  standalone: false,
  templateUrl: './usuario.component.html',
  styleUrls: ['./usuario.component.scss']
})
export class UsuarioComponent implements OnInit, AfterViewInit {
  @ViewChild(MatSort) sort!: MatSort;

  usuarios: Usuario[] = [];
  totalRegistros = 0;
  pageIndex = 0;
  pageSize = 10;
  filtroTexto = '';
  filtroPerfil = '';
  sortState: Sort = { active: '', direction: '' };

  perfisList: Dominio[] = [];
  private hasViewInitialized = false;

  constructor(
    private usuarioService: UsuarioService,
    private dominioService: DominioService,
    private toastrService: ToastrService,
    private dialogService: DialogService,
    private activatedRoute: ActivatedRoute,
    private router: Router,
    private translateService: TranslateService
  ) { }

  ngOnInit(): void {
    this.dominioService.buscarPerfis().subscribe(data => {
      this.perfisList = this.ensureMedicoPerfil(data);
    });

    this.activatedRoute.queryParamMap.subscribe(params => {
      this.pageIndex = +params.get('page')! || 0;
      this.pageSize = +params.get('size')! || 10;
      this.filtroTexto = params.get('texto') || '';
      this.filtroPerfil = params.get('perfil') || '';
      const sortParam = params.get('sort');
      const directionParam = params.get('direction');
      if (sortParam) {
        let active = sortParam;
        let resolvedDirection = directionParam || '';

        if (sortParam.includes(',')) {
          const [field, parsedDirection] = sortParam.split(',');
          active = field;
          if (!resolvedDirection) {
            resolvedDirection = parsedDirection;
          }
        }

        const normalizedDirection =
          resolvedDirection === 'asc' || resolvedDirection === 'desc'
            ? resolvedDirection
            : 'asc';

        this.sortState = active
          ? { active, direction: normalizedDirection }
          : { active: '', direction: '' };
        this.applySortStateToDirective();
      } else {
        this.sortState = { active: '', direction: '' };
      }
      this.carregarUsuarios();
    });
  }

  ngAfterViewInit(): void {
    this.hasViewInitialized = true;
    this.applySortStateToDirective();
  }

  carregarUsuarios(): void {
    const sortField = this.getSortField();
    const sortDirection = this.getSortDirection();
    this.usuarioService.listar({
      page: this.pageIndex,
      size: this.pageSize,
      sort: sortField,
      direction: sortDirection,
      texto: this.filtroTexto,
      perfil: this.filtroPerfil
    }).subscribe(response => {
      this.usuarios = response.content;
      this.totalRegistros = response.totalElements;
    });
  }

  atualizarUrl() {
    const sortField = this.getSortField();
    const sortDirection = this.getSortDirection();
    this.router.navigate([], {
      relativeTo: this.activatedRoute,
      queryParams: {
        page: this.pageIndex,
        size: this.pageSize,
        texto: this.filtroTexto || null,
        perfil: this.filtroPerfil || null,
        sort: sortField ?? null,
        direction: sortDirection ?? null
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
    const direction = sort.direction === 'asc' || sort.direction === 'desc' ? sort.direction : '';
    this.sortState = direction ? { active: sort.active, direction } : { active: '', direction: '' };
    this.applySortStateToDirective();
    this.pageIndex = 0;
    this.atualizarUrl();
    this.carregarUsuarios();
  }

  aplicarFiltros(): void {
    this.pageIndex = 0;
    this.atualizarUrl();
    this.carregarUsuarios();
  }

  cadastrarUsuario(): void {
    this.dialogService.openForm({
      formComponent: UsuarioFormComponent,
      title: this.translateService.instant('users.dialog.createTitle'),
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
            this.toastrService.success(this.translateService.instant('users.messages.created'));
            this.carregarUsuarios();
          },
          error: () => this.toastrService.error(this.translateService.instant('users.messages.createError'))
        });
      }
    });
  }

  editarUsuario(usuario: Usuario): void {
    this.dialogService.openForm({
      formComponent: UsuarioFormComponent,
      title: this.translateService.instant('users.dialog.editTitle'),
      value: usuario
    }).subscribe((result: any) => {
      if (result) {
        this.usuarioService.atualizar({ ...usuario, ...result }).subscribe({
          next: () => {
            this.toastrService.success(this.translateService.instant('users.messages.updated'));
            this.carregarUsuarios();
          },
          error: () => this.toastrService.error(this.translateService.instant('users.messages.updateError'))
        });
      }
    });
  }

  alterarPerfil(usuario: Usuario): void {
    this.dialogService.openForm({
      formComponent: PerfilFormComponent,
      title: this.translateService.instant('users.dialog.updateProfile'),
      value: usuario,
      resources: {
        perfisList: this.perfisList
      }
    }).subscribe((result: any) => {
      if (result?.perfil && result.perfil !== usuario.perfil) {
        this.usuarioService.atualizarPerfil(usuario.id!, result.perfil).subscribe({
          next: () => {
            this.toastrService.success(this.translateService.instant('users.messages.profileUpdated'));
            this.carregarUsuarios();
          },
          error: () => this.toastrService.error(this.translateService.instant('users.messages.profileError'))
        });
      }
    });
  }

  deletarUsuario(usuario: Usuario): void {
    this.dialogService.openConfirm({
      title: this.translateService.instant('users.dialog.deleteTitle'),
      message: this.translateService.instant('users.dialog.deleteMessage', { name: usuario.nome })
    }).subscribe(confirmado => {
      if (confirmado) {
        this.usuarioService.deletar(usuario.id!).subscribe({
          next: () => {
            this.toastrService.success(this.translateService.instant('users.messages.deleted'));
            this.carregarUsuarios();
          },
          error: () => this.toastrService.error(this.translateService.instant('users.messages.deleteError'))
        });
      }
    });
  }

  private getSortField(): string | undefined {
    return this.sortState.active || undefined;
  }

  private getSortDirection(): string | undefined {
    if (!this.sortState.active) {
      return undefined;
    }
    return this.sortState.direction === 'asc' || this.sortState.direction === 'desc'
      ? this.sortState.direction
      : 'asc';
  }

  private applySortStateToDirective(): void {
    if (!this.hasViewInitialized || !this.sort) {
      return;
    }

    this.sort.active = this.sortState.active;
    this.sort.direction = (this.sortState.direction as 'asc' | 'desc' | '');
  }

  private ensureMedicoPerfil(perfis: Dominio[]): Dominio[] {
    const codes = new Set(perfis.map(perfil => perfil.code));
    const result = [...perfis];

    if (!codes.has('MEDICO')) {
      result.push({ code: 'MEDICO', label: 'Médico' });
    }

    if (!codes.has('PACIENTE')) {
      result.push({ code: 'PACIENTE', label: 'Paciente' });
    }

    return result;
  }
}
