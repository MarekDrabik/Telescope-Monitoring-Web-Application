import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { Route, RouterModule } from '@angular/router';
import { AppComponent } from './app.component';
import { AuthComponent } from './auth/auth.component';
import { AuthModule } from './auth/auth.module';
import { AuthGuard } from './auth/guards/auth.guard';
import { LocalhostAppGuard } from './auth/guards/localhost-app.guard';
import { WorkspaceComponent } from './workspace/workspace.component';
import { WorkspaceModule } from './workspace/workspace.module';


const routes: Route[] = [
  {
    path: 'app',
    component: WorkspaceComponent,
    canActivate: [AuthGuard],
  },
  {
    path: 'auth',
    component: AuthComponent,
    canActivate: [LocalhostAppGuard],
  },
  {
    path: '**',
    redirectTo: '/app',
    pathMatch: 'full',
  }
]

@NgModule({
  declarations: [
    AppComponent,
  ],
  imports: [
    RouterModule.forRoot(routes),
    BrowserModule,
    BrowserAnimationsModule,
    WorkspaceModule,
    AuthModule
  ],
  providers: [],
  bootstrap: [AppComponent],
})
export class AppModule { }
