import { provideHttpClient, withInterceptorsFromDi } from '@angular/common/http';
import { NgModule } from '@angular/core';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { MatDialogModule } from '@angular/material/dialog';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { MatNativeDateModule, MAT_DATE_LOCALE, DateAdapter, MAT_DATE_FORMATS, NativeDateAdapter } from '@angular/material/core';
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
import { TranslateLoader, TranslateModule } from '@ngx-translate/core';
import { TranslateHttpLoader, TRANSLATE_HTTP_LOADER_CONFIG } from '@ngx-translate/http-loader';
import { AppRoutingModule } from './app-routing.module';
import { AppComponent } from './app.component';
import { LoginComponent } from './layout/login/login.component';
import { NavComponent } from './layout/nav/nav.component';
import { HomeComponent } from './modules/home/home.component';
import { UserFormComponent } from './modules/user/user-form/user-form.component';
import { UserComponent } from './modules/user/user.component';
import { PatientComponent } from './modules/patient/patient.component';
import { PatientFormComponent } from './modules/patient/patient-form/patient-form.component';
import { AuthInterceptorProvider } from './security/auth.interceptor';
import { DialogFormComponent } from './layout/dialog/form-dialog/dialog-form.component';
import { DialogConfirmComponent } from './layout/dialog/confirm-dialog/dialog-confirm.component';
import { CustomMatPaginatorService } from './services/custom-mat-paginator.service';
import { PasswordFormComponent } from './layout/nav/password-form/password-form.component';
import { RoleFormComponent } from './modules/user/role-form/role-form.component';

@NgModule({
  declarations: [
    AppComponent,
    NavComponent,
    HomeComponent,
    LoginComponent,
    UserComponent,
    PatientComponent,
    UserFormComponent,
    PatientFormComponent,
    RoleFormComponent,
    PasswordFormComponent,
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
    MatDatepickerModule,
    MatNativeDateModule,
    TranslateModule.forRoot({
      defaultLanguage: 'pt-BR',
      loader: {
        provide: TranslateLoader,
        useClass: TranslateHttpLoader
      }
    }),
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
    { provide: MAT_DATE_LOCALE, useFactory: () => localStorage.getItem('app_lang') ?? 'pt-BR' },
    {
      provide: DateAdapter,
      useClass: NativeDateAdapter,
      deps: [MAT_DATE_LOCALE]
    },
    {
      provide: MAT_DATE_FORMATS,
      useFactory: () => {
        const lang = localStorage.getItem('app_lang') ?? 'pt-BR';
        const isPt = (lang || '').toLowerCase().startsWith('pt');
        return {
          parse: {
            dateInput: isPt ? 'DD/MM/YYYY' : 'MM/DD/YYYY'
          },
          display: {
            dateInput: isPt ? 'DD/MM/YYYY' : 'MM/DD/YYYY',
            monthYearLabel: 'MMM YYYY',
            dateA11yLabel: 'LL',
            monthYearA11yLabel: 'MMMM YYYY'
          }
        };
      }
    },
    {
      provide: TRANSLATE_HTTP_LOADER_CONFIG,
      useValue: {
        prefix: './assets/i18n/',
        suffix: '.json'
      }
    },
    { provide: MatPaginatorIntl, useClass: CustomMatPaginatorService}
  ],
  bootstrap: [AppComponent]
})
export class AppModule { }
