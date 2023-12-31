import BaseSchema from '@ioc:Adonis/Lucid/Schema'

export default class extends BaseSchema {
  protected schemaName = 'ppdb'

  public async up() {
    this.schema.createSchema(this.schemaName)
  }

  public async down() {
    this.schema.dropSchemaIfExists(this.schemaName)
  }
}
