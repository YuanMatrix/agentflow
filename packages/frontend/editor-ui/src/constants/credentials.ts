export type CredentialType =
	| 'openAiApi'
	| 'deepSeekApi'
	| 'anthropicApi'
	| 'azureOpenAiApi'
	| 'googlePalmApi';

export const SHARED_CREDENTIAL_TYPES: readonly CredentialType[] = [
	'openAiApi',
	'deepSeekApi',
	'anthropicApi',
	'azureOpenAiApi',
	'googlePalmApi',
] as const;
