import { Injectable } from '@angular/core';
import { Apollo } from 'apollo-angular';
import gql from 'graphql-tag';
import { Observable } from 'rxjs';
import { ApolloQueryResult } from 'apollo-client';
import { FetchResult } from 'apollo-link';
import * as omit from 'lodash.omit';

@Injectable({
  providedIn: 'root'
})
export class GraphQLService {
  constructor(private apollo: Apollo) {}

  query<T>(query: string, variables?: any): Observable<ApolloQueryResult<T>> {
    const cleanVariables = this.removeTypenameProperty(variables);
    return this.apollo.query<T>({
      query: gql`
        ${query}
      `,
      variables: cleanVariables
    });
  }

  mutation<T>(query: string, variables: any): Observable<FetchResult<T>> {
    const cleanVariables = this.removeTypenameProperty(variables);
    return this.apollo.mutate<T>({
      mutation: gql`
        ${query}
      `,
      variables: cleanVariables
    });
  }

  /**
   * Utility function to remove the '__typename' property that apollo cache created
   * @param variables the query variables to cleanse
   */
  private removeTypenameProperty(
    variables: undefined | { [key: string]: any | undefined }
  ): undefined | { [key: string]: any | undefined } {
    if (variables) {
      const cleanVariables = {};
      Object.keys(variables).forEach(key => {
        if (typeof variables[key] === 'object') {
          cleanVariables[key] = omit(variables[key], '__typename');
        } else {
          cleanVariables[key] = variables[key];
        }
      });
      return cleanVariables;
    } else {
      return undefined;
    }
  }
}
