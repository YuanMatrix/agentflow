import { Service } from '@n8n/di';
import { CredentialsRepository } from '@/databases/repositories/credentials.repository';
import { SharedCredentialsRepository } from '@/databases/repositories/shared-credentials.repository';
import { ProjectRepository } from '@/databases/repositories/project.repository';
import { UserRepository } from '@/databases/repositories/user.repository';
import type { User } from '@/databases/entities/user';
import { SHARED_CREDENTIAL_TYPES, type CredentialType } from '../constants/credentials';

@Service()
export class CredentialsSharingService {
	constructor(
		private readonly credentialsRepository: CredentialsRepository,
		private readonly sharedCredentialsRepository: SharedCredentialsRepository,
		private readonly projectRepository: ProjectRepository,
		private readonly userRepository: UserRepository,
	) {}

	async shareOwnerAiCredentialsWithMember(
		member: User,
		credentialTypes: CredentialType[] = [...SHARED_CREDENTIAL_TYPES],
	) {
		// 获取owner用户
		const owner = await this.userRepository.findOne({
			where: { role: 'global:owner' },
		});

		if (!owner) {
			return;
		}

		// 获取owner的个人项目
		const ownerPersonalProject = await this.projectRepository.getPersonalProjectForUserOrFail(
			owner.id,
		);

		// 获取owner的AI凭证
		const ownerAiCredentials = await this.credentialsRepository
			.createQueryBuilder('credentials')
			.leftJoinAndSelect('credentials.shared', 'shared')
			.where('shared.projectId = :projectId', { projectId: ownerPersonalProject.id })
			.andWhere('shared.role = :role', { role: 'credential:owner' })
			.andWhere('credentials.type IN (:...types)', { types: credentialTypes })
			.getMany();

		if (!ownerAiCredentials.length) {
			return;
		}

		// 获取member的个人项目
		const memberPersonalProject = await this.projectRepository.getPersonalProjectForUserOrFail(
			member.id,
		);

		// 为每个凭证创建共享
		for (const credential of ownerAiCredentials) {
			// 检查是否已经共享给该member
			const existingSharing = await this.sharedCredentialsRepository.findOne({
				where: {
					credentialsId: credential.id,
					projectId: memberPersonalProject.id,
				},
			});

			if (!existingSharing) {
				// 创建新的共享
				await this.sharedCredentialsRepository.save({
					credentialsId: credential.id,
					projectId: memberPersonalProject.id,
					role: 'credential:user',
				});
			}
		}
	}
}
