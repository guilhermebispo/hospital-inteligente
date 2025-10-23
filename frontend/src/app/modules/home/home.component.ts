import { Component, OnDestroy, OnInit } from '@angular/core';
import { AuthService } from '../../security/auth.service';
import { UserService } from '../../services/user.service';
import { User } from '../../models/user';
import { ToastrService } from 'ngx-toastr';
import { TranslateService } from '@ngx-translate/core';
import { Subscription } from 'rxjs';

@Component({
  selector: 'app-home',
  standalone: false,
  templateUrl: './home.component.html',
  styleUrls: ['./home.component.scss']
})
export class HomeComponent implements OnInit, OnDestroy {

  userName = '';
  tips: string[] = [];
  private langChangeSub!: Subscription;

  constructor(
    private userService: UserService,
    private toastrService: ToastrService,
    private authService: AuthService,
    private translateService: TranslateService
  ) { }

  ngOnInit(): void {
    this.langChangeSub = this.translateService.onLangChange.subscribe(() => this.loadTips());
    this.loadTips();
    this.loadUser();
  }

  ngOnDestroy(): void {
    this.langChangeSub?.unsubscribe();
  }

  private loadTips(): void {
    this.translateService.get('home.tips.items').subscribe((items) => {
      this.tips = Array.isArray(items) ? items : [];
    });
  }

  private loadUser(): void {
    const tokenUser = this.authService.getUser();
    const email = tokenUser?.email || tokenUser?.sub;

    if (!email) {
      this.userName = this.translateService.instant('home.defaultUser');
      return;
    }

    this.userService.findByEmail(email).subscribe({
      next: (res: User) => {
        this.userName = res.name;
      },
      error: () => {
        this.userName = email;
        this.toastrService.error(this.translateService.instant('home.errors.loadUser'));
      }
    });
  }
}
