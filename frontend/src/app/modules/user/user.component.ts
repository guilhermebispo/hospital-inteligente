import { AfterViewInit, Component, OnInit, ViewChild } from '@angular/core';
import { PageEvent } from '@angular/material/paginator';
import { MatSort, Sort } from '@angular/material/sort';
import { ActivatedRoute, Router } from '@angular/router';
import { ToastrService } from 'ngx-toastr';
import { TranslateService } from '@ngx-translate/core';

import { User, UserCreatePayload, UserQueryParams } from '../../models/user';
import { Domain } from '../../models/domain';
import { UserService } from '../../services/user.service';
import { DomainService } from '../../services/domain.service';
import { DialogService } from '../../layout/dialog/dialog.service';
import { UserFormComponent } from './user-form/user-form.component';
import { RoleFormComponent } from './role-form/role-form.component';

@Component({
  selector: 'app-user',
  standalone: false,
  templateUrl: './user.component.html',
  styleUrls: ['./user.component.scss']
})
export class UserComponent implements OnInit, AfterViewInit {
  @ViewChild(MatSort) sort!: MatSort;

  users: User[] = [];
  totalItems = 0;
  pageIndex = 0;
  pageSize = 10;
  textFilter = '';
  roleFilter = '';
  sortState: Sort = { active: '', direction: '' };

  roles: Domain[] = [];
  private hasViewInitialized = false;

  constructor(
    private readonly userService: UserService,
    private readonly domainService: DomainService,
    private readonly toastr: ToastrService,
    private readonly dialogService: DialogService,
    private readonly route: ActivatedRoute,
    private readonly router: Router,
    private readonly translate: TranslateService
  ) {}

  ngOnInit(): void {
    this.domainService.fetchRoles().subscribe((data) => {
      this.roles = this.ensureDefaultRoles(data);
    });

    this.route.queryParamMap.subscribe((params) => {
      this.pageIndex = +params.get('page')! || 0;
      this.pageSize = +params.get('size')! || 10;
      this.textFilter = params.get('text') || '';
      this.roleFilter = params.get('role') || '';

      const sortParam = params.get('sort');
      const directionParam = params.get('direction');

      if (sortParam) {
        const normalizedDirection =
          directionParam === 'asc' || directionParam === 'desc' ? directionParam : 'asc';

        this.sortState = { active: sortParam, direction: normalizedDirection };
        this.applySortStateToDirective();
      } else {
        this.sortState = { active: '', direction: '' };
      }

      this.loadUsers();
    });
  }

  ngAfterViewInit(): void {
    this.hasViewInitialized = true;
    this.applySortStateToDirective();
  }

  loadUsers(): void {
    const params: UserQueryParams = {
      page: this.pageIndex,
      size: this.pageSize,
      sort: this.getSortField(),
      direction: this.getSortDirection(),
      text: this.textFilter,
      role: this.roleFilter,
    };

    this.userService.list(params).subscribe({
      next: (response) => {
        this.users = response.content;
        this.totalItems = response.totalElements;
      }
    });
  }

  updateUrl(): void {
    this.router.navigate([], {
      relativeTo: this.route,
      queryParams: {
        page: this.pageIndex,
        size: this.pageSize,
        text: this.textFilter || null,
        role: this.roleFilter || null,
        sort: this.getSortField() ?? null,
        direction: this.getSortDirection() ?? null,
      },
      queryParamsHandling: 'merge'
    });
  }

  onPageChange(event: PageEvent): void {
    this.pageIndex = event.pageIndex;
    this.pageSize = event.pageSize;
    this.updateUrl();
    this.loadUsers();
  }

  onSortChange(sort: Sort): void {
    const direction = sort.direction === 'asc' || sort.direction === 'desc' ? sort.direction : '';
    this.sortState = direction ? { active: sort.active, direction } : { active: '', direction: '' };
    this.applySortStateToDirective();
    this.pageIndex = 0;
    this.updateUrl();
    this.loadUsers();
  }

  applyFilters(): void {
    this.pageIndex = 0;
    this.updateUrl();
    this.loadUsers();
  }

  createUser(): void {
    this.dialogService.openForm({
      formComponent: UserFormComponent,
      title: this.translate.instant('users.dialog.createTitle'),
      resources: { roles: this.roles }
    }).subscribe((result: any) => {
      if (result) {
        const payload: UserCreatePayload = {
          name: result.name,
          email: result.email,
          role: result.role,
          password: '123456'
        };

        this.userService.create(payload).subscribe({
          next: () => {
            this.toastr.success(this.translate.instant('users.messages.created'));
            this.loadUsers();
          },
          error: () => this.toastr.error(this.translate.instant('users.messages.createError'))
        });
      }
    });
  }

 editUser(user: User): void {
   this.dialogService.openForm({
     formComponent: UserFormComponent,
     title: this.translate.instant('users.dialog.editTitle'),
     value: user
   }).subscribe((result: any) => {
     if (result) {
        const updated: User = {
          ...user,
          name: result.name,
          email: result.email
        };

        this.userService.update(updated).subscribe({
          next: () => {
            this.toastr.success(this.translate.instant('users.messages.updated'));
            this.loadUsers();
          },
          error: () => this.toastr.error(this.translate.instant('users.messages.updateError'))
        });
      }
    });
  }

  changeUserRole(user: User): void {
    this.dialogService.openForm({
      formComponent: RoleFormComponent,
      title: this.translate.instant('users.dialog.updateProfile'),
      value: user,
      resources: { roles: this.roles }
    }).subscribe((result: any) => {
      if (result?.role && result.role !== user.role.code) {
        this.userService.updateRole(user.id!, result.role).subscribe({
          next: () => {
            this.toastr.success(this.translate.instant('users.messages.profileUpdated'));
            this.loadUsers();
          },
          error: () => this.toastr.error(this.translate.instant('users.messages.profileError'))
        });
      }
    });
  }

  deleteUser(user: User): void {
    this.dialogService.openConfirm({
      title: this.translate.instant('users.dialog.deleteTitle'),
      message: this.translate.instant('users.dialog.deleteMessage', { name: user.name })
    }).subscribe((confirmed) => {
      if (confirmed) {
        this.userService.delete(user.id!).subscribe({
          next: () => {
            this.toastr.success(this.translate.instant('users.messages.deleted'));
            this.loadUsers();
          },
          error: () => this.toastr.error(this.translate.instant('users.messages.deleteError'))
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

  private ensureDefaultRoles(roles: Domain[]): Domain[] {
    const codes = new Set(roles.map((role) => role.code));
    const result = [...roles];

    if (!codes.has('DOCTOR')) {
      result.push({ code: 'DOCTOR', label: this.translate.instant('users.roles.DOCTOR') });
    }

    if (!codes.has('PATIENT')) {
      result.push({ code: 'PATIENT', label: this.translate.instant('users.roles.PATIENT') });
    }

    return result;
  }
}
