export interface Tool {
  name: string
  description: string
  parameters: Record<string, {
    type: string
    description: string
    required?: boolean
  }>
  execute: (params: Record<string, unknown>, userId: string) => Promise<string>
}
