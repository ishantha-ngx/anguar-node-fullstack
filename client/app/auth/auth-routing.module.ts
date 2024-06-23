import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';

const routes: Routes = [
  {
    path: 'login',
    loadComponent: () =>
      import('./login/login.component').then(
        (component) => component.LoginComponent
      ),
  },
  {
    path: 'register',
    loadComponent: () =>
      import('./register/register.component').then(
        (component) => component.RegisterComponent
      ),
  },
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class AuthRoutingModule {}
