import { Service } from '@n8n/di';
import { CredentialsService } from '@/credentials/credentials.service';
import { UserRepository } from '@/databases/repositories/user.repository';
import { ProjectService } from '@/services/project.service.ee';
import type { User } from '@/databases/entities/user';

@Service()
export class CredentialsProvisioningService {
	constructor(
		private readonly credentialsService: CredentialsService,
		private readonly userRepository: UserRepository,
		private readonly projectService: ProjectService,
	) {}

	async provisionOpenAICredentialsForAllUsers(apiKey: string) {
		// 获取所有用户
		const users = await this.userRepository.find();

		// 为每个用户创建凭证
		for (const user of users) {
			await this.provisionOpenAICredentialsForUser(user, apiKey);
		}
	}

	async provisionOpenAICredentialsForUser(user: User, apiKey: string) {
		// 获取用户的个人项目
		const personalProject = await this.projectService.getPersonalProject(user);
		if (!personalProject) {
			return;
		}

		// 创建凭证数据
		const credentialData = {
			name: 'OpenAI API',
			type: 'openAiApi',
			data: {
				apiKey,
			},
			projectId: personalProject.id,
		};

		// 创建托管凭证
		await this.credentialsService.createManagedCredential(credentialData, user);
	}
}
