import { Component, Inject } from '@angular/core';
import { MAT_DIALOG_DATA } from '@angular/material/dialog';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';

import { User } from '../../../models/user';
import { Domain } from '../../../models/domain';

@Component({
  selector: 'app-user-form',
  standalone: false,
  templateUrl: './user-form.component.html',
  styleUrls: ['./user-form.component.scss']
})
export class UserFormComponent {
  form: FormGroup;
  isEdit!: boolean;
  roles: Domain[];

  constructor(
    private readonly fb: FormBuilder,
    @Inject(MAT_DIALOG_DATA) public data: { value: User; resources: any }
  ) {
    this.isEdit = !!data.value;
    this.roles = data.resources?.roles ?? [];

    this.form = this.fb.group({
      name: [data.value?.name || '', [Validators.required, Validators.maxLength(150)]],
      email: [data.value?.email || '', [Validators.required, Validators.email, Validators.maxLength(120)]],
      role: [data.value?.role.code || '', !this.isEdit ? Validators.required : []]
    });
  }
}
