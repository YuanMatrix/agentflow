import type {
	IExecuteFunctions,
	INodeExecutionData,
	INodeType,
	INodeTypeDescription,
	IHttpRequestOptions,
	IBinaryData,
} from 'n8n-workflow';
import { NodeConnectionTypes, NodeOperationError } from 'n8n-workflow';

export class Replicate implements INodeType {
	description: INodeTypeDescription = {
		displayName: 'Replicate',
		name: 'replicate',
		icon: 'file:replicate.svg',
		group: ['transform'],
		version: 1,
		subtitle: 'AI Image Generation',
		description: 'Generate images using Replicate AI models',
		defaults: {
			name: 'Replicate',
		},
		inputs: [NodeConnectionTypes.Main],
		outputs: [NodeConnectionTypes.Main],
		credentials: [
			{
				name: 'replicateApi',
				required: true,
			},
		],
		properties: [
			{
				displayName: 'Model',
				name: 'model',
				type: 'options',
				options: [
					{
						name: 'FLUX Schnell',
						value: 'black-forest-labs/flux-schnell',
					},
				],
				default: 'black-forest-labs/flux-schnell',
				description: 'The AI model to use for image generation',
			},
			{
				displayName: 'Prompt Field',
				name: 'promptField',
				type: 'string',
				default: 'chatInput',
				description:
					'The field name containing the prompt text (e.g., chatInput, output, message, etc.)',
				placeholder: 'chatInput',
			},
		],
	};

	async execute(this: IExecuteFunctions): Promise<INodeExecutionData[][]> {
		const items = this.getInputData();
		const returnData: INodeExecutionData[] = [];

		for (let itemIndex = 0; itemIndex < items.length; itemIndex++) {
			try {
				const item = items[itemIndex];
				const model = this.getNodeParameter('model', itemIndex) as string;
				const promptField = this.getNodeParameter('promptField', itemIndex) as string;

				// Get prompt from input data with fallback logic
				let prompt: string | undefined;

				// First try the specified field
				if (item.json[promptField]) {
					prompt = item.json[promptField] as string;
				} else {
					// Fallback to common field names if the specified field doesn't exist
					const commonFields = ['output', 'message', 'text', 'content', 'input'];

					for (const field of commonFields) {
						if (item.json[field]) {
							prompt = item.json[field] as string;
							break;
						}
					}
				}

				if (!prompt) {
					throw new NodeOperationError(
						this.getNode(),
						`No prompt found in field "${promptField}" or common fallback fields (output, message, text, content, input)`,
						{ itemIndex },
					);
				}

				// Step 1: POST request to start generation
				const postUrl = `https://api.replicate.com/v1/models/${model}/predictions`;
				const postOptions: IHttpRequestOptions = {
					method: 'POST',
					url: postUrl,
					json: true,
					body: {
						input: {
							prompt: prompt,
						},
					},
				};

				const predictionResponse = await this.helpers.httpRequestWithAuthentication.call(
					this,
					'replicateApi',
					postOptions,
				);

				// Step 2: Code execution - extract image URL
				// Simulating the code: const output = $input.first().json.urls?.[0] || $input.first().json.output?.[0]
				let imageUrl: string | undefined;

				// Check various possible response formats from Replicate
				if (
					predictionResponse.urls &&
					Array.isArray(predictionResponse.urls) &&
					predictionResponse.urls.length > 0
				) {
					imageUrl = predictionResponse.urls[0];
				} else if (
					predictionResponse.output &&
					Array.isArray(predictionResponse.output) &&
					predictionResponse.output.length > 0
				) {
					imageUrl = predictionResponse.output[0];
				} else if (typeof predictionResponse.output === 'string') {
					imageUrl = predictionResponse.output;
				}

				if (!imageUrl) {
					// If no immediate URL, we need to wait for the prediction to complete
					const predictionId = predictionResponse.id;
					if (!predictionId) {
						throw new NodeOperationError(
							this.getNode(),
							'No prediction ID returned from Replicate API',
							{ itemIndex },
						);
					}

					// Poll for completion (with timeout)
					let attempts = 0;
					const maxAttempts = 30; // 5 minutes max wait time
					const pollInterval = 10000; // 10 seconds

					while (attempts < maxAttempts) {
						await new Promise((resolve) => setTimeout(resolve, pollInterval));

						const statusOptions: IHttpRequestOptions = {
							method: 'GET',
							url: `https://api.replicate.com/v1/predictions/${predictionId}`,
							json: true,
						};

						const statusResponse = await this.helpers.httpRequestWithAuthentication.call(
							this,
							'replicateApi',
							statusOptions,
						);

						if (statusResponse.status === 'succeeded') {
							if (
								statusResponse.output &&
								Array.isArray(statusResponse.output) &&
								statusResponse.output.length > 0
							) {
								imageUrl = statusResponse.output[0];
								break;
							} else if (typeof statusResponse.output === 'string') {
								imageUrl = statusResponse.output;
								break;
							}
						} else if (statusResponse.status === 'failed' || statusResponse.status === 'canceled') {
							throw new NodeOperationError(
								this.getNode(),
								`Image generation failed: ${statusResponse.error || 'Unknown error'}`,
								{ itemIndex },
							);
						}

						attempts++;
					}

					if (!imageUrl) {
						throw new NodeOperationError(
							this.getNode(),
							'Timeout waiting for image generation to complete',
							{ itemIndex },
						);
					}
				}

				// Step 3: Download image as binary data
				const imageBuffer = (await this.helpers.httpRequest({
					method: 'GET',
					url: imageUrl,
					json: false,
					encoding: 'arraybuffer',
				})) as Buffer;

				// Create binary data
				const mimeType = 'image/png'; // Default to PNG, could be detected from URL extension
				const fileName = `generated-image-${Date.now()}.png`;

				const binaryData = await this.helpers.prepareBinaryData(imageBuffer, fileName, mimeType);

				// Return result with both JSON metadata and binary image
				const result: INodeExecutionData = {
					json: {
						...item.json,
						replicate: {
							model,
							prompt,
							imageUrl,
							predictionId: predictionResponse.id,
							status: 'completed',
						},
					},
					binary: {
						data: binaryData,
					},
					pairedItem: {
						item: itemIndex,
					},
				};

				returnData.push(result);
			} catch (error) {
				if (this.continueOnFail()) {
					const result: INodeExecutionData = {
						json: {
							...items[itemIndex].json,
							error: error.message,
						},
						pairedItem: {
							item: itemIndex,
						},
					};
					returnData.push(result);
					continue;
				}
				throw error;
			}
		}

		return [returnData];
	}
}
