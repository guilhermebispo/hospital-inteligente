import { provideHttpClient, withInterceptorsFromDi } from '@angular/common/http';
import { NgModule } from '@angular/core';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { MatDialogModule } from '@angular/material/dialog';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { MatListModule } from '@angular/material/list';
import { MatMenuModule } from '@angular/material/menu';
import { MatPaginatorIntl, MatPaginatorModule } from '@angular/material/paginator';
import { MatRadioModule } from '@angular/material/radio';
import { MatSelectModule } from '@angular/material/select';
import { MatSidenavModule } from '@angular/material/sidenav';
import { MatSnackBarModule } from '@angular/material/snack-bar';
import { MatSortModule } from '@angular/material/sort';
import { MatTableModule } from '@angular/material/table';
import { MatToolbarModule } from '@angular/material/toolbar';
import { MatTooltipModule } from '@angular/material/tooltip';
import { BrowserModule } from '@angular/platform-browser';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { provideEnvironmentNgxMask } from 'ngx-mask';
import { ToastrModule } from 'ngx-toastr';
import { AppRoutingModule } from './app-routing.module';
import { AppComponent } from './app.component';
import { LoginComponent } from './layout/login/login.component';
import { NavComponent } from './layout/nav/nav.component';
import { HomeComponent } from './modules/home/home.component';
import { UsuarioFormComponent } from './modules/usuario/usuario-form/usuario-form.component';
import { UsuarioComponent } from './modules/usuario/usuario.component';
import { AuthInterceptorProvider } from './security/auth.interceptor';
import { DialogFormComponent } from './layout/dialog/form-dialog/dialog-form.component';
import { DialogConfirmComponent } from './layout/dialog/confirm-dialog/dialog-confirm.component';
import { MatPaginatorBrService } from './services/mat-paginator-br.service';
import { SenhaFormComponent } from './layout/nav/senha-form/senha-form.component';
import { PerfilFormComponent } from './modules/usuario/perfil-form/perfil-form.component';

@NgModule({
  declarations: [
    AppComponent,
    NavComponent,
    HomeComponent,
    LoginComponent,
    UsuarioComponent,
    UsuarioFormComponent,
    PerfilFormComponent,
    SenhaFormComponent,
    DialogFormComponent,
    DialogConfirmComponent
  ],
  imports: [
    AppRoutingModule,
    BrowserModule,
    BrowserAnimationsModule,
    FormsModule,
    ReactiveFormsModule,
    MatFormFieldModule,
    MatPaginatorModule,
    MatCheckboxModule,
    MatSnackBarModule,
    MatToolbarModule,
    MatSidenavModule,
    MatButtonModule,
    MatSelectModule,
    MatInputModule,
    MatRadioModule,
    MatTableModule,
    MatIconModule,
    MatListModule,
    MatCardModule,
    MatMenuModule,
    MatDialogModule,
    MatSortModule,
    MatTooltipModule,
    ToastrModule.forRoot({
      timeOut: 4000,
      closeButton: true,
      progressBar: true,
      positionClass: 'toast-bottom-right',
      preventDuplicates: true
    })
  ],
  providers: [
    AuthInterceptorProvider,
    provideHttpClient(withInterceptorsFromDi()),
    provideEnvironmentNgxMask(),
    { provide: MatPaginatorIntl, useClass: MatPaginatorBrService}
  ],
  bootstrap: [AppComponent]
})
export class AppModule { }
