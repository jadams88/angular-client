import { TestBed } from '@angular/core/testing';
import { Apollo } from 'apollo-angular';

import { GraphQLService } from './graphql.service';
import { of } from 'rxjs';

describe('GraphQLService', () => {
  let graphQLService: GraphQLService;
  let apolloSpy: any;
  const spyClass = { query: jest.fn(), mutate: jest.fn() };

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [GraphQLService, { provide: Apollo, useValue: spyClass }]
    });

    // Inject the Apollo service and test controller for each test
    graphQLService = TestBed.get(GraphQLService);
    apolloSpy = TestBed.get(Apollo);
  });

  it('should be created', () => {
    expect(graphQLService).toBeTruthy();
  });

  describe('query', () => {
    it('should return an Apollo Query Result', () => {
      const query = `
      {
        query {
          id
        }
      }`;

      apolloSpy.query = jest.fn(() => of({ data: 'success' }));
      const spy = jest.spyOn(apolloSpy, 'query');
      graphQLService.query(query).subscribe(result => {
        expect(result.data).toEqual('success');
        expect(apolloSpy.query).toHaveBeenCalled();
        expect(spy.mock.calls[0][1]).toBeUndefined();
      });
    });

    it('should send query variables if they are passed', () => {
      const query = `
      {
        query {
          id
        }
      }`;

      const variable = { variable: 'test' };

      apolloSpy.query = jest.fn(() => of({ data: 'success' }));
      const spy = jest.spyOn(apolloSpy, 'query');

      graphQLService.query(query, variable).subscribe(result => {
        expect(result.data).toEqual('query success');
        expect(apolloSpy.query).toHaveBeenCalled();
        expect(spy.mock.calls[0][1]).toBeDefined();
      });
    });
  });

  describe('mutation', () => {
    it('should return an Apollo Fetch Result', () => {
      const query = `
      mutation LoginUser($username: String!, $password: String!){
        login(username: $username, password: $password){
          user {
            username
          }
          token
        }
      }
      `;
      const variable = { username: 'test', password: 'password' };
      apolloSpy.mutate = jest.fn(() => of({ data: 'mutate success' }));
      const spy = jest.spyOn(apolloSpy, 'mutate');

      graphQLService.mutation<any>(query, variable).subscribe(result => {
        expect(result.data as any).toEqual('mutate success');
        expect(apolloSpy.mutate).toHaveBeenCalled();
        expect(spy.mock.calls[0][1]).toBeDefined();
        expect(spy.mock.calls[0][1]).toEqual(variable);
      });
    });
  });
});
