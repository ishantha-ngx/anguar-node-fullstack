import { Routes } from '@angular/router';

export const routes: Routes = [
  // Public Routes
  {
    path: '',
    loadComponent: () =>
      import('./layouts/public-layout/public-layout.component').then(
        (component) => component.PublicLayoutComponent
      ),
    children: [
      {
        path: '',
        loadComponent: () =>
          import('./pages/home/home.component').then(
            (component) => component.HomeComponent
          ),
      },
      {
        path: 'about-us',
        loadComponent: () =>
          import('./pages/about-us/about-us.component').then(
            (component) => component.AboutUsComponent
          ),
      },
      {
        path: 'not-found',
        loadComponent: () =>
          import('./pages/page-not-found/page-not-found.component').then(
            (component) => component.PageNotFoundComponent
          ),
      },
    ],
  },
  // Auth Routes
  {
    path: 'auth',
    loadComponent: () =>
      import('./layouts/auth-layout/auth-layout.component').then(
        (component) => component.AuthLayoutComponent
      ),
    loadChildren: () => import('./auth/auth.module').then((m) => m.AuthModule),
  },
  // Main Routes
  {
    path: 'app',
    loadComponent: () =>
      import('./layouts/main-layout/main-layout.component').then(
        (component) => component.MainLayoutComponent
      ),
    loadChildren: () => import('./main/main.module').then((m) => m.MainModule),
  },
  // Page not found route
  {
    path: '**',
    pathMatch: 'full',
    redirectTo: 'not-found',
  },
];
