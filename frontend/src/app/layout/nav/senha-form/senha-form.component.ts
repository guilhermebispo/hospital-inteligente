import { Component } from '@angular/core';
import { FormBuilder, FormGroup, Validators, AbstractControl } from '@angular/forms';

@Component({
  selector: 'app-senha-form',
  standalone: false,
  templateUrl: './senha-form.component.html',
  styleUrls: ['./senha-form.component.scss']
})
export class SenhaFormComponent {
  form: FormGroup;
  hidePassword = true;

  constructor(
    private fb: FormBuilder
  ) {

    this.form = this.fb.group(
      {
        senha: ['', [Validators.required, Validators.minLength(6)]],
        confirmarSenha: ['', [Validators.required]],
      },
      { validators: this.senhasConferem }
    );
  }

  senhasConferem(group: AbstractControl) {
    const senha = group.get('senha')?.value;
    const confirmarSenha = group.get('confirmarSenha')?.value;
    return senha === confirmarSenha ? null : { senhasDiferentes: true };
  }
}
