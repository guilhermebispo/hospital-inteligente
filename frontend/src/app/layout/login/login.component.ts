import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { ToastrService } from 'ngx-toastr';
import { Credencial } from '../../models/credencial';
import { AuthService } from '../../security/auth.service';
import { HttpResponse } from '@angular/common/http';
import { TranslateService } from '@ngx-translate/core';

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
    private router: Router,
    private translate: TranslateService
  ) { }

  ngOnInit(): void {
    this.loginForm = this.fb.group({
      email: ['', [Validators.required, Validators.email]],
      senha: ['', [Validators.required, Validators.minLength(6)]]
    });
  }

  logar(): void {
    if (this.loginForm.invalid) {
      this.toast.warning(this.translate.instant('login.messages.fillFields'));
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
          this.toast.error(this.translate.instant('login.messages.tokenError'));
        }
      },
      error: (err) => {
        const errorMessage = err?.error?.message || this.translate.instant('login.messages.invalidCredentials');
        this.toast.error(errorMessage);
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
