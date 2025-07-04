import type { MigrationContext, ReversibleMigration } from '../migration-types';

export class SetAllTokensAndCostDataToZero1751414600000 implements ReversibleMigration {
	name = 'SetAllTokensAndCostDataToZero1751414600000';

	public async up({ queryRunner, tablePrefix }: MigrationContext): Promise<void> {
		// Reset user table
		await queryRunner.query(
			`UPDATE "${tablePrefix}user" SET "tokensConsumed" = 0, "costIncurred" = 0`,
		);

		// Reset workflow_entity table
		await queryRunner.query(
			`UPDATE "${tablePrefix}workflow_entity" SET "tokensConsumed" = 0, "costIncurred" = 0`,
		);

		// Reset usage_entity table
		await queryRunner.query(
			`UPDATE "${tablePrefix}usage_entity" SET "tokensConsumed" = 0, "costIncurred" = 0`,
		);

		// Reset execution_entity table
		await queryRunner.query(
			`UPDATE "${tablePrefix}execution_entity" SET "tokensConsumed" = 0, "costIncurred" = 0`,
		);
	}

	public async down(): Promise<void> {
		// Since we're resetting to 0, there's no way to restore the previous values
		// The down migration is a no-op
		return;
	}
}
