import type { IRun, INodeExecutionData } from 'n8n-workflow';

/**
 * Calculate total tokens consumed from execution run data
 * Only considers actual tokenUsage, ignores tokenUsageEstimate
 */
export function calculateTotalTokensConsumed(runData: IRun): number {
	if (!runData?.data?.resultData?.runData) {
		return 0;
	}

	let totalTokens = 0;

	// Iterate through all nodes in the execution
	for (const [, nodeExecutions] of Object.entries(runData.data.resultData.runData)) {
		// Each node can have multiple executions (runs)
		for (const execution of nodeExecutions) {
			if (!execution.data) continue;

			// Check all output connections (main, ai_languageModel, etc.)
			for (const [, connectionData] of Object.entries(execution.data)) {
				if (!Array.isArray(connectionData)) continue;

				// Each connection can have multiple items
				for (const itemGroup of connectionData) {
					if (!Array.isArray(itemGroup)) continue;

					for (const item of itemGroup) {
						// Look for tokenUsage in the JSON data (ignore tokenUsageEstimate)
						const tokenUsage = (item as INodeExecutionData)?.json?.tokenUsage;

						if (tokenUsage && typeof tokenUsage === 'object' && 'totalTokens' in tokenUsage) {
							const tokens = Number(tokenUsage.totalTokens);
							if (!isNaN(tokens) && tokens > 0) {
								totalTokens += tokens;
							}
						}
					}
				}
			}
		}
	}

	return totalTokens;
}
