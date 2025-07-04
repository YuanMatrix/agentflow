import type { MigrationContext, ReversibleMigration } from '../migration-types';

export class SetAllTokensAndCostDataToZero1751414600000 implements ReversibleMigration {
	name = 'SetAllTokensAndCostDataToZero1751414600000';

	public async up({ queryRunner, tablePrefix }: MigrationContext): Promise<void> {
		// Drop and recreate usage_entity table
		await queryRunner.query(`DROP TABLE IF EXISTS "${tablePrefix}usage_entity" CASCADE`);

		await queryRunner.query(
			`CREATE TABLE "${tablePrefix}usage_entity" (` +
				'"usageId" SERIAL NOT NULL, ' +
				'"workflowId" varchar(36) NOT NULL, ' +
				'"userId" varchar(36) NOT NULL, ' +
				'"executionDate" date NOT NULL, ' +
				'"tokensConsumed" bigint NOT NULL DEFAULT 0, ' +
				'"costIncurred" DECIMAL(20,10) NOT NULL DEFAULT 0, ' +
				`CONSTRAINT "PK_${tablePrefix}usage_entity" PRIMARY KEY ("usageId")` +
				')',
		);

		await queryRunner.query(
			`CREATE INDEX "IDX_${tablePrefix}usage_entity_userId_executionDate" ON "${tablePrefix}usage_entity" ("userId", "executionDate")`,
		);

		await queryRunner.query(
			`CREATE UNIQUE INDEX "IDX_${tablePrefix}usage_entity_workflowId_userId_executionDate" ON "${tablePrefix}usage_entity" ("workflowId", "userId", "executionDate")`,
		);

		// Reset user table
		await queryRunner.query(
			`UPDATE "${tablePrefix}user" SET "tokensConsumed" = 0, "costIncurred" = 0.0000000000`,
		);

		// Reset workflow_entity table
		await queryRunner.query(
			`UPDATE "${tablePrefix}workflow_entity" SET "tokensConsumed" = 0, "costIncurred" = 0.0000000000`,
		);

		// Reset execution_entity table
		await queryRunner.query(
			`UPDATE "${tablePrefix}execution_entity" SET "tokensConsumed" = 0, "costIncurred" = 0.0000000000`,
		);
	}

	public async down(): Promise<void> {
		// Since we're resetting to 0 and recreating the table, there's no way to restore the previous values
		// The down migration is a no-op
		return;
	}
}
