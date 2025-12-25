<template>
  <div>Votes</div>
</template>

<script>
import gql from 'graphql-tag'

export default {
  apollo: {
    ping: {
    // gql query
      query: gql`query Votes($vote: VoteQuery, $withQuestions: Boolean!) {
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
}`,
      // Static parameters
      variables: {
        vote: {
          first: "4"
        },
        withQuestions: false
      },
    },
  }
}
</script>