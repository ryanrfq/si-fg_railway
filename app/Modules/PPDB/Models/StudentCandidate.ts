import { DateTime } from 'luxon'
import { BaseModel, BelongsTo, HasMany, afterCreate, afterFetch, beforeCreate, belongsTo, column, hasMany } from '@ioc:Adonis/Lucid/Orm'
import { v4 as uuidv4 } from 'uuid'
import UserStudentCandidate from './UserStudentCandidate';
import { ClassMajor, StudentGender, StudentProgram, StudentReligion, StudentResidence } from 'App/Modules/Academic/lib/enums';
import { PpdbInfoSource, ScSppChoice, ScStatus } from '../lib/enums';
import Wilayah from 'App/Models/Wilayah';
import BatchCandidate from './BatchCandidate';
import EntranceExamSchedule from './EntranceExamSchedule';
import StudentCandidateParent from './StudentCandidateParent';
import PpdbInterview from './PpdbInterview';
import Drive from '@ioc:Adonis/Core/Drive'
import Env from '@ioc:Adonis/Core/Env'

let newId = ""

export default class StudentCandidate extends BaseModel {
  public static table = 'ppdb.student_candidates';

  @hasMany(() => StudentCandidateParent, {
    foreignKey: 'candidateId'
  })
  public parents: HasMany<typeof StudentCandidateParent>

  @column({ isPrimary: true })
  public id: string

  @column()
  public userId: string

  @belongsTo(() => UserStudentCandidate, {
    foreignKey: 'userId',
    localKey: 'id'
  })
  public userStudentCandidate: BelongsTo<typeof UserStudentCandidate>

  @column()
  public registrationId: string

  @column()
  public nisn: string

  @column()
  public fullName: string

  @column.date()
  public birthDay: DateTime | null

  @column()
  public juniorHsName: string | null

  @column()
  public gender: StudentGender | null

  @column()
  public religion: StudentReligion | null

  @column()
  public correspondencePhone: string | null

  @column()
  public correspondenceEmail: string | null

  @column()
  public infoSource: PpdbInfoSource | null

  @column()
  public interestInFg: string | null

  @column()
  public sppChoice: ScSppChoice | null

  @column()
  public programChoice: StudentProgram | null

  @column()
  public majorChoice: ClassMajor | null

  @column()
  public testScheduleChoice: string

  @belongsTo(() => EntranceExamSchedule, {
    foreignKey: 'testScheduleChoice',
    localKey: 'id'
  })
  public entranceExamSchedule: BelongsTo<typeof EntranceExamSchedule>

  @column()
  public photo: string | null

  // @column()
  // public examLink: string | null

  @column()
  public virtualAccountNo: string | null

  @column()
  public programFinal: StudentProgram | null

  @column()
  public majorFinal: ClassMajor | null

  @column()
  public sppFinal: ScSppChoice | null

  @column()
  public status: ScStatus | null

  // @column()
  // public dataStatus: ScStatusData | null

  // @column()
  // public paymentStatus: ScStatusPayment | null

  @column()
  public nik: string | null

  @column()
  public birthCity: string | null

  @column()
  public address: string | null

  @column()
  public desa: string | null

  @column()
  public rt: string | null

  @column()
  public rw: string | null

  @belongsTo(() => Wilayah, {
    localKey: 'kode',
    foreignKey: 'kel'
  })
  kelurahan: BelongsTo<typeof Wilayah>

  @column()
  public kel: string | null

  @belongsTo(() => Wilayah, {
    localKey: 'kode',
    foreignKey: 'kec'
  })
  kecamatan: BelongsTo<typeof Wilayah>

  @column()
  public kec: string | null

  @belongsTo(() => Wilayah, {
    localKey: 'kode',
    foreignKey: 'kot'
  })
  kota: BelongsTo<typeof Wilayah>

  @column()
  public kot: string | null

  @belongsTo(() => Wilayah, {
    localKey: 'kode',
    foreignKey: 'prov'
  })
  provinsi: BelongsTo<typeof Wilayah>

