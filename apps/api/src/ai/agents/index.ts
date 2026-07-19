export { CoordinatorAgent } from './coordinator.agent.js'
export { CEOAgent } from './ceo.agent.js'
export { PlannerAgent } from './planner.agent.js'
export { FinanceAgent } from './finance.agent.js'
export { MarketingAgent } from './marketing.agent.js'
export { LegalAgent } from './legal.agent.js'
export { TaxAgent } from './tax.agent.js'
export { PaymentsAgent } from './payments.agent.js'
export { GrowthAgent } from './growth.agent.js'
export type { AgentContext, AgentResult } from './base.agent.js'

import { CoordinatorAgent } from './coordinator.agent.js'

let coordinatorInstance: CoordinatorAgent | null = null

export function getCoordinator(): CoordinatorAgent {
  if (!coordinatorInstance) {
    coordinatorInstance = new CoordinatorAgent()
  }
  return coordinatorInstance
}
