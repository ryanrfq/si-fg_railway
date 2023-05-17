import BaseSchema from '@ioc:Adonis/Lucid/Schema'
import { StudentReligion } from '../../lib/enums'

export default class extends BaseSchema {
  protected tableName = 'academic.students'

  public async up() {
    this.schema.table(this.tableName, (table) => {
      table.dropColumn('religion')
    })

    this.schema.alterTable(this.tableName, (table) => {
      table.string('nik', 16).notNullable().alter()
      table.text('address').alter()
      table.string('rt', 3).alter()
      table.string('rw', 3).alter()
      table.string('kel', 13).alter()
      table.string('kec', 8).alter()
      table.string('kot', 5).alter()
      table.string('prov', 2).alter()
      table.string('zip', 5).alter()

      table.enum('religion', Object.values(StudentReligion))
    })
  }

  public async down() {
    this.schema.table(this.tableName, (table) => {
      table.dropColumn('religion')
    })

    this.schema.alterTable(this.tableName, (table) => {
      table.string('nik').notNullable().alter()
      table.string('address').alter()
      table.string('rt').alter()
      table.string('rw').alter()
      table.string('desa').alter()
      table.string('kel').alter()
      table.string('kec').alter()
      table.string('kot').alter()
      table.string('prov').alter()
      table.string('zip').alter()
      table.string('religion')
    })
  }
}
