import { TestBed } from '@angular/core/testing';
import { Router } from '@angular/router';
import { Observable } from 'rxjs';
import { Actions } from '@ngrx/effects';
import { provideMockActions } from '@ngrx/effects/testing';
import { cold, hot, Scheduler } from 'jest-marbles';
import { createSpyObj } from '@tests/helper-functions';
import { Login, LoginFailure, LoginSuccess, Logout } from '@auth/actions/auth.actions';
import { AuthService } from '@auth/services/auth.service';
import { AuthEffects } from '@auth/effects/auth.effects';
import { LoginCredentials } from '../models/auth.model';
import { LoginRedirect, LogoutRedirect } from '~/app/navigation/actions/navigation.actions';

describe('AuthEffects', () => {
  let effects: AuthEffects;
  let authService: any;
  let actions$: Observable<any>;
  let router: any;
  const authSpy = createSpyObj('AuthService', [
    'login',
    'setAuthorizationToken',
    'removeAuthorizationToken'
  ]);

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [
        AuthEffects,
        {
          provide: AuthService,
          useValue: authSpy
        },
        provideMockActions(() => actions$),
        {
          provide: Router,
          useValue: { navigate: jest.fn() }
        }
      ]
    });

    effects = TestBed.get(AuthEffects);
    authService = TestBed.get(AuthService);
    actions$ = TestBed.get(Actions);
    router = TestBed.get(Router);

    spyOn(router, 'navigate').and.callThrough();
  });

  describe('login$', () => {
    it('should return an LoginSuccess action, with user information if login succeeds', () => {
      const credentials: LoginCredentials = { username: 'test', password: '' };
      const token = 'JWT.TOKEN';
      const action = new Login(credentials);
      const completion = new LoginSuccess({ token });

      actions$ = hot('-a---', { a: action });
      // Example graphql response below
      // const response = cold('-a|', { a: { data: { login: { user, token } } } });
      const response = cold('-a|', { a: { token } });
      const expected = cold('--b', { b: completion });
      authService.login = jest.fn(() => response);

      expect(effects.login$).toBeObservable(expected);
    });

    it('should return a new LoginFailure if the login service throws', () => {
      const credentials: LoginCredentials = { username: 'someOne', password: '' };
      const action = new Login(credentials);
      const error = 'Invalid username or password';
      const completion = new LoginFailure(new Error(error));

      actions$ = hot('-a---', { a: action });
      const response = cold('-#', {}, new Error(error));
      const expected = cold('--b', { b: completion });
      authService.login = jest.fn(() => response);

      expect(effects.login$).toBeObservable(expected);
    });
  });

  describe('loginSuccess$', () => {
    it('should dispatch a LoginRedirect action', () => {
      const token = 'JWT.TOKEN';
      const action = new LoginSuccess({ token });
      const completion = new LoginRedirect();

      actions$ = hot('-a---', { a: action });
      const expected = cold('-b', { b: completion });

      expect(effects.loginSuccess$).toBeObservable(expected);
    });

    it('should call the AuthService.setAuthorizationToken with the returned token', done => {
      const spy = jest.spyOn(authService, 'setAuthorizationToken');
      spy.mockReset();
      const token = 'JWT.TOKEN';
      const action = new LoginSuccess({ token });

      actions$ = hot('-a---', { a: action });

      effects.loginSuccess$.subscribe(actn => {
        expect(spy).toHaveBeenCalled();
        expect(spy).toHaveBeenCalledWith(token);
        done();
      });

      Scheduler.get().flush();

      spy.mockReset();
    });
  });

  describe('logout$', () => {
    it('should dispatch a LogoutRedirect action', () => {
      const action = new Logout();
      const completion = new LogoutRedirect();

      actions$ = hot('-a---', { a: action });
      const expected = cold('-b', { b: completion });

      expect(effects.logout$).toBeObservable(expected);
    });

    it('should call the AuthService.removeAuthorizationToken with the returned token', done => {
      const spy = jest.spyOn(authService, 'removeAuthorizationToken');
      spy.mockReset();
      const action = new Logout();

      actions$ = hot('-a---', { a: action });

      effects.logout$.subscribe(actn => {
        expect(spy).toHaveBeenCalled();
        done();
      });

      Scheduler.get().flush();

      spy.mockReset();
    });
  });
});
