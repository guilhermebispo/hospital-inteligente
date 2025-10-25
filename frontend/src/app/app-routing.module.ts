import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { LoginComponent } from './layout/login/login.component';
import { NavComponent } from './layout/nav/nav.component';
import { HomeComponent } from './modules/home/home.component';
import { UserComponent } from './modules/user/user.component';
import { AuthGuard } from './security/auth.guard';
import { PatientComponent } from './modules/patient/patient.component';

export const routes: Routes = [
  { path: 'login', component: LoginComponent },
  {
    path: '', component: NavComponent, canActivate: [AuthGuard], children: [
      { path: '', redirectTo: 'home', pathMatch: 'full' },
      { path: 'home', component: HomeComponent },
      { path: 'users', component: UserComponent },
      { path: 'patients', component: PatientComponent }
    ]
  }
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class AppRoutingModule { }
