import { DateTime } from 'luxon'
import { BaseModel, BelongsTo, HasMany, afterCreate, beforeCreate, belongsTo, column, hasMany } from '@ioc:Adonis/Lucid/Orm'
import { v4 as uuidv4 } from 'uuid'
import BatchCandidate from './BatchCandidate';
import EntranceExamSchedule from './EntranceExamSchedule';
import AcademicYear from 'App/Modules/Academic/Models/AcademicYear';

let newId = ""

export default class PPDBBatch extends BaseModel {
  public static table = 'ppdb.ppdb_batches';

  @column({ isPrimary: true })
  public id: string

  @column()
  public name: string

  @column()
  public academicYear: number

  @belongsTo(() => AcademicYear, {
    foreignKey: 'academicYear',
    localKey: 'id',
  })
  public academicYears: BelongsTo<typeof AcademicYear>

  @column()
  public description: string | null

  @column()
  public active: boolean

  @column.dateTime({ autoCreate: true })
  public createdAt: DateTime

  @column.dateTime({ autoCreate: true, autoUpdate: true })
  public updatedAt: DateTime

  @hasMany(() => BatchCandidate, {
    foreignKey: 'batchId'
  })
  public batchCandidates: HasMany<typeof BatchCandidate>

  @hasMany(() => EntranceExamSchedule, {
    foreignKey: 'batchId'
  })
  public entranceExamSchedule: HasMany<typeof EntranceExamSchedule>

  @beforeCreate()
  public static assignUuid(ppdbBatch: PPDBBatch) {
    if (!(ppdbBatch.id)) {
      newId = uuidv4()
      ppdbBatch.id = newId
    }
  }

  @afterCreate()
  public static setNewId(ppdbBatch: PPDBBatch) {
    ppdbBatch.id = newId
  }
}
