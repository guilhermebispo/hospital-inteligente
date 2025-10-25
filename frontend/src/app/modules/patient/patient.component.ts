import { AfterViewInit, Component, OnInit, ViewChild } from '@angular/core';
import { MatSort, Sort } from '@angular/material/sort';
import { PageEvent } from '@angular/material/paginator';
import { ActivatedRoute, Router } from '@angular/router';
import { ToastrService } from 'ngx-toastr';
import { TranslateService } from '@ngx-translate/core';

import { Domain } from '../../models/domain';
import { Patient, PatientPayload, PatientQueryParams } from '../../models/patient';
import { PatientService } from '../../services/patient.service';
import { DomainService } from '../../services/domain.service';
import { DialogService } from '../../layout/dialog/dialog.service';
import { PatientFormComponent } from './patient-form/patient-form.component';

@Component({
  selector: 'app-patient',
  standalone: false,
  templateUrl: './patient.component.html',
  styleUrls: ['./patient.component.scss']
})
export class PatientComponent implements OnInit, AfterViewInit {
  @ViewChild(MatSort) sort!: MatSort;

  patients: Patient[] = [];
  totalItems = 0;
  pageIndex = 0;
  pageSize = 10;
  textFilter = '';
  genderFilter = '';
  sortState: Sort = { active: '', direction: '' };

  genders: Domain[] = [];
  private hasViewInitialized = false;

  currentLocale: string;

  constructor(
    private readonly patientService: PatientService,
    private readonly domainService: DomainService,
    private readonly dialogService: DialogService,
    private readonly toastr: ToastrService,
    private readonly route: ActivatedRoute,
    private readonly router: Router,
    private readonly translate: TranslateService
  ) {
    this.currentLocale = this.resolveLocale(this.translate.currentLang);
  }

  ngOnInit(): void {
    this.domainService.fetchGenders().subscribe((data) => {
      this.genders = data;
    });

    this.translate.onLangChange.subscribe(({ lang }) => {
      this.currentLocale = this.resolveLocale(lang);
    });

    this.route.queryParamMap.subscribe((params) => {
      this.pageIndex = +params.get('page')! || 0;
      this.pageSize = +params.get('size')! || 10;
      this.textFilter = params.get('text') || '';
      this.genderFilter = params.get('gender') || '';

      const sortParam = params.get('sort');
      const directionParam = params.get('direction');

      if (sortParam) {
        const normalizedDirection = directionParam === 'asc' || directionParam === 'desc' ? directionParam : 'asc';
        this.sortState = { active: sortParam, direction: normalizedDirection };
        this.applySortStateToDirective();
      } else {
        this.sortState = { active: '', direction: '' };
      }

      this.loadPatients();
    });
  }

  ngAfterViewInit(): void {
    this.hasViewInitialized = true;
    this.applySortStateToDirective();
  }

  loadPatients(): void {
    const params: PatientQueryParams = {
      page: this.pageIndex,
      size: this.pageSize,
      sort: this.getSortField(),
      direction: this.getSortDirection(),
      text: this.textFilter,
      gender: this.genderFilter,
    };

    this.patientService.list(params).subscribe({
      next: (response) => {
        this.patients = response.content;
        this.totalItems = response.totalElements;
      }
    });
  }

  applyFilters(): void {
    this.pageIndex = 0;
    this.updateUrl();
    this.loadPatients();
  }

  onPageChange(event: PageEvent): void {
    this.pageIndex = event.pageIndex;
    this.pageSize = event.pageSize;
    this.updateUrl();
    this.loadPatients();
  }

  onSortChange(sort: Sort): void {
    const direction = sort.direction === 'asc' || sort.direction === 'desc' ? sort.direction : '';
    this.sortState = direction ? { active: sort.active, direction } : { active: '', direction: '' };
    this.applySortStateToDirective();
    this.pageIndex = 0;
    this.updateUrl();
    this.loadPatients();
  }

  createPatient(): void {
    this.dialogService.openForm({
      formComponent: PatientFormComponent,
      title: this.translate.instant('patients.dialog.createTitle'),
      resources: { genders: this.genders }
    }).subscribe((result: any) => {
      if (!result) {
        return;
      }
      const payload = this.buildCreatePayload(result);
      this.patientService.create(payload).subscribe({
        next: () => {
          this.toastr.success(this.translate.instant('patients.messages.created'));
          this.loadPatients();
        },
        error: () => this.toastr.error(this.translate.instant('patients.messages.createError'))
      });
    });
  }

