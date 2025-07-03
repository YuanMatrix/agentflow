import type { MigrationContext, ReversibleMigration } from '../migration-types';

export class CreateUsageEntity1751328000000 implements ReversibleMigration {
	name = 'CreateUsageEntity1751328000000';

	public async up({ queryRunner, tablePrefix }: MigrationContext): Promise<void> {
		await queryRunner.query(
			`CREATE TABLE ${tablePrefix}usage_entity (` +
				'usageId SERIAL NOT NULL, ' +
				'workflowId varchar(36) NOT NULL, ' +
				'userId varchar(36) NOT NULL, ' +
				'executionDate date NOT NULL, ' +
				'tokensConsumed bigint NOT NULL DEFAULT 0, ' +
				'costIncurred bigint NOT NULL DEFAULT 0, ' +
				`CONSTRAINT PK_${tablePrefix}usage_entity PRIMARY KEY (usageId)` +
				')',
		);

		await queryRunner.query(
			`CREATE INDEX IDX_${tablePrefix}usage_entity_userId_executionDate ON ${tablePrefix}usage_entity (userId, executionDate)`,
		);

		await queryRunner.query(
			`CREATE UNIQUE INDEX IDX_${tablePrefix}usage_entity_workflowId_userId_executionDate ON ${tablePrefix}usage_entity (workflowId, userId, executionDate)`,
		);
	}

	public async down({ queryRunner, tablePrefix }: MigrationContext): Promise<void> {
		await queryRunner.query(`DROP TABLE ${tablePrefix}usage_entity`);
	}
}
