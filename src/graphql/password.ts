import gql from "graphql-tag";

export const PASSWORD_LIST = gql`
  query Passwords($input: PasswordQuery!) {
    passwords(input: $input) {
      edges {
        node {
          id
          voteId
          password
          status
          createdAt
        }
        cursor
      }
      pageInfo {
        startCursor
        endCursor
        hasNextPage
        hasPreviousPage
      }
      totalCount
    }
  }
`;

export const PASSWORD_CREATE = gql`
  mutation Passwords($input: PasswordCreate!) {
    createPassword(input: $input) {
      id
      voteId
      password
      status
      createdAt
    }
  }
`;

export const PASSWORD_UPDATE = gql`
  mutation UpdatePassword($ids: [UInt64!]!, $input: PasswordUpdate!) {
    updatePassword(ids: $ids, input: $input) {
      id
      voteId
      password
      status
      createdAt
    }
  }
`;

export const PASSWORD_DELETE = gql`
  mutation DeletePassword($ids: [UInt64!]!) {
    deletePassword(ids: $ids) {
      id
      voteId
      password
      status
      createdAt
    }
  }
`;