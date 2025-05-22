import { Container } from '@n8n/di';
import { Flags } from '@oclif/core';
import { CredentialsProvisioningService } from '@/services/credentials-provisioning.service';
import { BaseCommand } from './base-command';

export class OpenAICredentials extends BaseCommand {
	static description = '为所有用户预配置OpenAI API凭证';

	static examples = ['$ n8n openai-credentials --api-key=your-api-key'];

	static flags = {
		help: Flags.help({ char: 'h' }),
		'api-key': Flags.string({
			description: 'OpenAI API密钥',
			required: true,
		}),
	};

	async init() {
		await super.init();
	}

	async run() {
		const { flags } = await this.parse(OpenAICredentials);

		const credentialsProvisioningService = Container.get(CredentialsProvisioningService);

		try {
			await credentialsProvisioningService.provisionOpenAICredentialsForAllUsers(
				flags['api-key'] as string,
			);
			this.log('成功为所有用户预配置OpenAI API凭证');
		} catch (error) {
			this.error('预配置凭证时出错: ' + (error as Error).message);
		}
	}
}
