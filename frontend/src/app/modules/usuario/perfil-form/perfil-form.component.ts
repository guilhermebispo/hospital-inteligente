import { Component, Inject } from '@angular/core';
import { MAT_DIALOG_DATA } from '@angular/material/dialog';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Usuario } from '../../../models/usuario';
import { Dominio } from '../../../models/dominio';

@Component({
  selector: 'app-perfil-form',
  standalone: false,
  templateUrl: './perfil-form.component.html',
  styleUrls: ['./perfil-form.component.scss']
})
export class PerfilFormComponent {
  form: FormGroup;
  hidePassword = true;

  perfisList: Dominio[];

  constructor(
    private fb: FormBuilder,
    @Inject(MAT_DIALOG_DATA) public data: { value: Usuario, resources: any }
  ) {
    this.perfisList = data.resources?.perfisList ?? [];

    this.form = this.fb.group(
      { perfil: [data.value?.perfil.code || '', Validators.required] }
    );
  }
}
