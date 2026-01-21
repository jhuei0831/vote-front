import gql from 'graphql-tag';

export const QUESTION_VIEW = gql`
  query Question($id: UInt64!, $withCandidates: Boolean!) {
    question(id: $id, withCandidates: $withCandidates) {
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
  }
`;

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

export const QUESTION_CREATE = gql`
  mutation Questions($input: QuestionCreate!) {
    createQuestion(input: $input) {
      id
      voteId
      title
      description
      createdAt
      updatedAt
    }
  }
`;

export const QUESTION_UPDATE = gql`
  mutation Questions($id: UInt64!, $input: QuestionUpdate!) {
    updateQuestion(id: $id, input: $input) {
      id
      voteId
      title
      description
      createdAt
      updatedAt
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