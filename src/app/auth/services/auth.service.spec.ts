import { TestBed } from '@angular/core/testing';
import { RouterTestingModule } from '@angular/router/testing';
import { GraphQLError } from 'graphql';
import { sign } from 'jsonwebtoken';
import { AuthService } from './auth.service';

import { LoginCredentials, LoginResponse } from '../auth.model';
// import { GraphQLStub } from 'test';
import { GraphQLService } from '@app-core/graphql';
import { GraphQLStub } from '@tests/graphql.stubs';
import { HttpClientTestingModule, HttpTestingController } from '@angular/common/http/testing';
import { environment } from '@env/environment';

describe('AuthService', () => {
  let authService: AuthService;
  let graphQLStub: GraphQLStub;
  let httpTestingController: HttpTestingController;
  let JWT: string;
  const storageKey = 'access_token';
  const tokenSecret = 'this-is-a-test-secret';

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [AuthService, { provide: GraphQLService, useClass: GraphQLStub }],
      imports: [HttpClientTestingModule, RouterTestingModule.withRoutes([])]
    });
    authService = TestBed.get(AuthService);
    graphQLStub = TestBed.get(GraphQLService);
    httpTestingController = TestBed.get(HttpTestingController);

    // Create a JWT for each test that is valid and has not expired
    JWT = sign(
      {
        sub: '123',
        admin: true // used to conditionally hide routes on the client
      },
      tokenSecret,
      {
        expiresIn: 1000
      }
    );
  });

  afterEach(() => {
    localStorage.removeItem(storageKey);
  });

  it('should be created', () => {
    expect(authService).toBeTruthy();
  });

  describe('setAuthorizationToken', () => {
    it('should set the access token', () => {
      localStorage.removeItem(storageKey);
      const tokenBeforeSetting = localStorage.getItem(storageKey);
      expect(tokenBeforeSetting).toEqual(null);

      authService.setAuthorizationToken(JWT);
      const token = localStorage.getItem(storageKey);

      expect(token).toBeTruthy();
      expect(token).toEqual(JWT);
    });
  });

  describe('getAuthorizationToken', () => {
    it('should get the access token', () => {
      localStorage.setItem(storageKey, JWT);
      const token = authService.getAuthorizationToken();

      expect(token).toBeDefined();
      expect(token).toEqual(JWT);
    });
  });

  describe('removeAuthorizationToken', () => {
    it('should remove the access token', () => {
      localStorage.setItem(storageKey, JWT);
      const token = localStorage.getItem(storageKey);

      // First check the token is there
      expect(token).toBeTruthy();

      // Call the remove token function
      authService.removeAuthorizationToken();

      const tokenAfterRemove = localStorage.getItem(storageKey);
      expect(tokenAfterRemove).toEqual(null);
    });
  });

  describe('decodeToken', () => {
    it('should return a decoded token', () => {
      const decodedToken = authService.decodeToken(JWT);

      expect(typeof decodedToken).toEqual('object');
      expect(decodedToken.sub).toEqual('123');
    });
  });

  describe('checkTokenIsValid', () => {
    it('should return true if the token has not expired', () => {
      const token = sign({ sub: '1' }, tokenSecret, { expiresIn: 10000 });
      const valid = authService.checkTokenIsValid(token);

      expect(valid).toEqual(true);
    });

    it('should return false if the token has expired', () => {
      const token = sign({ sub: '1' }, tokenSecret, { expiresIn: -10000 });
      const valid = authService.checkTokenIsValid(token);

      expect(valid).toEqual(false);
    });
  });

  describe('checkUserIsLoggedIn', () => {
    it('should return true if there is a token and it is valid', () => {
      localStorage.setItem(storageKey, JWT);
      const loggedIn = authService.checkUserIsLoggedIn();

      expect(loggedIn).toEqual(true);
    });

    it('should return false if there is no token', () => {
      const loggedIn = authService.checkUserIsLoggedIn();

      expect(loggedIn).toEqual(false);
    });

    it('should return false if the token is invalid', () => {
      const token = sign({ sub: '1' }, tokenSecret, { expiresIn: -1000 });
      localStorage.setItem(storageKey, token);

      const loggedIn = authService.checkUserIsLoggedIn();

      expect(loggedIn).toEqual(false);
    });
  });

  describe('checkUserIsAdmin', () => {
    it('should return true if the token is valid and the user is an admin', () => {
      localStorage.setItem(storageKey, JWT);
      const admin = authService.checkUserIsAdmin();

      expect(admin).toEqual(true);
    });

    it('should return false if there is no token', () => {
      const admin = authService.checkUserIsAdmin();

      expect(admin).toEqual(false);
    });

    it('should return false if the token is not valid', () => {
      const token = sign({ sub: '1', admin: true }, tokenSecret, { expiresIn: -1000 });
      localStorage.setItem(storageKey, token);

      const admin = authService.checkUserIsAdmin();

      expect(admin).toEqual(false);
    });

    it('should return false if the user is not an admin', () => {
      const token = sign({ sub: '1', admin: false }, tokenSecret, { expiresIn: 1000 });
      localStorage.setItem(storageKey, token);

      const admin = authService.checkUserIsAdmin();

      expect(admin).toEqual(false);
    });
  });

  describe('login', () => {
    it('should make a POST request with LoginCredentials to the /authorize route', () => {
      const loginCredentials: LoginCredentials = {
        username: 'admin',
        password: 'secret'
      };

      const expectedResponse: LoginResponse = {
        user: {
          id: '1',
          username: 'admin',
          email: 'email@test.com'
        },
        token: JWT
      };

      // Make an HTTP GET request
      authService.login(loginCredentials).subscribe(data => {
        // When observable resolves, result should match test data
        expect(data).toEqual(expectedResponse);
      });

      // The following `expectOne()` will match the request's URL.
      // If no requests or multiple requests matched that URL
      // `expectOne()` would throw.
      const req = httpTestingController.expectOne(`${environment.serverUrl}/authorize`);

      // Assert that the request is a POST.
      expect(req.request.method).toEqual('POST');

      // Respond with mock data, causing Observable to resolve.
      // Subscribe callback asserts that correct data was returned.
      req.flush(expectedResponse);

      // Finally, assert that there are no outstanding requests.
      httpTestingController.verify();
    });

    /// GraphQL login response check
    // it('should return a LoginResponse if called with valid credentials', () => {
    //   const spy = jest.spyOn(graphQLStub, 'mutation');
    //   const loginCredentials: LoginCredentials = {
    //     username: 'admin',
    //     password: 'secret'
    //   };
    //   const expectedResponse: LoginResponse = {
    //     user: {
    //       id: '1',
    //       name: 'admin',
    //       email: 'email@test.com'
    //     },
    //     token: JWT
    //   };
    //   // Set the response from the the stub
    //   graphQLStub.setExpectedResponse<{ login: LoginResponse }>({ login: expectedResponse });
    //   authService.login(loginCredentials).subscribe(
    //     response => {
    //       expect(response.errors).toBeUndefined();
    //       expect(response.data.login).toBeDefined();
    //       expect(response.data.login).toEqual(expectedResponse);
    //       expect(graphQLStub.mutation).toHaveBeenCalled();
    //       expect(spy.mock.calls[0][1]).toEqual(loginCredentials);
    //     },
    //     error => console.log(error)
    //   );
    // });
    //   it('should reuturn an error if credentials are incorrect', () => {
    //     const spy = jest.spyOn(graphQLStub, 'mutation');
    //     const loginCredentials: LoginCredentials = {
    //       username: 'unauthorized',
    //       password: 'noidea'
    //     };
    //     const graphErrors: GraphQLError[] = [{ name: 'Unauthorized Error', message: 'Unauthorized' }];
    //     // Set the response from the the stub
    //     graphQLStub.setErrorResponse(graphErrors);
    //     authService.login(loginCredentials).subscribe(
    //       response => {
    //         expect(response.data).toEqual(null);
    //         expect(response.errors).toBeDefined();
    //         expect(response.errors[0].message).toEqual('Unauthorized');
    //         expect(graphQLStub.mutation).toHaveBeenCalled();
    //         expect(spy.mock.calls[0][1]).toEqual(loginCredentials);
    //       },
    //       error => console.log(error)
    //     );
    //   });
  });
});
