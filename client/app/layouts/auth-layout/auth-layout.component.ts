import { Component } from '@angular/core';
import {
  NavigationEnd,
  Router,
  RouterModule,
  RouterOutlet,
} from '@angular/router';
import { MatCardModule } from '@angular/material/card';
import { MatGridListModule } from '@angular/material/grid-list';
import { MatButtonModule } from '@angular/material/button';
import { filter } from 'rxjs';

@Component({
  selector: 'app-auth-layout',
  standalone: true,
  imports: [
    RouterOutlet,
    RouterModule,
    MatCardModule,
    MatGridListModule,
    MatButtonModule,
  ],
  templateUrl: './auth-layout.component.html',
  styleUrl: './auth-layout.component.scss',
})
export class AuthLayoutComponent {
  // public isLoginPage: boolean = true;
  // constructor(private router: Router) {
  //   this.router.events
  //     .pipe(filter((event) => event instanceof NavigationEnd))
  //     .subscribe({
  //       next: (event: any) => {
  //         const currentUrl = event.urlAfterRedirects;
  //         this.isLoginPage = currentUrl === '/auth/login';
  //       },
  //     });
  // }
}
