import gql from 'graphql-tag';

export const SESSION_VIEW = gql`
  query Session($uuid: UUID!, $withPolls: Boolean!) {
    session(uuid: $uuid, withPolls: $withPolls) {
      id
      uuid
      title
      description
      startTime
      endTime
      creator {
        id
        account
        email
      }
      status
      polls @include(if: $withPolls) {
        id
        sessionId
        title
        description
        createdAt
        updatedAt
      }
    }
  }
`

export const SESSION_LIST = gql`
  query Sessions($input: SessionQuery, $withPolls: Boolean!) {
    sessions(input: $input, withPolls: $withPolls) {
      edges {
        node {
          id
          uuid
          title
          description
          startTime
          endTime
          creator {
            id
            account
            email
          }
          status
          polls @include(if: $withPolls) {
            id
            sessionId
            title
            description
            createdAt
            updatedAt
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
`

export const SESSION_CREATE = gql`
  mutation CreateSession($input: SessionCreate!) {
    createSession(input: $input) {
      id
      uuid
      title
      description
      startTime
      endTime
      creator {
          id
          account
          email
      }
      status
    }
  }
`

export const SESSION_UPDATE = gql`
  mutation Sessions($uuid: UUID!, $input: SessionUpdate!) {
    updateSession(uuid: $uuid, input: $input) {
      id
      uuid
      title
      description
      startTime
      endTime
      creator {
        id
        account
        email
      }
      status
    }
  }
`

export const SESSION_DELETE = gql`
  mutation Sessions($uuid: [UUID!]!) {
    deleteSession(uuids: $uuid) {
      id
      uuid
      title
      description
      startTime
      endTime
      creator {
        id
        account
        email
      }
      status
    }
  }
`