import type {
	IExecuteFunctions,
	INodeExecutionData,
	INodeType,
	INodeTypeDescription,
	IDataObject,
} from 'n8n-workflow';
import { NodeConnectionTypes, NodeOperationError } from 'n8n-workflow';
import type { Sharp } from 'sharp';

export class InmoSuperApp implements INodeType {
	description: INodeTypeDescription = {
		displayName: 'Inmo Super App',
		name: 'inmoSuperApp',
		icon: 'file:inmoSuperAppIcon.svg',
		group: ['transform'],
		version: 1,
		description:
			'Process different types of media - resize images, adjust text font size, adjust audio/video volume',
		defaults: {
			name: 'Inmo Super App',
		},
		inputs: [NodeConnectionTypes.Main],
		outputs: [NodeConnectionTypes.Main],
		properties: [
			{
				displayName: 'Input Type',
				name: 'inputType',
				type: 'options',
				options: [
					{
						name: 'Auto Detect',
						value: 'auto',
						description: 'Automatically detect the input type',
					},
					{
						name: 'Image',
						value: 'image',
						description: 'Process image files',
					},
					{
						name: 'Video',
						value: 'video',
						description: 'Process video files',
					},
					{
						name: 'Audio',
						value: 'audio',
						description: 'Process audio files',
					},
					{
						name: 'Text',
						value: 'text',
						description: 'Process text content',
					},
				],
				default: 'auto',
				description: 'The type of input to process',
			},
			// Image Options
			{
				displayName: 'Show Image',
				name: 'showImage',
				type: 'boolean',
				default: false,
				displayOptions: {
					show: {
						inputType: ['image', 'auto'],
					},
				},
			},
			{
				displayName: 'X',
				name: 'imageX',
				type: 'number',
				default: 100,
				displayOptions: {
					show: {
						inputType: ['image', 'auto'],
						showImage: [true],
					},
				},
			},
			{
				displayName: 'Y',
				name: 'imageY',
				type: 'number',
				default: 100,
				displayOptions: {
					show: {
						inputType: ['image', 'auto'],
						showImage: [true],
					},
				},
			},
			{
				displayName: 'Width',
				name: 'imageWidth',
				type: 'number',
				default: 100,
				displayOptions: {
					show: {
						inputType: ['image', 'auto'],
						showImage: [true],
					},
				},
			},
			{
				displayName: 'Height',
				name: 'imageHeight',
				type: 'number',
				default: 100,
				displayOptions: {
					show: {
						inputType: ['image', 'auto'],
						showImage: [true],
					},
				},
			},
			// Audio/Video Options
			{
				displayName: 'Volume Control',
				name: 'enableVolumeControl',
				type: 'boolean',
				default: false,
				displayOptions: {
					show: {
						inputType: ['video', 'audio', 'auto'],
					},
				},
			},
			{
				displayName: 'Volume',
				name: 'volume',
				type: 'number',
				typeOptions: {
					minValue: 0,
					maxValue: 100,
				},
				default: 50,
				displayOptions: {
					show: {
						inputType: ['video', 'audio', 'auto'],
						enableVolumeControl: [true],
					},
				},
			},
			// Text Options
			{
				displayName: 'Show Text',
				name: 'showText',
				type: 'boolean',
				default: false,
				displayOptions: {
					show: {
						inputType: ['text', 'auto'],
					},
				},
			},
			{
				displayName: 'X',
				name: 'textX',
				type: 'number',
				default: 100,
				displayOptions: {
					show: {
						inputType: ['text', 'auto'],
						showText: [true],
					},
				},
			},
			{
				displayName: 'Y',
				name: 'textY',
				type: 'number',
				default: 100,
				displayOptions: {
					show: {
						inputType: ['text', 'auto'],
						showText: [true],
					},
				},
			},
			{
				displayName: 'Width',
				name: 'textWidth',
				type: 'number',
				default: 100,
				displayOptions: {
					show: {
						inputType: ['text', 'auto'],
						showText: [true],
					},
				},
			},
			{
				displayName: 'Height',
				name: 'textHeight',
				type: 'number',
				default: 100,
				displayOptions: {
					show: {
						inputType: ['text', 'auto'],
						showText: [true],
					},
				},
			},
			{
				displayName: 'Font Size',
				name: 'fontSize',
				type: 'options',
				options: [
					{
						name: 'Small (12px)',
						value: 12,
					},
					{
						name: 'Medium (16px)',
						value: 16,
					},
					{
						name: 'Large (20px)',
						value: 20,
					},
					{
						name: 'Extra Large (24px)',
						value: 24,
					},
					{
						name: 'Huge (32px)',
						value: 32,
					},
				],
				default: 16,
				displayOptions: {
					show: {
						inputType: ['text', 'auto'],
						showText: [true],
					},
				},
			},
			{
				displayName: 'Font Family',
				name: 'fontFamily',
				type: 'options',
				options: [
					{
						name: 'Arial',
						value: 'Arial',
					},
					{
						name: 'Times New Roman',
						value: 'Times New Roman',
					},
					{
						name: 'Courier New',
						value: 'Courier New',
					},
					{
						name: 'Georgia',
						value: 'Georgia',
					},
					{
						name: 'Verdana',
						value: 'Verdana',
					},
					{
						name: 'Helvetica',
						value: 'Helvetica',
					},
				],
				default: 'Arial',
				displayOptions: {
					show: {
						inputType: ['text', 'auto'],
						showText: [true],
					},
				},
			},
			{
				displayName: 'Binary Property Name',
				name: 'binaryPropertyName',
				type: 'string',
				default: 'data',
				description: 'Name of the binary property that contains the file',
				displayOptions: {
					hide: {
						inputType: ['text'],
					},
				},
			},
		],
	};

