export const queryKeys = {
  health: (baseUrl: string) => ['health', baseUrl] as const,
  apiInfo: (baseUrl: string) => ['api-info', baseUrl] as const,
  analysis: (id: string) => ['analysis', id] as const,
}
