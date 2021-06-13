import { DragDropModule } from '@angular/cdk/drag-drop';
import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { AngularFireModule } from '@angular/fire';
import { AngularFireAuthModule, PERSISTENCE as AUTH_PERSISTENCE, SETTINGS as AUTH_SETTINGS } from '@angular/fire/auth';
import { AngularFirestoreModule } from '@angular/fire/firestore';
import { FormsModule } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatDialogModule } from '@angular/material/dialog';
import { MatDividerModule } from '@angular/material/divider';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { MatListModule } from '@angular/material/list';
import { MatSelectModule } from '@angular/material/select';
import { MatSidenavModule } from '@angular/material/sidenav';
import { MatTableModule } from '@angular/material/table';
import { MatTabsModule } from '@angular/material/tabs';
import { MatToolbarModule } from '@angular/material/toolbar';
import { BrowserModule } from '@angular/platform-browser';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { environment } from 'src/environments/environment';
import { AccountDetailComponent } from './account-detail/account-detail.component';
import { AccountLinkPipe, AccountsComponent } from './accounts/accounts.component';
import { CreateUpdateAccountDialogComponent } from './accounts/create-update-account-dialog/create-update-account-dialog.component';
import { AppRoutingModule } from './app-routing.module';
import { AppComponent } from './app.component';
import { OverviewComponent } from './overview/overview.component';
import { ReportsComponent } from './reports/reports.component';
import { ConfirmationDialogComponent } from './shared/confirmation-dialog/confirmation-dialog.component';
import { SidenavItemComponent } from './sidenav/sidenav-item/sidenav-item.component';
import { SidenavComponent } from './sidenav/sidenav.component';
import { SidenavService } from './sidenav/sidenav.service';

@NgModule({
  declarations: [
    AppComponent,
    OverviewComponent,
    SidenavComponent,
    SidenavItemComponent,
    ReportsComponent,
    AccountsComponent,
    CreateUpdateAccountDialogComponent,
    ConfirmationDialogComponent,
    AccountDetailComponent,
    AccountLinkPipe,
  ],
  imports: [
    BrowserModule,
    AppRoutingModule,
    DragDropModule,
    CommonModule,
    MatButtonModule,
    MatDialogModule,
    MatDividerModule,
    MatIconModule,
    MatInputModule,
    MatListModule,
    MatSelectModule,
    MatSidenavModule,
    MatTabsModule,
    MatTableModule,
    MatToolbarModule,
    AngularFireModule.initializeApp(environment.firebase),
    AngularFireAuthModule,
    AngularFirestoreModule,
    FormsModule,
    BrowserAnimationsModule,
  ],
  providers: [
    { provide: AUTH_SETTINGS, useValue: { appVerificationDisabledForTesting: true } },
    { provide: AUTH_PERSISTENCE, useValue: 'session' },
    SidenavService,
  ],
  bootstrap: [AppComponent],
})
export class AppModule {}
