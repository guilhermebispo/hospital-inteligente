import { AfterViewInit, Component, OnInit, ViewChild } from '@angular/core';
import { MatSort, Sort } from '@angular/material/sort';
import { PageEvent } from '@angular/material/paginator';
import { ActivatedRoute, Router } from '@angular/router';
import { TranslateService } from '@ngx-translate/core';
import { ToastrService } from 'ngx-toastr';

import { Doctor, DoctorPayload, DoctorQueryParams } from '../../models/doctor';
import { DoctorService } from '../../services/doctor.service';
import { DialogService } from '../../layout/dialog/dialog.service';
import { DoctorFormComponent } from './doctor-form/doctor-form.component';

@Component({
  selector: 'app-doctor',
  templateUrl: './doctor.component.html',
  styleUrls: ['./doctor.component.scss'],
  standalone: false,
})
export class DoctorComponent implements OnInit, AfterViewInit {
  @ViewChild(MatSort) sort!: MatSort;

  doctors: Doctor[] = [];
  totalItems = 0;
  pageIndex = 0;
  pageSize = 10;
  textFilter = '';
  specialtyFilter = '';
  sortState: Sort = { active: '', direction: '' };

  specialties = ['Cardiologia', 'Pediatria', 'Dermatologia', 'Neurologia'];
  private hasViewInitialized = false;

  constructor(
    private readonly doctorService: DoctorService,
    private readonly dialogService: DialogService,
    private readonly toastr: ToastrService,
    private readonly route: ActivatedRoute,
    private readonly router: Router,
    private readonly translate: TranslateService
  ) {}

  ngOnInit(): void {
    this.route.queryParamMap.subscribe((params) => {
      this.pageIndex = +params.get('page')! || 0;
      this.pageSize = +params.get('size')! || 10;
      this.textFilter = params.get('text') || '';
      this.specialtyFilter = params.get('specialty') || '';

      const sortParam = params.get('sort');
      const directionParam = params.get('direction');

      if (sortParam) {
        const normalizedDirection = directionParam === 'asc' || directionParam === 'desc' ? directionParam : 'asc';
        this.sortState = { active: sortParam, direction: normalizedDirection };
        this.applySortState();
      } else {
        this.sortState = { active: '', direction: '' };
      }

      this.loadDoctors();
    });
  }

  ngAfterViewInit(): void {
    this.hasViewInitialized = true;
    this.applySortState();
  }

  loadDoctors(): void {
    const params: DoctorQueryParams = {
      page: this.pageIndex,
      size: this.pageSize,
      sort: this.getSortField(),
      direction: this.getSortDirection(),
      text: this.textFilter,
      specialty: this.specialtyFilter,
    };

    this.doctorService.list(params).subscribe(({ content, totalElements }) => {
      this.doctors = content;
      this.totalItems = totalElements;
    });
  }

  applyFilters(): void {
    this.pageIndex = 0;
    this.updateUrl();
    this.loadDoctors();
  }

  onPageChange(event: PageEvent): void {
    this.pageIndex = event.pageIndex;
    this.pageSize = event.pageSize;
    this.updateUrl();
    this.loadDoctors();
  }

  onSortChange(sort: Sort): void {
    const direction = sort.direction === 'asc' || sort.direction === 'desc' ? sort.direction : '';
    this.sortState = direction ? { active: sort.active, direction } : { active: '', direction: '' };
    this.applySortState();
    this.pageIndex = 0;
    this.updateUrl();
    this.loadDoctors();
  }

  createDoctor(): void {
    this.dialogService.openForm({
      formComponent: DoctorFormComponent,
      title: this.translate.instant('doctors.dialog.createTitle'),
      resources: { specialties: this.specialties }
    }).subscribe((result: any) => {
      if (!result) {
        return;
      }
      const payload: DoctorPayload = {
        name: result.name,
        email: result.email,
        crm: result.crm,
        specialty: result.specialty,
      };

      this.doctorService.create(payload).subscribe({
        next: () => {
          this.toastr.success(this.translate.instant('doctors.messages.created'));
          this.loadDoctors();
        },
        error: () => this.toastr.error(this.translate.instant('doctors.messages.createError'))
      });
    });
  }

  editDoctor(doctor: Doctor): void {
    this.dialogService.openForm({
      formComponent: DoctorFormComponent,
      title: this.translate.instant('doctors.dialog.editTitle'),
      value: doctor,
      resources: { specialties: this.specialties }
    }).subscribe((result: any) => {
      if (!result || !doctor.id) {
        return;
      }
      this.doctorService.update(doctor.id, result).subscribe({
        next: () => {
          this.toastr.success(this.translate.instant('doctors.messages.updated'));
          this.loadDoctors();
        },
        error: () => this.toastr.error(this.translate.instant('doctors.messages.updateError'))
      });
    });
  }

  deleteDoctor(doctor: Doctor): void {
    if (!doctor.id) {
      return;
    }
    this.dialogService.openConfirm({
      title: this.translate.instant('doctors.dialog.deleteTitle'),
      message: this.translate.instant('doctors.dialog.deleteMessage', { name: doctor.name })
    }).subscribe((confirmed) => {
      if (confirmed) {
        this.doctorService.delete(doctor.id as string).subscribe({
          next: () => {
            this.toastr.success(this.translate.instant('doctors.messages.deleted'));
            this.loadDoctors();
          },
          error: () => this.toastr.error(this.translate.instant('doctors.messages.deleteError'))
        });
      }
    });
  }

  private updateUrl(): void {
    this.router.navigate([], {
      relativeTo: this.route,
      queryParams: {
        page: this.pageIndex,
        size: this.pageSize,
        text: this.textFilter || null,
        specialty: this.specialtyFilter || null,
        sort: this.getSortField() ?? null,
        direction: this.getSortDirection() ?? null,
      },
      queryParamsHandling: 'merge'
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

  private applySortState(): void {
    if (!this.hasViewInitialized || !this.sort) {
      return;
    }
    this.sort.active = this.sortState.active;
    this.sort.direction = this.sortState.direction as 'asc' | 'desc' | '';
  }
}
