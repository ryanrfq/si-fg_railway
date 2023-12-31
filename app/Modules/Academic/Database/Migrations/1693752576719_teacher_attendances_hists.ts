import BaseSchema from '@ioc:Adonis/Lucid/Schema'

export default class extends BaseSchema {
  protected tableName = 'teacher_attendances_hists'

  public async up () {
    this.schema.withSchema('academic').
    createTable(this.tableName, (table) => {
      table.uuid('id').primary().notNullable().unique().defaultTo(this.raw("gen_random_uuid()"))
      table.uuid('teacher_attendance_id')
      // table.uuid('teacher_attendance_id').references('id').inTable('academic.teacher_attendances').onDelete('no action')
      table.dateTime('date_in', { useTz: false }).notNullable()
      table.dateTime('date_out', { useTz: false }).notNullable()
      table.enum('status', ['teach', 'not_teach', 'exam', 'homework']).notNullable()
      table.string('action_type').notNullable()
      table.string('material')
      table.string('reason_not_teach')
      table.boolean('post_test').defaultTo(false)
      table.uuid('session_id')
      table.uuid('teacher_id')
      table.uuid('class_id')
      table.uuid('subject_id')
      table.uuid('program_semester_detail_id')
      this.schema.raw(`
      ------ FUNCTIONS ------
      CREATE OR REPLACE FUNCTION log_teacher_attendance_insert() RETURNS TRIGGER AS $$
      BEGIN
          INSERT INTO academic.teacher_attendances_hists (teacher_attendance_id, date_in, action_type,  date_out, status, material, reason_not_teach, post_test, session_id, teacher_id, class_id, subject_id, program_semester_detail_id)
          VALUES (new.id, NEW.date_in, 'INSERT', NEW.date_out, NEW.status, NEW.material, NEW.reason_not_teach, NEW.post_test, NEW.session_id, NEW.teacher_id, NEW.class_id, NEW.subject_id, NEW.program_semester_detail_id);
          RETURN NEW;
      END;
      $$ LANGUAGE plpgsql;

      ------ TRIGGERS ------
      CREATE TRIGGER teacher_attendance_hist_insert AFTER INSERT ON academic.teacher_attendances
      FOR EACH ROW EXECUTE FUNCTION log_teacher_attendance_insert();

      ------ FUNCTIONS ------
      CREATE OR REPLACE FUNCTION log_teacher_attendance_update() RETURNS TRIGGER AS $$
      BEGIN
          INSERT INTO academic.teacher_attendances_hists (teacher_attendance_id, date_in, action_type, date_out, status, material, reason_not_teach, post_test, session_id, teacher_id, class_id, subject_id, program_semester_detail_id)
          VALUES (new.id, NEW.date_in, 'UPDATE', NEW.date_out, NEW.status, NEW.material, NEW.reason_not_teach, NEW.post_test, NEW.session_id, NEW.teacher_id, NEW.class_id, NEW.subject_id, NEW.program_semester_detail_id);
          RETURN NEW;
      END;
      $$ LANGUAGE plpgsql;

      ------ TRIGGERS ------
      CREATE TRIGGER teacher_attendance_hist_update AFTER UPDATE ON academic.teacher_attendances
      FOR EACH ROW EXECUTE FUNCTION log_teacher_attendance_update();

      ------ FUNCTIONS ------
      CREATE OR REPLACE FUNCTION log_teacher_attendance_delete() RETURNS TRIGGER AS $$
      DECLARE
          old_data academic.teacher_attendances;
      BEGIN
          old_data := OLD;
          INSERT INTO academic.teacher_attendances_hists (teacher_attendance_id, date_in, action_type, date_out, status, material, reason_not_teach, post_test, session_id, teacher_id, class_id, subject_id, program_semester_detail_id)
          VALUES (OLD.id, OLD.date_in, 'DELETE', OLD.date_out, OLD.status, OLD.material, OLD.reason_not_teach, OLD.post_test, OLD.session_id, OLD.teacher_id, OLD.class_id, OLD.subject_id, OLD.program_semester_detail_id);
          RETURN OLD;
      END;
      $$ LANGUAGE plpgsql;

      ------ TRIGGERS ------
      CREATE TRIGGER teacher_attendance_hist_delete BEFORE DELETE ON academic.teacher_attendances
      FOR EACH ROW EXECUTE FUNCTION log_teacher_attendance_delete();
    `)


      /**
       * Uses timestamptz for PostgreSQL and DATETIME2 for MSSQL
       */
      table.timestamp('created_at', { useTz: true }).defaultTo(this.raw("now()"))
    
    })
  }

  public async down () {
    this.schema.withSchema('academic').dropTable(this.tableName)
    this.schema.raw("DROP TRIGGER IF EXISTS teacher_attendance_hist_insert ON academic.teacher_attendances;")
    this.schema.raw("DROP FUNCTION IF EXISTS log_teacher_attendance_insert() CASCADE;")
    this.schema.raw("DROP TRIGGER IF EXISTS teacher_attendance_hist_update ON academic.teacher_attendances;")
    this.schema.raw("DROP FUNCTION IF EXISTS log_teacher_attendance_update() CASCADE;")
    this.schema.raw("DROP TRIGGER IF EXISTS teacher_attendance_hist_delete ON academic.teacher_attendances;")
    this.schema.raw("DROP FUNCTION IF EXISTS log_teacher_attendance_delete() CASCADE;")
  }
}
