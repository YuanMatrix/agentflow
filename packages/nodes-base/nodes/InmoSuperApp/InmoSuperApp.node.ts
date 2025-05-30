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
				displayName: 'Binary Property Name',
				name: 'binaryPropertyName',
				type: 'string',
				default: 'data0',
				description: 'Name of the binary property that contains the file',
			},
			// Image Options
			{
				displayName: 'Show Image',
				name: 'showImage',
				type: 'boolean',
				default: true,
			},
			{
				displayName: 'Image Position X',
				name: 'imagePosX',
				type: 'number',
				default: 100,
				displayOptions: {
					show: {
						showImage: [true],
					},
				},
			},
			{
				displayName: 'Image Position Y',
				name: 'imagePosY',
				type: 'number',
				default: 100,
				displayOptions: {
					show: {
						showImage: [true],
					},
				},
			},
			{
				displayName: 'Image Width',
				name: 'imageResizeWidth',
				type: 'number',
				default: 100,
				displayOptions: {
					show: {
						showImage: [true],
					},
				},
			},
			{
				displayName: 'Image Height',
				name: 'imageResizeHeight',
				type: 'number',
				default: 100,
				displayOptions: {
					show: {
						showImage: [true],
					},
				},
			},
			// Audio/Video Options
			{
				displayName: 'Volume Control',
				name: 'enableVolumeControl',
				type: 'boolean',
				default: true,
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
						enableVolumeControl: [true],
					},
				},
			},
			// Text Options
			{
				displayName: 'Show Text',
				name: 'showText',
				type: 'boolean',
				default: true,
			},
			{
				displayName: 'X',
				name: 'textX',
				type: 'number',
				default: 100,
				displayOptions: {
					show: {
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
						showText: [true],
					},
				},
			},
		],
	};

	async execute(this: IExecuteFunctions): Promise<INodeExecutionData[][]> {
		const items = this.getInputData();
		const returnData: INodeExecutionData[] = [];

		for (let itemIndex = 0; itemIndex < items.length; itemIndex++) {
			try {
				const item = items[itemIndex];
				const result: INodeExecutionData = {
					json: { ...item.json },
					binary: { ...item.binary },
					pairedItem: { item: itemIndex },
				};

				if (await hasText(item)) {
					const textResult = await processText(this, item, itemIndex);
					result.json = { ...result.json, ...textResult.json };
				}

				if (await hasImage(item)) {
					const imageResult = await processImage(this, item, itemIndex);
					result.json = { ...result.json, ...imageResult.json };
					result.binary = { ...result.binary, ...imageResult.binary };
				}

				if (await hasVideo(item)) {
					const videoResult = await processVideo(this, item, itemIndex);
					result.json = { ...result.json, ...videoResult.json };
					result.binary = { ...result.binary, ...videoResult.binary };
				}

				if (await hasAudio(item)) {
					const audioResult = await processAudio(this, item, itemIndex);
					result.json = { ...result.json, ...audioResult.json };
					result.binary = { ...result.binary, ...audioResult.binary };
				}

				returnData.push(result);
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

// 辅助函数：检查是否包含文本
async function hasText(item: INodeExecutionData): Promise<boolean> {
	const textFields = ['chatInput', 'text', 'content', 'message', 'body', 'description'];
	const jsonData = item.json as string | IDataObject;

	if (typeof jsonData === 'string' && jsonData.trim() !== '') {
		return true;
	}

	if (typeof jsonData === 'object' && jsonData !== null) {
		for (const field of textFields) {
			const value = jsonData[field];
			if (typeof value === 'string' && value.trim() !== '') {
				return true;
			}
		}
	}
	return false;
}

// 辅助函数：检查是否包含图片
async function hasImage(item: INodeExecutionData): Promise<boolean> {
	if (item.json?.files && Array.isArray(item.json.files)) {
		const file = item.json.files[0];
		if (file.fileType === 'image' || file.mimeType?.startsWith('image/')) {
			return true;
		}
	}
	if (item.binary) {
		for (const key in item.binary) {
			if (item.binary[key].mimeType.startsWith('image/')) {
				return true;
			}
		}
	}
	return false;
}

// 辅助函数：检查是否包含视频
async function hasVideo(item: INodeExecutionData): Promise<boolean> {
	if (item.json?.files && Array.isArray(item.json.files)) {
		const file = item.json.files[0];
		if (file.fileType === 'video' || file.mimeType?.startsWith('video/')) {
			return true;
		}
	}
	if (item.binary) {
		for (const key in item.binary) {
			if (item.binary[key].mimeType.startsWith('video/')) {
				return true;
			}
		}
	}
	return false;
}

// 辅助函数：检查是否包含音频
async function hasAudio(item: INodeExecutionData): Promise<boolean> {
	if (item.json?.files && Array.isArray(item.json.files)) {
		const file = item.json.files[0];
		if (file.fileType === 'audio' || file.mimeType?.startsWith('audio/')) {
			return true;
		}
	}
	if (item.binary) {
		for (const key in item.binary) {
			if (item.binary[key].mimeType.startsWith('audio/')) {
				return true;
			}
		}
	}
	return false;
}

async function processImage(
	context: IExecuteFunctions,
	item: INodeExecutionData,
	itemIndex: number,
): Promise<INodeExecutionData> {
	const showImage = context.getNodeParameter('showImage', itemIndex) as boolean;
	let binaryData;
	let buffer;

	if (item.json?.files && Array.isArray(item.json.files)) {
		const file = item.json.files[0];
		if (
			(file.fileType === 'image' || file.mimeType?.startsWith('image/')) &&
			item.binary?.['files_0']
		) {
			binaryData = item.binary['files_0'];
			buffer = await context.helpers.getBinaryDataBuffer(itemIndex, 'files_0');
		}
	}

	if (!binaryData) {
		const binaryPropertyName = context.getNodeParameter('binaryPropertyName', itemIndex) as string;
		if (!item.binary?.[binaryPropertyName]) {
			throw new NodeOperationError(
				context.getNode(),
				`No binary data found in property "${binaryPropertyName}"`,
				{ itemIndex },
			);
		}
		binaryData = item.binary[binaryPropertyName];
		buffer = await context.helpers.getBinaryDataBuffer(itemIndex, binaryPropertyName);
	}

	try {
		// eslint-disable-next-line @typescript-eslint/no-var-requires
		const sharp = require('sharp');
		let sharpInstance = sharp(buffer);

		if (showImage) {
			const imageX = context.getNodeParameter('imagePosX', itemIndex) as number;
			const imageY = context.getNodeParameter('imagePosY', itemIndex) as number;
			const width = context.getNodeParameter('imageResizeWidth', itemIndex) as number;
			const height = context.getNodeParameter('imageResizeHeight', itemIndex) as number;

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
					imagePosition: {
						x: context.getNodeParameter('imagePosX', itemIndex) as number,
						y: context.getNodeParameter('imagePosY', itemIndex) as number,
					},
					imageSize: {
						width: context.getNodeParameter('imageResizeWidth', itemIndex) as number,
						height: context.getNodeParameter('imageResizeHeight', itemIndex) as number,
					},
				}),
			},
			binary: {
				[binaryData.fileName]: newBinaryData,
			},
			pairedItem: { item: itemIndex },
		};
	} catch (error) {
		throw new NodeOperationError(
			context.getNode(),
			`Image processing failed: ${(error as Error).message}`,
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

	let text = '';
	const textFields = ['chatInput', 'text', 'content', 'message', 'body', 'description'];

	if (typeof item.json === 'string') {
		text = item.json;
	} else if (typeof item.json === 'object' && item.json !== null) {
		for (const field of textFields) {
			if (typeof item.json[field] === 'string' && item.json[field].trim() !== '') {
				text = item.json[field] as string;
				break;
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
