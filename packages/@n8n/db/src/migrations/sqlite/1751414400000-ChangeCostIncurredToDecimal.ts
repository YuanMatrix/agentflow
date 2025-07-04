import type { MigrationContext, ReversibleMigration } from '../migration-types';

export class ChangeCostIncurredToDecimal1751414400000 implements ReversibleMigration {
	name = 'ChangeCostIncurredToDecimal1751414400000';

	public async up({ queryRunner, tablePrefix }: MigrationContext): Promise<void> {
		// 1) disable FK checks so we can drop/rename tables
		await queryRunner.query(`PRAGMA foreign_keys = OFF;`);

		// ── workflow_entity ──
		await queryRunner.query(`
      CREATE TABLE "${tablePrefix}workflow_entity_tmp" (
        "id" integer PRIMARY KEY AUTOINCREMENT NOT NULL,
        "name" varchar(128) NOT NULL,
        "active" boolean NOT NULL,
        "nodes" text NOT NULL,
        "connections" text NOT NULL,
        "createdAt" datetime NOT NULL,
        "updatedAt" datetime NOT NULL,
        "settings" text,
        "staticData" text,
        "tokensConsumed" bigint NOT NULL DEFAULT 0,
        "costIncurred" REAL NOT NULL DEFAULT 0
      );
    `);
		await queryRunner.query(`
      INSERT INTO "${tablePrefix}workflow_entity_tmp"
        (id, name, active, nodes, connections, createdAt, updatedAt, settings, staticData, tokensConsumed, costIncurred)
      SELECT
        id, name, active, nodes, connections, createdAt, updatedAt, settings, staticData, tokensConsumed, CAST(costIncurred AS REAL)
      FROM "${tablePrefix}workflow_entity";
    `);
		await queryRunner.query(`DROP TABLE "${tablePrefix}workflow_entity";`);
		await queryRunner.query(
			`ALTER TABLE "${tablePrefix}workflow_entity_tmp" RENAME TO "${tablePrefix}workflow_entity";`,
		);

		// ── execution_entity ──
		await queryRunner.query(`
      CREATE TABLE "${tablePrefix}execution_entity_tmp" (
        "id" integer PRIMARY KEY AUTOINCREMENT NOT NULL,
        "data" text NOT NULL,
        "finished" boolean NOT NULL,
        "mode" varchar NOT NULL,
        "retryOf" varchar,
        "retrySuccessId" varchar,
        "startedAt" datetime NOT NULL,
        "stoppedAt" datetime NOT NULL,
        "workflowData" text NOT NULL,
        "workflowId" varchar,
        "tokensConsumed" bigint NOT NULL DEFAULT 0,
        "costIncurred" REAL NOT NULL DEFAULT 0
      );
    `);
		await queryRunner.query(`
      INSERT INTO "${tablePrefix}execution_entity_tmp"
        (id, data, finished, mode, retryOf, retrySuccessId, startedAt, stoppedAt, workflowData, workflowId, tokensConsumed, costIncurred)
      SELECT
        id, data, finished, mode, retryOf, retrySuccessId, startedAt, stoppedAt, workflowData, workflowId, tokensConsumed, CAST(costIncurred AS REAL)
      FROM "${tablePrefix}execution_entity";
    `);
		await queryRunner.query(`DROP TABLE "${tablePrefix}execution_entity";`);
		await queryRunner.query(
			`ALTER TABLE "${tablePrefix}execution_entity_tmp" RENAME TO "${tablePrefix}execution_entity";`,
		);

		// ── user ──
		await queryRunner.query(`
      CREATE TABLE "${tablePrefix}user_tmp" (
        "id" varchar PRIMARY KEY NOT NULL,
        "email" varchar(255),
        "firstName" varchar(32),
        "lastName" varchar(32),
        "password" varchar,
        "resetPasswordToken" varchar,
        "resetPasswordTokenExpiration" integer DEFAULT NULL,
        "personalizationAnswers" text,
        "createdAt" datetime(3) NOT NULL DEFAULT (STRFTIME('%Y-%m-%d %H:%M:%f','NOW')),
        "updatedAt" datetime(3) NOT NULL DEFAULT (STRFTIME('%Y-%m-%d %H:%M:%f','NOW')),
        "globalRoleId" integer NOT NULL,
        "tokensConsumed" bigint NOT NULL DEFAULT 0,
        "costIncurred" REAL NOT NULL DEFAULT 0,
        CONSTRAINT "FK_${tablePrefix}f0609be844f9200ff4365b1bb3d"
          FOREIGN KEY ("globalRoleId")
          REFERENCES "${tablePrefix}role" ("id")
          ON DELETE NO ACTION ON UPDATE NO ACTION
      );
    `);
		await queryRunner.query(`
      INSERT INTO "${tablePrefix}user_tmp"
        (id, email, firstName, lastName, password, resetPasswordToken,
         resetPasswordTokenExpiration, personalizationAnswers,
         createdAt, updatedAt, globalRoleId, tokensConsumed, costIncurred)
      SELECT
        id, email, firstName, lastName, password, resetPasswordToken,
        resetPasswordTokenExpiration, personalizationAnswers,
        createdAt, updatedAt, globalRoleId, tokensConsumed, CAST(costIncurred AS REAL)
      FROM "${tablePrefix}user";
    `);
		await queryRunner.query(`DROP TABLE "${tablePrefix}user";`);
		await queryRunner.query(`ALTER TABLE "${tablePrefix}user_tmp" RENAME TO "${tablePrefix}user";`);

		// ── usage_entity ──
		await queryRunner.query(`
      CREATE TABLE "${tablePrefix}usage_entity_tmp" (
        "usageId" integer PRIMARY KEY AUTOINCREMENT NOT NULL,
        "workflowId" varchar(36) NOT NULL,
        "userId" varchar(36) NOT NULL,
        "executionDate" date NOT NULL,
        "tokensConsumed" bigint NOT NULL DEFAULT 0,
        "costIncurred" REAL NOT NULL DEFAULT 0
      );
    `);
		await queryRunner.query(`
      INSERT INTO "${tablePrefix}usage_entity_tmp"
        (usageId, workflowId, userId, executionDate, tokensConsumed, costIncurred)
      SELECT
        usageId, workflowId, userId, executionDate, tokensConsumed, CAST(costIncurred AS REAL)
      FROM "${tablePrefix}usage_entity";
    `);
		await queryRunner.query(`DROP TABLE "${tablePrefix}usage_entity";`);
		await queryRunner.query(
			`ALTER TABLE "${tablePrefix}usage_entity_tmp" RENAME TO "${tablePrefix}usage_entity";`,
		);

		// 5) re-enable FK enforcement
		await queryRunner.query(`PRAGMA foreign_keys = ON;`);
	}