  @column()
  public prov: string | null

  @column()
  public zip: string | null

  @column()
  public phone: string | null

  @column()
  public mobilePhone: string | null

  @column()
  public residence: StudentResidence | null

  @column()
  public transportation: string | null

  @column()
  public hasKps: boolean | null

  @column()
  public kpsNumber: string | null

  @column()
  public juniorHsCertNo: string | null

  @column()
  public natExamNo: string | null

  @column()
  public hasKip: boolean | null

  @column()
  public kipNumber: string | null

  @column()
  public nameOnKip: boolean | null

  @column()
  public hasKks: boolean | null

  @column()
  public kksNumber: string | null

  @column()
  public birthCertNo: string | null

  @column()
  public pipEligible: boolean | null

  @column()
  public pipDesc: string | null

  @column()
  public specialNeeds: string | null

  @column()
  public childNo: string | null

  @column()
  public addressLat: number | null

  @column()
  public addressLong: number | null

  @column()
  public familyCardNo: string | null

  @column()
  public weight: number | null

  @column()
  public height: number | null

  @column()
  public headCircumference: number | null

  @column()
  public siblings: string | null

  @column()
  public distanceToSchoolInKm: number | null

  @column()
  public bankName: string | null

  @column()
  public bankAccountOwner: string | null

  @column()
  public bankAccountNumber: string | null

  @column()
  public jhsCertificateScan: string | null

  @column()
  public familyCardScan: string | null

  @column()
  public birthCertScan: string | null

  @column()
  public jhsGraduationLetterScan: string | null

  @column()
  public scanPaymentProof: string | null

  @column.dateTime({ autoCreate: true })
  public createdAt: DateTime

  @column.dateTime({ autoCreate: true, autoUpdate: true })
  public updatedAt: DateTime

  @hasMany(() => BatchCandidate, {
    foreignKey: 'candidateId'
  })
  public batchCandidate: HasMany<typeof BatchCandidate>

  @hasMany(() => PpdbInterview, {
    foreignKey: 'candidateId'
  })
  public interviews: HasMany<typeof PpdbInterview>

  @beforeCreate()
  public static assignUuid(studentCandidate: StudentCandidate) {
    newId = uuidv4()
    studentCandidate.id = newId
  }

  @afterCreate()
  public static setNewId(studentCandidate: StudentCandidate) {
    studentCandidate.id = newId
  }

  @afterFetch()
  public static async getUrlAll(candidate: StudentCandidate[]) {
    const drivePpdb = Drive.use('ppdb')
    const BE_URL = Env.get('BE_URL')
    const subUrl = 'student-candidates/'

    candidate.map(async (sc) => {
      if (sc.jhsGraduationLetterScan !== null) {
        const url = await drivePpdb.getUrl('/' + subUrl + sc.jhsGraduationLetterScan)
        sc.jhsGraduationLetterScan = BE_URL + url
      }

      if (sc.photo !== null) {
        const url = await drivePpdb.getUrl('/' + subUrl + sc.photo)
        sc.photo = BE_URL + url
      }

      if (sc.jhsCertificateScan !== null) {
        const url = await drivePpdb.getUrl('/' + subUrl + sc.jhsCertificateScan)
        sc.jhsCertificateScan = BE_URL + url
      }

      if (sc.familyCardScan !== null) {
        const url = await drivePpdb.getUrl('/' + subUrl + sc.familyCardScan)
        sc.familyCardScan = BE_URL + url
      }

      if (sc.birthCertScan !== null) {
        const url = await drivePpdb.getUrl('/' + subUrl + sc.birthCertScan)
        sc.birthCertScan = BE_URL + url
      }

      if (sc.scanPaymentProof !== null) {
        const url = await drivePpdb.getUrl('/' + subUrl + sc.scanPaymentProof)
        sc.scanPaymentProof = BE_URL + url
      }

      return sc
    })
  }
}
