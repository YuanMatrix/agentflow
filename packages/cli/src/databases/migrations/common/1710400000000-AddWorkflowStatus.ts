import type { MigrationContext, ReversibleMigration } from '@/databases/types';

export class AddWorkflowStatus1710400000000 implements ReversibleMigration {
	name = 'AddWorkflowStatus1710400000000';

	public async up({ queryRunner, tablePrefix }: MigrationContext): Promise<void> {
		await queryRunner.query(
			`ALTER TABLE ${tablePrefix}workflow_entity ADD COLUMN status TEXT DEFAULT 'created' NOT NULL`,
		);
		await queryRunner.query(
			`CREATE INDEX IDX_${tablePrefix}workflow_status ON ${tablePrefix}workflow_entity(status)`,
		);
	}

	public async down({ queryRunner, tablePrefix }: MigrationContext): Promise<void> {
		await queryRunner.query(`DROP INDEX IDX_${tablePrefix}workflow_status`);
		await queryRunner.query(`ALTER TABLE ${tablePrefix}workflow_entity DROP COLUMN status`);
	}
}
