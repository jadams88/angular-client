import { Action } from '@ngrx/store';
import { User } from '@features/users/user.model';
import { ActionWithPayload } from '@store/reducers';
import { LoginCredentials, LoginResponse } from './auth.model';

export enum AuthActionTypes {
  Login = '[Auth] Login',
  Logout = '[Auth] Logout',
  LoginSuccess = '[Auth] Login Success',
  LoginFailure = '[Auth] Login Failure',
  LoginRedirect = '[Auth] Login Redirect'
}

export class Login implements ActionWithPayload<LoginCredentials> {
  readonly type = AuthActionTypes.Login;
  constructor(readonly payload: LoginCredentials) {}
}

export class LoginSuccess implements ActionWithPayload<LoginResponse> {
  readonly type = AuthActionTypes.LoginSuccess;
  constructor(readonly payload: { user: User; token: string }) {}
}

export class LoginFailure implements ActionWithPayload<any> {
  readonly type = AuthActionTypes.LoginFailure;
  constructor(readonly payload: any) {}
}

export class LoginRedirect implements Action {
  readonly type = AuthActionTypes.LoginRedirect;
}

export class Logout implements Action {
  readonly type = AuthActionTypes.Logout;
}

export type AuthActionsUnion = Login | LoginSuccess | LoginFailure | LoginRedirect | Logout;