	async execute(this: IExecuteFunctions): Promise<INodeExecutionData[][]> {
		const items = this.getInputData();
		const returnData: INodeExecutionData[] = [];
		const self = this;

		for (let itemIndex = 0; itemIndex < items.length; itemIndex++) {
			try {
				const inputType = this.getNodeParameter('inputType', itemIndex) as string;
				const item = items[itemIndex];

				// Auto-detect input type
				let detectedType = inputType;
				if (inputType === 'auto') {
					detectedType = await detectInputType(self, item, itemIndex);
				}

				// Process based on detected type
				switch (detectedType) {
					case 'image':
						returnData.push(await processImage(self, item, itemIndex));
						break;
					case 'video':
						returnData.push(await processVideo(self, item, itemIndex));
						break;
					case 'audio':
						returnData.push(await processAudio(self, item, itemIndex));
						break;
					case 'text':
						returnData.push(await processText(self, item, itemIndex));
						break;
					default:
						throw new NodeOperationError(
							this.getNode(),
							`Unsupported input type: ${detectedType}`,
							{ itemIndex },
						);
				}
			} catch (error) {
				if (this.continueOnFail()) {
					returnData.push({
						json: {
							error: (error as Error).message,
						},
						pairedItem: { item: itemIndex },
					});
					continue;
				}
				throw error;
			}
		}

		return [returnData];
	}
}

async function detectInputType(
	context: IExecuteFunctions,
	item: INodeExecutionData,
	itemIndex: number,
): Promise<string> {
	// Check if it's binary data
	const binaryPropertyName = context.getNodeParameter('binaryPropertyName', itemIndex) as string;
	if (item.binary?.[binaryPropertyName]) {
		const mimeType = item.binary[binaryPropertyName].mimeType;
		if (mimeType.startsWith('image/')) return 'image';
		if (mimeType.startsWith('video/')) return 'video';
		if (mimeType.startsWith('audio/')) return 'audio';
	}

	// Check if it's text in JSON
	if (item.json && typeof item.json === 'object') {
		const textFields = ['text', 'content', 'message', 'body', 'description'];
		for (const field of textFields) {
			if (typeof item.json[field] === 'string') {
				return 'text';
			}
		}
	}

	throw new NodeOperationError(
		context.getNode(),
		'Could not auto-detect input type. Please specify it manually.',
		{ itemIndex },
	);
}

async function processImage(
	context: IExecuteFunctions,
	item: INodeExecutionData,
	itemIndex: number,
): Promise<INodeExecutionData> {
	const binaryPropertyName = context.getNodeParameter('binaryPropertyName', itemIndex) as string;
	const showImage = context.getNodeParameter('showImage', itemIndex) as boolean;

	if (!item.binary?.[binaryPropertyName]) {
		throw new NodeOperationError(
			context.getNode(),
			`No binary data found in property "${binaryPropertyName}"`,
			{ itemIndex },
		);
	}

	const binaryData = item.binary[binaryPropertyName];
	const buffer = await context.helpers.getBinaryDataBuffer(itemIndex, binaryPropertyName);

	try {
		const sharp = await import('sharp');
		let sharpInstance = sharp(buffer) as Sharp;

		if (showImage) {
			const x = context.getNodeParameter('imageX', itemIndex) as number;
			const y = context.getNodeParameter('imageY', itemIndex) as number;
			const width = context.getNodeParameter('imageWidth', itemIndex) as number;
			const height = context.getNodeParameter('imageHeight', itemIndex) as number;

			sharpInstance = sharpInstance.resize(width, height);
		}

		const processedBuffer = await sharpInstance.toBuffer();
		const newBinaryData = await context.helpers.prepareBinaryData(
			processedBuffer,
			binaryData.fileName,
			binaryData.mimeType,
		);

		return {
			json: {
				...item.json,
				processed: true,
				processingType: 'image',
				showImage,
				...(showImage && {
					position: {
						x: context.getNodeParameter('imageX', itemIndex) as number,
						y: context.getNodeParameter('imageY', itemIndex) as number,
					},
					size: {
						width: context.getNodeParameter('imageWidth', itemIndex) as number,
						height: context.getNodeParameter('imageHeight', itemIndex) as number,
					},
				}),
			},
			binary: {
				[binaryPropertyName]: newBinaryData,
			},
			pairedItem: { item: itemIndex },
		};
	} catch (error) {
		throw new NodeOperationError(
			context.getNode(),
			'Image processing failed. Make sure the "sharp" package is installed.',
			{ itemIndex },
		);
	}
}

