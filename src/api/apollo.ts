import { ApolloClient, HttpLink, InMemoryCache } from '@apollo/client/core'
import { createApolloProvider } from '@vue/apollo-option'

function getHeaders() {
  const headers: Record<string, string> = {};
  const token = localStorage.getItem("token");
  if (token) {
    headers["Authorization"] = `Bearer ${token}`;
  }
  headers["Content-Type"] = "application/json";
  return headers;
}


const httpLink = new HttpLink({
  // You should use an absolute URL here
  uri: import.meta.env.VITE_API_BASE_URL + '/query',
  fetch: (uri: RequestInfo | URL, options?: RequestInit) => {
    if (options) {
      options.headers = getHeaders();
    }
    return fetch(uri, options);
  },
})

// Create the apollo client
const apolloClient = new ApolloClient({
  link: httpLink,
  cache: new InMemoryCache(),
  devtools: {
    enabled: true,
  }
})

// Create a provider
export const apolloProvider = createApolloProvider({
  defaultClient: apolloClient,
})