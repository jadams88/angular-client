const serverUrl = 'http://10.0.2.2';

console.log('inside android dev');

export const environment = {
  production: false,
  serverUrl: `${serverUrl}:3000`,
  apiBaseUrl: `${serverUrl}:3000/api`,
  graphQLUrl: `${serverUrl}:3000/graphql`
};
