import { QueryRunner } from "typeorm";
import dataSource from "orm/orm.config";
import { UnprocessableEntityError } from "errors/errors";


export class BaseController {
  protected throwEmptyBody(body: object, message: string = "Empty update") {
    if (!Object.keys(body).length) {
      throw new UnprocessableEntityError(message);
    }
  }

  protected async transactionWrap<T>(fn: (queryRunner: QueryRunner) => Promise<T>): Promise<T> {
    const queryRunner = dataSource.createQueryRunner();
    await queryRunner.startTransaction()
    try {
      const results = await fn(queryRunner);
      await queryRunner.commitTransaction();
      return results;
    } catch (e) {
      await queryRunner.rollbackTransaction();
      // TODO: log here
      throw e;
    } finally {
      await queryRunner.release()
    }
  }
}
