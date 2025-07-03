import { Service } from '@n8n/di';
import { DataSource, Repository } from '@n8n/typeorm';

import { UsageEntity } from '../entities';

@Service()
export class UsageRepository extends Repository<UsageEntity> {
	constructor(dataSource: DataSource) {
		super(UsageEntity, dataSource.manager);
	}

	// return all usage records for a user
	async findByUserId(userId: string) {
		return await this.find({
			where: {
				userId,
			},
		});
	}

	// find usage records by workflowId
	async findByWorkflowId(workflowId: string) {
		return await this.find({
			where: {
				workflowId,
			},
		});
	}

	// add a record
	// use transaction to ensure atomicity and thread safety
	async addTransactionRecord(usage: UsageEntity) {
		return await this.manager.transaction(async (transactionManager) => {
			// if there exists a record with the same workflowId &
			// same userId and executionDate,
			// then we add the tokens consumed and cost incurred to that entry
			const existingRecord = await transactionManager.findOne(UsageEntity, {
				where: {
					workflowId: usage.workflowId,
					userId: usage.userId,
					executionDate: usage.executionDate,
				},
			});

			if (existingRecord) {
				existingRecord.tokensConsumed += usage.tokensConsumed;
				existingRecord.costIncurred += usage.costIncurred;
				return await transactionManager.save(existingRecord);
			}
			// if not exists, then we create a new entry
			return await transactionManager.save(usage);
		});
	}

	// delete usage records by workflowId
	async deleteByWorkflowId(workflowId: string) {
		return await this.delete({
			workflowId,
		});
	}

	// delete usage records by userId
	async deleteByUserId(userId: string) {
		return await this.delete({
			userId,
		});
	}

	// delete usage records before a date (not including the date)
	async deleteBeforeDate(beforeDate: Date) {
		return await this.createQueryBuilder()
			.delete()
			.from(UsageEntity)
			.where('executionDate < :beforeDate', { beforeDate })
			.execute();
	}
}
