import gql from 'graphql-tag';

export const POLL_OPTION_VIEW = gql`
  query PollOption($id: UInt64!) {
    pollOption(id: $id) {
      id
      pollId
      name
      result
      createdAt
      updatedAt
    }
  }
`;

export const POLL_OPTION_LIST = gql`
  query PollOptions($input: PollOptionQuery!) {
    pollOptions(input: $input) {
      edges {
        node {
          id
          pollId
          name
          result
          createdAt
          updatedAt
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

export const POLL_OPTION_CREATE = gql`
  mutation PollOptions($input: PollOptionCreate!) {
    createPollOption(input: $input) {
      id
      pollId
      name
      result
      createdAt
      updatedAt
    }
  }
`;

export const POLL_OPTION_UPDATE = gql`
  mutation PollOptions($id: UInt64!, $input: PollOptionUpdate!) {
    updatePollOption(id: $id, input: $input) {
      id
      pollId
      name
      result
      createdAt
      updatedAt
    }
  }
`;

export const POLL_OPTION_DELETE = gql`
  mutation PollOptions($ids: [UInt64!]!) {
    deletePollOption(ids: $ids) {
      id
      pollId
      name
      result
      createdAt
      updatedAt
    }
  }
`;