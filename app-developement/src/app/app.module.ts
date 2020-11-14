import { BrowserModule } from '@angular/platform-browser';
import { NgModule } from '@angular/core';
import { AppComponent } from './app.component';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { LayoutModule } from './layout/layout.module';
import { Route, RouterModule } from '@angular/router';
import { AuthModule } from './auth/auth.module';
import { AuthComponent } from './auth/auth.component';
import { LayoutComponent } from './layout/layout/layout.component';
import { AuthGuard } from './auth/auth.guard';


const routes: Route[] = [
  {
    path: 'app',
    component: LayoutComponent,
    canActivate: [AuthGuard],
  },
  {
    path: 'auth',
    component: AuthComponent,
  },
  {
    path: '**',
    redirectTo: '/app',
    pathMatch: 'full',
  }
]

@NgModule({
  declarations: [
    AppComponent
  ],
  imports: [
    RouterModule.forRoot(routes),
    BrowserModule,
    BrowserAnimationsModule,
    LayoutModule,
    AuthModule
  ],
  providers: [],
  bootstrap: [AppComponent],
})
export class AppModule { }
