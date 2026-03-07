import gql from "graphql-tag";

export const INVITATION_DECRYPT = gql`
  query DecryptInvitation($codeHash: String!) {
    decryptInvitation(codeHash: $codeHash)
  }
`;

export const INVITATION_LIST = gql`
  query Invitations($input: InvitationQuery!) {
    invitations(input: $input) {
      edges {
        node {
          id
          sessionId
          codeHash
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

export const INVITATION_CREATE = gql`
  mutation Invitations($input: InvitationCreate!) {
    createInvitation(input: $input) {
      id
      sessionId
      codeHash
      status
      createdAt
    }
  }
`;

export const INVITATION_UPDATE = gql`
  mutation UpdateInvitation($ids: [UInt64!]!, $input: InvitationUpdate!) {
    updateInvitation(ids: $ids, input: $input) {
      id
      sessionId
      codeHash
      status
      createdAt
    }
  }
`;

export const INVITATION_DELETE = gql`
  mutation DeleteInvitation($ids: [UInt64!]!) {
    deleteInvitation(ids: $ids) {
      id
      sessionId
      codeHash
      status
      createdAt
    }
  }
`;