import gql from 'graphql-tag';

export const VOTE_VIEW = gql`
  query Votes($vote: VoteQuery, $withQuestions: Boolean!) {
    votes(input: $vote, withQuestions: $withQuestions) {
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
          questions @include(if: $withQuestions) {
            id
            voteId
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

export const VOTE_CREATE = gql`
  mutation CreateVote($input: VoteCreate!) {
    createVote(input: $input) {
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

export const VOTE_DELETE = gql`
  mutation Votes($uuid: [UUID!]!) {
    deleteVote(uuids: $uuid) {
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