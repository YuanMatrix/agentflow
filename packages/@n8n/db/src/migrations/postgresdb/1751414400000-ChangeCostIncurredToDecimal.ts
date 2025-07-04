import type { MigrationContext, ReversibleMigration } from '../migration-types';

export class ChangeCostIncurredToDecimal1751414400000 implements ReversibleMigration {
	name = 'ChangeCostIncurredToDecimal1751414400000';

	public async up({ queryRunner, tablePrefix }: MigrationContext): Promise<void> {
		// Check if the costIncurred column exists in each table before modifying
		const userTable = await queryRunner.getTable(`${tablePrefix}user`);
		const costIncurredColumnExistsInUserTable = userTable?.findColumnByName('costIncurred');

		const executionEntityTable = await queryRunner.getTable(`${tablePrefix}execution_entity`);
		const costIncurredColumnExistsInExecutionEntityTable =
			executionEntityTable?.findColumnByName('costIncurred');

		const workflowEntityTable = await queryRunner.getTable(`${tablePrefix}workflow_entity`);
		const costIncurredColumnExistsInWorkflowEntityTable =
			workflowEntityTable?.findColumnByName('costIncurred');

		// Also check the new usage_entity table
		const usageEntityTable = await queryRunner.getTable(`${tablePrefix}usage_entity`);
		const costIncurredColumnExistsInUsageEntityTable =
			usageEntityTable?.findColumnByName('costIncurred');

		if (costIncurredColumnExistsInUserTable) {
			// First set all values to 0
			await queryRunner.query(`UPDATE "${tablePrefix}user" SET "costIncurred" = 0`);
			await queryRunner.query(
				`ALTER TABLE "${tablePrefix}user" ALTER COLUMN "costIncurred" TYPE DECIMAL(20,10) USING "costIncurred"::DECIMAL(20,10)`,
			);
			await queryRunner.query(
				`ALTER TABLE "${tablePrefix}user" ALTER COLUMN "costIncurred" SET DEFAULT 0`,
			);
		}

		if (costIncurredColumnExistsInExecutionEntityTable) {
			// First set all values to 0
			await queryRunner.query(`UPDATE "${tablePrefix}execution_entity" SET "costIncurred" = 0`);
			await queryRunner.query(
				`ALTER TABLE "${tablePrefix}execution_entity" ALTER COLUMN "costIncurred" TYPE DECIMAL(20,10) USING "costIncurred"::DECIMAL(20,10)`,
			);
			await queryRunner.query(
				`ALTER TABLE "${tablePrefix}execution_entity" ALTER COLUMN "costIncurred" SET DEFAULT 0`,
			);
		}

		if (costIncurredColumnExistsInWorkflowEntityTable) {
			// First set all values to 0
			await queryRunner.query(`UPDATE "${tablePrefix}workflow_entity" SET "costIncurred" = 0`);
			await queryRunner.query(
				`ALTER TABLE "${tablePrefix}workflow_entity" ALTER COLUMN "costIncurred" TYPE DECIMAL(20,10) USING "costIncurred"::DECIMAL(20,10)`,
			);
			await queryRunner.query(
				`ALTER TABLE "${tablePrefix}workflow_entity" ALTER COLUMN "costIncurred" SET DEFAULT 0`,
			);
		}

		if (costIncurredColumnExistsInUsageEntityTable) {
			// First set all values to 0
			await queryRunner.query(`UPDATE "${tablePrefix}usage_entity" SET "costIncurred" = 0`);
			await queryRunner.query(
				`ALTER TABLE "${tablePrefix}usage_entity" ALTER COLUMN "costIncurred" TYPE DECIMAL(20,10) USING "costIncurred"::DECIMAL(20,10)`,
			);
			await queryRunner.query(
				`ALTER TABLE "${tablePrefix}usage_entity" ALTER COLUMN "costIncurred" SET DEFAULT 0`,
			);
		}
	}

	public async down({ queryRunner, tablePrefix }: MigrationContext): Promise<void> {
		// Revert back to BIGINT
		const userTable = await queryRunner.getTable(`${tablePrefix}user`);
		const costIncurredColumnExistsInUserTable = userTable?.findColumnByName('costIncurred');

		const executionEntityTable = await queryRunner.getTable(`${tablePrefix}execution_entity`);
		const costIncurredColumnExistsInExecutionEntityTable =
			executionEntityTable?.findColumnByName('costIncurred');

		const workflowEntityTable = await queryRunner.getTable(`${tablePrefix}workflow_entity`);
		const costIncurredColumnExistsInWorkflowEntityTable =
			workflowEntityTable?.findColumnByName('costIncurred');

		const usageEntityTable = await queryRunner.getTable(`${tablePrefix}usage_entity`);
		const costIncurredColumnExistsInUsageEntityTable =
			usageEntityTable?.findColumnByName('costIncurred');

		if (costIncurredColumnExistsInUserTable) {
			await queryRunner.query(
				`ALTER TABLE "${tablePrefix}user" ALTER COLUMN "costIncurred" TYPE BIGINT USING "costIncurred"::BIGINT`,
			);
			await queryRunner.query(
				`ALTER TABLE "${tablePrefix}user" ALTER COLUMN "costIncurred" SET DEFAULT 0`,
			);
		}

		if (costIncurredColumnExistsInExecutionEntityTable) {
			await queryRunner.query(
				`ALTER TABLE "${tablePrefix}execution_entity" ALTER COLUMN "costIncurred" TYPE BIGINT USING "costIncurred"::BIGINT`,
			);
			await queryRunner.query(
				`ALTER TABLE "${tablePrefix}execution_entity" ALTER COLUMN "costIncurred" SET DEFAULT 0`,
			);
		}

		if (costIncurredColumnExistsInWorkflowEntityTable) {
			await queryRunner.query(
				`ALTER TABLE "${tablePrefix}workflow_entity" ALTER COLUMN "costIncurred" TYPE BIGINT USING "costIncurred"::BIGINT`,
			);
			await queryRunner.query(
				`ALTER TABLE "${tablePrefix}workflow_entity" ALTER COLUMN "costIncurred" SET DEFAULT 0`,
			);
		}

		if (costIncurredColumnExistsInUsageEntityTable) {
			await queryRunner.query(
				`ALTER TABLE "${tablePrefix}usage_entity" ALTER COLUMN "costIncurred" TYPE BIGINT USING "costIncurred"::BIGINT`,
			);
			await queryRunner.query(
				`ALTER TABLE "${tablePrefix}usage_entity" ALTER COLUMN "costIncurred" SET DEFAULT 0`,
			);
		}
	}
}
