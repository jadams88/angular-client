import { Injectable } from '@angular/core';
import { Router } from '@angular/router';
import { Actions, Effect, ofType } from '@ngrx/effects';
import { of } from 'rxjs';
import { catchError, exhaustMap, map, tap } from 'rxjs/operators';
import {
  AuthActionTypes,
  Login,
  LoginFailure,
  LoginSuccess,
  Logout,
  LoginRedirect
} from '@auth/actions/auth.actions';
import { AuthService } from '@auth/services/auth.service';
import { LoginCredentials } from '@auth/auth.model';
import { LoadAuthenticatedUser } from '@features/users';

@Injectable()
export class AuthEffects {
  @Effect()
  login$ = this.actions$.pipe(
    ofType<Login>(AuthActionTypes.Login),
    map(action => action.payload),
    exhaustMap((auth: LoginCredentials) =>
      this.authService.login(auth).pipe(
        // map(result => result.data.login), // use this for graphql
        map(loginResponse => new LoginSuccess(loginResponse)),
        catchError(error => of(new LoginFailure(error)))
      )
    )
  );

  @Effect()
  loginSuccess$ = this.actions$.pipe(
    ofType<LoginSuccess>(AuthActionTypes.LoginSuccess),
    tap(action => this.authService.setAuthorizationToken(action.payload.token)),
    tap(() => this.router.navigate(['/home'])),
    map(() => new LoadAuthenticatedUser())
  );

  @Effect({ dispatch: false })
  logout$ = this.actions$.pipe(
    ofType<Logout>(AuthActionTypes.Logout),
    tap(() => this.authService.removeAuthorizationToken()),
    tap(() => this.router.navigate(['/login']))
  );

  @Effect({ dispatch: false })
  loginRedirect$ = this.actions$.pipe(
    ofType<LoginRedirect>(AuthActionTypes.LoginRedirect),
    tap(() => this.router.navigate(['/home']))
  );

  constructor(
    private actions$: Actions,
    private authService: AuthService,
    private router: Router
  ) {}
}
