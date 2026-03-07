import gql from 'graphql-tag';

export const POLL_VIEW = gql`
  query Poll($id: UInt64!, $withPollOptions: Boolean!) {
    poll(id: $id, withPollOptions: $withPollOptions) {
      id
      sessionId
      title
      description
      createdAt
      updatedAt
      pollOptions @include(if: $withPollOptions) {
        id
      }
    }
  }
`;

export const POLL_LIST = gql`
  query Polls($input: PollQuery!, $withPollOptions: Boolean!) {
    polls(input: $input, withPollOptions: $withPollOptions) {
      edges {
        node {
          id
          sessionId
          title
          description
          createdAt
          updatedAt
          pollOptions @include(if: $withPollOptions) {
            id
          }
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

export const POLL_SELECT_LIST = gql`
  query PollList($sessionId: UUID!) {
    pollList(sessionId: $sessionId) {
      list {
        id
        sessionId
        title
        description
        createdAt
        updatedAt
      }
    }
  }
`;

export const POLL_CREATE = gql`
  mutation Polls($input: PollCreate!) {
    createPoll(input: $input) {
      id
      sessionId
      title
      description
      createdAt
      updatedAt
    }
  }
`;

export const POLL_UPDATE = gql`
  mutation Polls($id: UInt64!, $input: PollUpdate!) {
    updatePoll(id: $id, input: $input) {
      id
      sessionId
      title
      description
      createdAt
      updatedAt
    }
  }
`;

export const POLL_DELETE = gql`
  mutation Polls($ids: [UInt64!]!) {
    deletePoll(ids: $ids) {
      id
      sessionId
      title
      description
      createdAt
      updatedAt
    }
  }
`;