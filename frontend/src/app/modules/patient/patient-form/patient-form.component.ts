import { Component, Inject } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { MAT_DIALOG_DATA } from '@angular/material/dialog';

import { Domain } from '../../../models/domain';
import { Patient } from '../../../models/patient';

@Component({
  selector: 'app-patient-form',
  standalone: false,
  templateUrl: './patient-form.component.html',
  styleUrls: ['./patient-form.component.scss']
})
export class PatientFormComponent {
  form: FormGroup;
  genders: Domain[] = [];
  isEdit = false;

  constructor(
    private readonly fb: FormBuilder,
    @Inject(MAT_DIALOG_DATA) public data: { value: Patient; resources: any }
  ) {
    this.isEdit = !!data.value;
    this.genders = data.resources?.genders ?? [];

    this.form = this.fb.group({
      name: [data.value?.name || '', [Validators.required, Validators.maxLength(150)]],
      email: [data.value?.email || '', [Validators.required, Validators.email, Validators.maxLength(150)]],
      document: [data.value?.document || '', [Validators.required, Validators.maxLength(20)]],
      birthDate: [data.value?.birthDate ? this.toDate(data.value.birthDate) : null, Validators.required],
      gender: [data.value?.gender && typeof data.value.gender === 'object' ? data.value.gender.code : data.value?.gender || '', Validators.required],
      phone: [data.value?.phone || '', [Validators.maxLength(20)]],
      notes: [data.value?.notes || '', [Validators.maxLength(500)]],
    });
  }

  private toDate(value: string): Date {
    const [year, month, day] = value.split('-').map((part) => Number(part));
    return new Date(Date.UTC(year, (month ?? 1) - 1, day ?? 1));
  }
}
