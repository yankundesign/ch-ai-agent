import { mockAgentDatabase } from './mockAgentDatabase';

// Export the first agent (Calling Settings Transfer) as default
export const mockAgentDetails = mockAgentDatabase[0];

// Export the full database for future use
export { mockAgentDatabase };