	public async down({ queryRunner, tablePrefix }: MigrationContext): Promise<void> {
		// exactly the reverse, making costIncurred BIGINT again
		await queryRunner.query(`PRAGMA foreign_keys = OFF;`);

		// ── workflow_entity ──
		await queryRunner.query(`
      CREATE TABLE "${tablePrefix}workflow_entity_tmp" (
        "id" integer PRIMARY KEY AUTOINCREMENT NOT NULL,
        "name" varchar(128) NOT NULL,
        "active" boolean NOT NULL,
        "nodes" text NOT NULL,
        "connections" text NOT NULL,
        "createdAt" datetime NOT NULL,
        "updatedAt" datetime NOT NULL,
        "settings" text,
        "staticData" text,
        "tokensConsumed" bigint NOT NULL DEFAULT 0,
        "costIncurred" bigint NOT NULL DEFAULT 0
      );
    `);
		await queryRunner.query(`
      INSERT INTO "${tablePrefix}workflow_entity_tmp"
        (id, name, active, nodes, connections, createdAt, updatedAt, settings, staticData, tokensConsumed, costIncurred)
      SELECT
        id, name, active, nodes, connections, createdAt, updatedAt, settings, staticData, tokensConsumed, CAST(costIncurred AS INTEGER)
      FROM "${tablePrefix}workflow_entity";
    `);
		await queryRunner.query(`DROP TABLE "${tablePrefix}workflow_entity";`);
		await queryRunner.query(
			`ALTER TABLE "${tablePrefix}workflow_entity_tmp" RENAME TO "${tablePrefix}workflow_entity";`,
		);

		// ── execution_entity ──
		await queryRunner.query(`
      CREATE TABLE "${tablePrefix}execution_entity_tmp" (
        "id" integer PRIMARY KEY AUTOINCREMENT NOT NULL,
        "data" text NOT NULL,
        "finished" boolean NOT NULL,
        "mode" varchar NOT NULL,
        "retryOf" varchar,
        "retrySuccessId" varchar,
        "startedAt" datetime NOT NULL,
        "stoppedAt" datetime NOT NULL,
        "workflowData" text NOT NULL,
        "workflowId" varchar,
        "tokensConsumed" bigint NOT NULL DEFAULT 0,
        "costIncurred" bigint NOT NULL DEFAULT 0
      );
    `);
		await queryRunner.query(`
      INSERT INTO "${tablePrefix}execution_entity_tmp"
        (id, data, finished, mode, retryOf, retrySuccessId, startedAt, stoppedAt, workflowData, workflowId, tokensConsumed, costIncurred)
      SELECT
        id, data, finished, mode, retryOf, retrySuccessId, startedAt, stoppedAt, workflowData, workflowId, tokensConsumed, CAST(costIncurred AS INTEGER)
      FROM "${tablePrefix}execution_entity";
    `);
		await queryRunner.query(`DROP TABLE "${tablePrefix}execution_entity";`);
		await queryRunner.query(
			`ALTER TABLE "${tablePrefix}execution_entity_tmp" RENAME TO "${tablePrefix}execution_entity";`,
		);

		// ── user ──
		await queryRunner.query(`
      CREATE TABLE "${tablePrefix}user_tmp" (
        "id" varchar PRIMARY KEY NOT NULL,
        "email" varchar(255),
        "firstName" varchar(32),
        "lastName" varchar(32),
        "password" varchar,
        "resetPasswordToken" varchar,
        "resetPasswordTokenExpiration" integer DEFAULT NULL,
        "personalizationAnswers" text,
        "createdAt" datetime(3) NOT NULL DEFAULT (STRFTIME('%Y-%m-%d %H:%M:%f','NOW')),
        "updatedAt" datetime(3) NOT NULL DEFAULT (STRFTIME('%Y-%m-%d %H:%M:%f','NOW')),
        "globalRoleId" integer NOT NULL,
        "tokensConsumed" bigint NOT NULL DEFAULT 0,
        "costIncurred" bigint NOT NULL DEFAULT 0,
        CONSTRAINT "FK_${tablePrefix}f0609be844f9200ff4365b1bb3d"
          FOREIGN KEY ("globalRoleId")
          REFERENCES "${tablePrefix}role" ("id")
          ON DELETE NO ACTION ON UPDATE NO ACTION
      );
    `);
		await queryRunner.query(`
      INSERT INTO "${tablePrefix}user_tmp"
        (id, email, firstName, lastName, password, resetPasswordToken,
         resetPasswordTokenExpiration, personalizationAnswers,
         createdAt, updatedAt, globalRoleId, tokensConsumed, costIncurred)
      SELECT
        id, email, firstName, lastName, password, resetPasswordToken,
        resetPasswordTokenExpiration, personalizationAnswers,
        createdAt, updatedAt, globalRoleId, tokensConsumed, CAST(costIncurred AS INTEGER)
      FROM "${tablePrefix}user";
    `);
		await queryRunner.query(`DROP TABLE "${tablePrefix}user";`);
		await queryRunner.query(`ALTER TABLE "${tablePrefix}user_tmp" RENAME TO "${tablePrefix}user";`);

		// ── usage_entity ──
		await queryRunner.query(`
      CREATE TABLE "${tablePrefix}usage_entity_tmp" (
        "usageId" integer PRIMARY KEY AUTOINCREMENT NOT NULL,
        "workflowId" varchar(36) NOT NULL,
        "userId" varchar(36) NOT NULL,
        "executionDate" date NOT NULL,
        "tokensConsumed" bigint NOT NULL DEFAULT 0,
        "costIncurred" bigint NOT NULL DEFAULT 0
      );
    `);
		await queryRunner.query(`
      INSERT INTO "${tablePrefix}usage_entity_tmp"
        (usageId, workflowId, userId, executionDate, tokensConsumed, costIncurred)
      SELECT
        usageId, workflowId, userId, executionDate, tokensConsumed, CAST(costIncurred AS INTEGER)
      FROM "${tablePrefix}usage_entity";
    `);
		await queryRunner.query(`DROP TABLE "${tablePrefix}usage_entity";`);
		await queryRunner.query(
			`ALTER TABLE "${tablePrefix}usage_entity_tmp" RENAME TO "${tablePrefix}usage_entity";`,
		);

		// back to enforcing FKs
		await queryRunner.query(`PRAGMA foreign_keys = ON;`);
	}
}
