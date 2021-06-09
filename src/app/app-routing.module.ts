import { NgModule } from '@angular/core';
import { AngularFireAuthGuard } from '@angular/fire/auth-guard';
import { RouterModule, Routes } from '@angular/router';
import { AccountDetailComponent } from './account-detail/account-detail.component';
import { AccountsComponent } from './accounts/accounts.component';
import { OverviewComponent } from './overview/overview.component';
import { ReportsComponent } from './reports/reports.component';

const routes: Routes = [
  { path: '', redirectTo: '/overview', pathMatch: 'full' },
  { path: 'overview', component: OverviewComponent, canActivate: [AngularFireAuthGuard] },
  { path: 'accounts', component: AccountsComponent, canActivate: [AngularFireAuthGuard] },
  { path: 'account/:id', component: AccountDetailComponent, canActivate: [AngularFireAuthGuard] },
  { path: 'reports', component: ReportsComponent, canActivate: [AngularFireAuthGuard] },
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule],
})
export class AppRoutingModule {}
