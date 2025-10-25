import { Component, Inject } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { MAT_DIALOG_DATA } from '@angular/material/dialog';

import { Doctor } from '../../../models/doctor';

@Component({
  selector: 'app-doctor-form',
  templateUrl: './doctor-form.component.html',
  styleUrls: ['./doctor-form.component.scss'],
  standalone: false,
})
export class DoctorFormComponent {
  form: FormGroup;
  specialties: string[] = [];
  isEdit = false;

  constructor(
    private readonly fb: FormBuilder,
    @Inject(MAT_DIALOG_DATA) public data: { value: Doctor; resources: any }
  ) {
    this.isEdit = !!data.value;
    this.specialties = data.resources?.specialties ?? [];

    this.form = this.fb.group({
      name: [data.value?.name || '', [Validators.required, Validators.maxLength(150)]],
      email: [data.value?.email || '', [Validators.required, Validators.email, Validators.maxLength(150)]],
      crm: [data.value?.crm || '', [Validators.required, Validators.maxLength(30)]],
      specialty: [data.value?.specialty || '', [Validators.required, Validators.maxLength(120)]],
    });
  }
}
