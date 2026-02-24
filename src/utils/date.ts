export function formatDate(dateString: string | null | undefined): string {
  if (!dateString) return '-'
  return new Date(dateString).toLocaleString()
}