  editPatient(patient: Patient): void {
    this.dialogService.openForm({
      formComponent: PatientFormComponent,
      title: this.translate.instant('patients.dialog.editTitle'),
      value: patient,
      resources: { genders: this.genders }
    }).subscribe((result: any) => {
      if (!result || !patient.id) {
        return;
      }
      const payload = this.buildUpdatePayload(result);
      this.patientService.update(patient.id, payload).subscribe({
        next: () => {
          this.toastr.success(this.translate.instant('patients.messages.updated'));
          this.loadPatients();
        },
        error: () => this.toastr.error(this.translate.instant('patients.messages.updateError'))
      });
    });
  }

  deletePatient(patient: Patient): void {
    if (!patient.id) {
      return;
    }

    this.dialogService.openConfirm({
      title: this.translate.instant('patients.dialog.deleteTitle'),
      message: this.translate.instant('patients.dialog.deleteMessage', { name: patient.name })
    }).subscribe((confirmed) => {
      if (confirmed) {
        this.patientService.delete(patient.id as string).subscribe({
          next: () => {
            this.toastr.success(this.translate.instant('patients.messages.deleted'));
            this.loadPatients();
          },
          error: () => this.toastr.error(this.translate.instant('patients.messages.deleteError'))
        });
      }
    });
  }

  createUserAccount(patient: Patient): void {
    if (!patient.id) {
      return;
    }
    this.patientService.createUser(patient.id).subscribe({
      next: () => {
        this.toastr.success(this.translate.instant('patients.messages.userCreated'));
        this.loadPatients();
      },
      error: () => this.toastr.error(this.translate.instant('patients.messages.userError'))
    });
  }

  getSortField(): string | undefined {
    return this.sortState.active || undefined;
  }

  getSortDirection(): string | undefined {
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
    this.sort.direction = this.sortState.direction as 'asc' | 'desc' | '';
  }

  private updateUrl(): void {
    this.router.navigate([], {
      relativeTo: this.route,
      queryParams: {
        page: this.pageIndex,
        size: this.pageSize,
        text: this.textFilter || null,
        gender: this.genderFilter || null,
        sort: this.getSortField() ?? null,
        direction: this.getSortDirection() ?? null,
      },
      queryParamsHandling: 'merge'
    });
  }

  private buildCreatePayload(result: any): PatientPayload {
    return {
      name: result.name,
      email: result.email,
      document: result.document,
      birthDate: this.formatDate(result.birthDate),
      gender: result.gender,
      phone: result.phone ?? '',
      notes: result.notes ?? ''
    };
  }

  private buildUpdatePayload(result: any): Partial<PatientPayload> {
    const payload: Partial<PatientPayload> = {
      name: result.name,
      email: result.email,
      document: result.document,
      birthDate: result.birthDate ? this.formatDate(result.birthDate) : undefined,
      gender: result.gender,
      phone: result.phone,
      notes: result.notes,
    };

    Object.keys(payload).forEach((key) => {
      const value = (payload as any)[key];
      if (value === undefined || value === null || value === '') {
        delete (payload as any)[key];
      }
    });

    return payload;
  }

  private formatDate(value: Date | string): string {
    if (!value) {
      return '';
    }
    const date = value instanceof Date ? value : this.parseIsoDate(value);
    const month = `${date.getMonth() + 1}`.padStart(2, '0');
    const day = `${date.getDate()}`.padStart(2, '0');
    return `${date.getFullYear()}-${month}-${day}`;
  }

  getGenderCode(patient: Patient): string {
    return patient.gender?.code ?? 'OTHER';
  }

  formatBirthDate(value: string): string {
    if (!value) {
      return '';
    }
    const date = this.parseIsoDate(value);
    return new Intl.DateTimeFormat(this.currentLocale, { day: '2-digit', month: '2-digit', year: 'numeric' }).format(
      date
    );
  }

  private parseIsoDate(value: string): Date {
    const [year, month, day] = value.split('-').map((part) => Number(part));
    return new Date(Date.UTC(year, (month ?? 1) - 1, day ?? 1));
  }

  private resolveLocale(lang?: string | null): string {
    if (!lang) {
      return 'pt-BR';
    }
    const lowered = lang.toLowerCase();
    if (lowered.startsWith('en')) {
      return 'en-US';
    }
    if (lowered.startsWith('pt')) {
      return 'pt-BR';
    }
    return 'pt-BR';
  }
}
