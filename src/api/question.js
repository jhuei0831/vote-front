import gql from 'graphql-tag';

export const QUESTION_LIST = gql`
  query Questions($questionQuery: QuestionQuery!, $withCandidates: Boolean!) {
    questions(input: $questionQuery, withCandidates: $withCandidates) {
      edges {
        node {
          id
          voteId
          title
          description
          createdAt
          updatedAt
          candidates @include(if: $withCandidates) {
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

export const QUESTION_DELETE = gql`
  mutation Questions($ids: [UInt64!]!) {
    deleteQuestion(ids: $ids) {
      id
      voteId
      title
      description
      createdAt
      updatedAt
    }
  }
`;