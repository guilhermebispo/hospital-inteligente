import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { ToastrService } from 'ngx-toastr';
import { Credencial } from '../../models/credencial';
import { AuthService } from '../../security/auth.service';
import { HttpResponse } from '@angular/common/http';

@Component({
  selector: 'app-login',
  standalone: false,
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.scss']
})
export class LoginComponent implements OnInit {

  loginForm!: FormGroup;
  hide = true;

  constructor(
    private fb: FormBuilder,
    private toast: ToastrService,
    private service: AuthService,
    private router: Router
  ) { }

  ngOnInit(): void {
    this.loginForm = this.fb.group({
      email: ['', [Validators.required, Validators.email]],
      senha: ['', [Validators.required, Validators.minLength(3)]]
    });
  }

  logar(): void {
    if (this.loginForm.invalid) {
      this.toast.warning('Preencha os campos corretamente');
      return;
    }

    const creds: Credencial = this.loginForm.value;

    this.service.authenticate(creds).subscribe({
      next: (resposta: HttpResponse<any>) => {
        const authHeader = (resposta.headers.get('Authorization') ?? '').trim();
        const headerToken = authHeader.replace(/^Bearer\s+/i, '').trim();

        const body: any = resposta.body ?? {};
        const bodyToken = (body.token ?? body.access_token ?? '').toString().trim();

        const token = headerToken || bodyToken;

        if (token) {
          this.service.successfulLogin(token);

          this.router.navigateByUrl('/', { replaceUrl: true });
        } else {
          this.toast.error('Erro ao obter token de autenticação');
        }
      },
      error: (err) => {
        this.toast.error(err?.error?.message || 'Usuário e/ou senha inválidos');
      }
    });

  }

  get email() {
    return this.loginForm.get('email');
  }

  get senha() {
    return this.loginForm.get('senha');
  }

  validaCampos(): boolean {
    return this.loginForm.valid;
  }

}
