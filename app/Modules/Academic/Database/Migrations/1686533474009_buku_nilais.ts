import BaseSchema from '@ioc:Adonis/Lucid/Schema'

export default class extends BaseSchema {
  protected tableName = 'buku_nilais'

  public async up () {
    this.schema
    .withSchema('academic').createTable(this.tableName, (table) => {
      table.uuid('id').unique().notNullable().primary()
      table.uuid('program_semester_detail_id').references('id').inTable('academic.program_semester_details').onDelete('set null').onUpdate('cascade')
      table.uuid('student_id').references('id').inTable('academic.students').onDelete('set null').onUpdate('cascade')
      table.uuid('teacher_id').references('id').inTable('academic.teachers').onDelete('set null').onUpdate('cascade')
      table.uuid('subject_id').references('id').inTable('academic.subjects').onDelete('set null').onUpdate('cascade')
      table.uuid('class_id').references('id').inTable('academic.classes').onDelete('set null').onUpdate('cascade')
      table.integer('nilai')
      table.enum('type', ['HARIAN', 'UTS', 'UAS'])

      /**
       * Uses timestamptz for PostgreSQL and DATETIME2 for MSSQL
       */
      table.timestamp('created_at', { useTz: true })
      table.timestamp('updated_at', { useTz: true })
    })
  }

  public async down () {
    this.schema.withSchema('academic').dropTable(this.tableName)
  }
}