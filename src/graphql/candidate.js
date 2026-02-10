import gql from 'graphql-tag';

export const CANDIDATE_VIEW = gql`
  query Candidate($id: UInt64!) {
    candidate(id: $id) {
      id
      questionId
      name
      result
      createdAt
      updatedAt
    }
  }
`;

export const CANDIDATE_LIST = gql`
  query Candidates($query: CandidateQuery!) {
    candidates(input: $query) {
      edges {
        node {
          id
          questionId
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

export const CANDIDATE_CREATE = gql`
  mutation Candidates($input: CandidateCreate!) {
    createCandidate(input: $input) {
      id
      questionId
      name
      result
      createdAt
      updatedAt
    }
  }
`;

export const CANDIDATE_UPDATE = gql`
  mutation Candidates($id: UInt64!, $input: CandidateUpdate!) {
    updateCandidate(id: $id, input: $input) {
      id
      questionId
      name
      result
      createdAt
      updatedAt
    }
  }
`;

export const CANDIDATE_DELETE = gql`
  mutation Candidates($ids: [UInt64!]!) {
    deleteCandidate(ids: $ids) {
      id
      questionId
      name
      result
      createdAt
      updatedAt
    }
  }
`;