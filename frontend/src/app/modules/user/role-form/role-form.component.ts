import { Component, Inject } from '@angular/core';
import { MAT_DIALOG_DATA } from '@angular/material/dialog';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';

import { User } from '../../../models/user';
import { Domain } from '../../../models/domain';

@Component({
  selector: 'app-role-form',
  standalone: false,
  templateUrl: './role-form.component.html',
  styleUrls: ['./role-form.component.scss']
})
export class RoleFormComponent {
  form: FormGroup;
  roles: Domain[];

  constructor(
    private readonly fb: FormBuilder,
    @Inject(MAT_DIALOG_DATA) public data: { value: User; resources: any }
  ) {
    this.roles = data.resources?.roles ?? [];

    this.form = this.fb.group({
      role: [data.value?.role.code || '', Validators.required]
    });
  }
}