async function processVideo(
	context: IExecuteFunctions,
	item: INodeExecutionData,
	itemIndex: number,
): Promise<INodeExecutionData> {
	const binaryPropertyName = context.getNodeParameter('binaryPropertyName', itemIndex) as string;
	const enableVolumeControl = context.getNodeParameter('enableVolumeControl', itemIndex) as boolean;

	if (!item.binary?.[binaryPropertyName]) {
		throw new NodeOperationError(
			context.getNode(),
			`No binary data found in property "${binaryPropertyName}"`,
			{ itemIndex },
		);
	}

	return {
		json: {
			...item.json,
			processed: true,
			processingType: 'video',
			enableVolumeControl,
			...(enableVolumeControl && {
				volume: context.getNodeParameter('volume', itemIndex) as number,
			}),
		},
		binary: item.binary,
		pairedItem: { item: itemIndex },
	};
}

async function processAudio(
	context: IExecuteFunctions,
	item: INodeExecutionData,
	itemIndex: number,
): Promise<INodeExecutionData> {
	const binaryPropertyName = context.getNodeParameter('binaryPropertyName', itemIndex) as string;
	const enableVolumeControl = context.getNodeParameter('enableVolumeControl', itemIndex) as boolean;

	if (!item.binary?.[binaryPropertyName]) {
		throw new NodeOperationError(
			context.getNode(),
			`No binary data found in property "${binaryPropertyName}"`,
			{ itemIndex },
		);
	}

	return {
		json: {
			...item.json,
			processed: true,
			processingType: 'audio',
			enableVolumeControl,
			...(enableVolumeControl && {
				volume: context.getNodeParameter('volume', itemIndex) as number,
			}),
		},
		binary: item.binary,
		pairedItem: { item: itemIndex },
	};
}

async function processText(
	context: IExecuteFunctions,
	item: INodeExecutionData,
	itemIndex: number,
): Promise<INodeExecutionData> {
	const showText = context.getNodeParameter('showText', itemIndex) as boolean;

	// Find text in item
	let text = '';
	const textFields = ['output', 'text', 'content', 'message', 'body', 'description'];

	if (typeof item.json === 'string') {
		text = item.json;
	} else if (typeof item.json === 'object' && item.json !== null) {
		for (const field of textFields) {
			if (typeof item.json[field] === 'string') {
				text = item.json[field] as string;
				break;
			} else if (typeof item.json[field] === 'object' && item.json[field] !== null) {
				const nestedObj = item.json[field] as IDataObject;
				for (const nestedField of textFields) {
					if (typeof nestedObj[nestedField] === 'string') {
						text = nestedObj[nestedField] as string;
						break;
					}
				}
				if (text) break;
			}
		}

		if (!text) {
			try {
				text = JSON.stringify(item.json, null, 2);
			} catch (e) {}
		}
	}

	if (!text) {
		throw new NodeOperationError(
			context.getNode(),
			'No text found in item. Please make sure the input contains text data.',
			{ itemIndex },
		);
	}

	return {
		json: {
			...item.json,
			processed: true,
			processingType: 'text',
			showText,
			text,
			...(showText && {
				position: {
					x: context.getNodeParameter('textX', itemIndex) as number,
					y: context.getNodeParameter('textY', itemIndex) as number,
				},
				size: {
					width: context.getNodeParameter('textWidth', itemIndex) as number,
					height: context.getNodeParameter('textHeight', itemIndex) as number,
				},
				style: {
					fontSize: context.getNodeParameter('fontSize', itemIndex) as number,
					fontFamily: context.getNodeParameter('fontFamily', itemIndex) as string,
				},
			}),
		},
		pairedItem: { item: itemIndex },
	};
}
