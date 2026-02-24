import { computed, ref } from 'vue'
import { provideApolloClient, useQuery } from '@vue/apollo-composable'
import { apolloProvider } from '@/api/apollo'
import type { DocumentNode } from 'graphql'

interface UseEntityListOptions<TResult, TVariables> {
  query: DocumentNode
  variables: TVariables
  extractEdges: (result: TResult | undefined) => Array<{ node: any }> | undefined
  getTotalCount: (result: TResult | undefined) => number
}

export function useEntityList<TResult, TVariables>(
  options: UseEntityListOptions<TResult, TVariables>
) {
  const { result, loading, error, refetch } = provideApolloClient(apolloProvider.defaultClient)(() =>
    useQuery<TResult>(options.query, ref(options.variables))
  )

  const items = computed(() => {
    const edges = options.extractEdges(result.value)
    if (!edges) return []
    return edges.map(edge => edge.node)
  })

  const totalCount = computed(() => {
    return options.getTotalCount(result.value)
  })

  return {
    result,
    loading,
    error,
    refetch,
    items,
    totalCount
  }
}
