/** Central route table so links never hard-code paths. */
export const paths = {
  home: '/',
  dashboard: '/app',
  analyze: '/app/analyze',
  report: (id: string) => `/app/reports/${encodeURIComponent(id)}`,
  reportPattern: '/app/reports/:id',
  sampleReport: '/app/reports/sample',
  docs: '/app/docs',
  settings: '/app/settings',
} as const
