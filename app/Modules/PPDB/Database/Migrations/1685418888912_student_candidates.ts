import BaseSchema from '@ioc:Adonis/Lucid/Schema'
import { ClassMajor, StudentGender, StudentProgram, StudentReligion, StudentResidence } from 'App/Modules/Academic/lib/enums'
import { PpdbInfoSource, ScSppChoice, ScStatus } from '../../lib/enums'

export default class extends BaseSchema {
  protected tableName = 'student_candidates'

  public async up() {
    this.schema
      .withSchema('ppdb')
      .createTable(this.tableName, (table) => {
        table.uuid('id').primary().notNullable().unique()
        table.uuid('user_id').references('id').inTable('ppdb.user_student_candidates').onDelete('SET NULL').onUpdate('cascade').unique()
        table.string('registration_id').notNullable().unique()
        // todo: make unique after dev done
        table.string('nisn', 15)//.unique()
        table.string('full_name')
        table.date('birth_day')
        table.string('junior_hs_name')
        table.enum('gender', Object.values(StudentGender))
        table.enum('religion', Object.values(StudentReligion))
        table.string('correspondence_phone')
        table.string('correspondence_email')
        table.enum('info_source', Object.values(PpdbInfoSource))
        table.text('interest_in_fg')
        table.string('photo')
        table.enum('spp_choice', Object.values(ScSppChoice))
        table.enum('program_choice', Object.values(StudentProgram))
        table.enum('major_choice', Object.values(ClassMajor))
        table.uuid('test_schedule_choice').references('id').inTable('ppdb.entrance_exam_schedules').onDelete('no action').onUpdate('cascade')
        table.increments('virtual_account_no', { primaryKey: false })
        table.enum('program_final', Object.values(StudentProgram))
        table.enum('major_final', Object.values(ClassMajor))
        table.enum('spp_final', Object.values(ScSppChoice))
        table.enum('status', Object.values(ScStatus)).defaultTo(ScStatus.NEW)
        table.string('nik', 16)
        table.string('birth_city')
        table.text('address')
        table.string('desa')
        table.string('rt', 3)
        table.string('rw', 3)
        table.string('kel', 13).references('kode').inTable('public.wilayah').onDelete('no action').onUpdate('cascade')
        table.string('kec', 8).references('kode').inTable('public.wilayah').onDelete('no action').onUpdate('cascade')
        table.string('kot', 5).references('kode').inTable('public.wilayah').onDelete('no action').onUpdate('cascade')
        table.string('prov', 2).references('kode').inTable('public.wilayah').onDelete('no action').onUpdate('cascade')
        table.string('zip', 5)
        table.string('phone')
        table.string('mobile_phone')
        table.enum('residence', Object.values(StudentResidence))
        table.string('transportation', 40)
        table.boolean('has_kps')
        table.string('kps_number')
        table.string('junior_hs_cert_no')
        table.string('nat_exam_no', 30)
        table.boolean('has_kip')
        table.string('kip_number')
        table.boolean('name_on_kip')
        table.boolean('has_kks')
        table.string('kks_number')
        table.string('birth_cert_no')
        table.boolean('pip_eligible')
        table.string('pip_desc')
        table.string('special_needs')
        table.string('child_no')
        table.decimal('address_lat')
        table.decimal('address_long')
        table.string('family_card_no')
        table.decimal('weight')
        table.decimal('height')
        table.decimal('head_circumference')
        table.string('siblings', 2)
        table.integer('distance_to_school_in_km')
        table.string('bank_name', 30)
        table.string('bank_account_owner', 50)
        table.string('bank_account_number', 30)
        table.string('jhs_certificate_scan')
        table.string('jhs_graduation_letter_scan')
        table.string('family_card_scan')
        table.string('birth_cert_scan')
        table.string('scan_payment_proof')

        /**
         * Uses timestamptz for PostgreSQL and DATETIME2 for MSSQL
         */
        table.timestamp('created_at', { useTz: true })
        table.timestamp('updated_at', { useTz: true })
      })
  }

  public async down() {
    this.schema
      .withSchema('ppdb')
      .dropTable(this.tableName)
  }
}
