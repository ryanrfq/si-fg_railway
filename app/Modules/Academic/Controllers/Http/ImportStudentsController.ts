import type { HttpContextContract } from '@ioc:Adonis/Core/HttpContext'
import CreateImportStudentValidator from '../../Validators/CreateImportStudentValidator'
import Student from '../../Models/Student'
import StudentParent from '../../Models/StudentParent'
import CreateManyStudentValidator from '../../Validators/CreateManyStudentValidator'
const XLSX = require("xlsx");
import { validator } from '@ioc:Adonis/Core/Validator'
import CreateManyStudentParentValidator from '../../Validators/CreateManyStudentParentValidator'
const fs = require('fs');

export default class ImportStudentsController {
    public async store({ request, response }: HttpContextContract) {
        let payload = await request.validate(CreateImportStudentValidator)

        const excelBuffer = fs.readFileSync(payload.upload.tmpPath);

        await ImportService.ImportClassification(excelBuffer)

        response.ok({ message: "Success import data" })
    }
}

class ImportService {
    static async ImportClassification(excelBuffer) {
        let workbook = await XLSX.read(excelBuffer)

        // Mendapatkan daftar nama sheet dalam workbook
        const sheetNames = workbook.SheetNames;

        // membaca isi dari sheet pertama
        const firstSheet = workbook.Sheets[sheetNames[0]];
        const jsonData = XLSX.utils.sheet_to_json(firstSheet);

        const students = {
            "manyStudents": []
        }
        const studentFathers = {
            "manyStudentParents": []
        }
        const studentMothers = {
            "manyStudentParents": []
        }
        const studentGuardians = {
            "manyStudentParents": []
        }

        function checkResidence(value) {
            if (value) {
                const parent = 'Bersama orang tua'
                const dormitori = 'Asrama'
                const boarding = 'Pesantren'
                const other = 'Lainnya'
                return String(value).toLowerCase() == parent.toLowerCase() ? 'with parent'
                    : String(value).toLowerCase() == dormitori.toLowerCase() ? 'dormitory'
                        : String(value).toLowerCase() == boarding.toLowerCase() ? 'boarding school'
                            : String(value).toLowerCase() == other.toLowerCase() ? 'others'
                                : null;
            } else {
                return null
            }
        }

        function checkBoolean(value) {
            if (value) {
                const ya = 'Ya'
                return String(value).toLowerCase() == ya.toLowerCase() ? false : true
            } else {
                return false
            }
        }

        function checkProgram(value) {
            if (value) {
                const MH = 'mahad'
                const BD = 'boarding'
                const FD = 'fullday'
                const WM = 'wisma'

                return String(value.toLowerCase()) == MH ? MH
                    : String(value.toLowerCase()) == BD ? BD
                        : String(value.toLowerCase()) == FD ? FD
                            : String(value.toLowerCase()) == WM ? WM
                                : null
            } else {
                return null
            }
        }

        function checkParentEducation(value) {
            if (value) {
                const ELEMENTARY_SCHOOL = 'SD / Sederajat'
                const JUNIOR_HIGH_SCHOOL = 'SMP / Sederajat'
                const HIGH_SCHOOL = 'SMA / Sederajat'
                const S1 = 'S1'
                const S2 = 'S2'
                const D1 = 'D1'
                const D2 = 'D2'
                const D3 = 'D3'
                const D4 = 'D4'
                return String(value).toLowerCase() == ELEMENTARY_SCHOOL.toLowerCase() ? ELEMENTARY_SCHOOL
                    : String(value).toLowerCase() == JUNIOR_HIGH_SCHOOL.toLowerCase() ? JUNIOR_HIGH_SCHOOL
                        : String(value).toLowerCase() == HIGH_SCHOOL.toLowerCase() ? HIGH_SCHOOL
                            : String(value).toLowerCase() == S1.toLowerCase() ? S1
                                : String(value).toLowerCase() == S2.toLowerCase() ? S2
                                    : String(value).toLowerCase() == D1.toLowerCase() ? D1
                                        : String(value).toLowerCase() == D2.toLowerCase() ? D2
                                            : String(value).toLowerCase() == D3.toLowerCase() ? D3
                                                : String(value).toLowerCase() == D4.toLowerCase() ? D4
                                                    : null
            } else {
                return null
            }
        }

        jsonData.map((value, index) => {
            if (index > 0) {
                //@ts-ignore
                students.manyStudents.push({
                    name: value['Nama Siswa'],
                    nis: String(value['NIS']),
                    gender: value['Jenis Kelamin'] == 'L' ? 'male' : 'female',
                    nisn: String(value['NISN']),
                    birth_city: value['Tempat Lahir'],
                    birth_day: value['Tanggal Lahir'],
                    nik: String(value['NIK']),
                    religion: value['Agama'] == 'Islam' && 'islam',
                    address: value['Alamat'],
                    rt: String(value['RT']),
                    rw: String(value['RW']),
                    zip: String(value['Kode Pos']),
                    residence: checkResidence(value['Jenis Tinggal']),
                    transportation: value['Alat Transportasi'],
                    phone: value['Telepon'],
                    mobile_phone: value['HP'],
                    email: value['E-Mail'],
                    junior_hs_cert_no: value['SKHUN'],
                    has_kps: checkBoolean(value['Penerima KPS']),
                    kps_number: value['No. KPS'],
                    nat_exam_no: value['No Peserta Ujian Nasional'],
                    has_kip: checkBoolean(value['Penerima KIP']),
                    kip_number: value['Nomor KIP'],
                    name_on_kip: value['Nama di KIP'] == 1 ? true : false,
                    kks_number: value['Nomor KKS'],
                    birth_cert_no: value['No Registrasi Akta Lahir'],
                    bank_name: value['Bank'],
                    bank_account_number: value['Nomor Rekening Bank'],
                    bank_account_owner: value['Rekening Atas Nama'],
                    pip_eligible: checkBoolean(value['Layak PIP (usulan dari sekolah)']),
                    pip_desc: value['Alasan Layak PIP'],
                    special_needs: value['Kebutuhan Khusus'],
                    junior_hs_name: value['"Sekolah Asal'],
                    child_no: String(value['Anak ke-berapa']),
                    address_lat: value['Lintang'],
                    address_long: value['Bujur'],
                    family_card_no: value['No KK'],
                    weight: value['Berat Badan'],
                    height: value['Tinggi Badan'],
                    head_circumference: value['Lingkar Kepala'],
                    siblings: String(value['Jml. Saudara Kandung']),
                    distance_to_school_in_km: value['Jarak Rumah ke Sekolah (KM)'],
                    unit: value['Unit'] == 'PUTRA' ? 'putra' : value['Unit'] == 'PUTRI' ? 'putri' : null,
                    program: checkProgram(value['Program']),
                })

                //@ts-ignore
                studentFathers.manyStudentParents.push({
                    studentId: value['Nama Siswa'],
                    relationship_w_student: 'biological father',
                    name: value['Nama Ayah'] === undefined ? "-----" : value['Nama Ayah'],
                    birth_date: value['Tanggal Lahir Ayah'],
                    education: checkParentEducation(value['Jenjang Pendidikan Ayah']),
                    occupation: value['Pekerjaan Ayah'],
                    min_salary: value['Min Salary Ayah'] === undefined ? "0" : String(value['Min Salary Ayah']),
                    max_salary: value['Max Salary Ayah'] === undefined ? "0" : String(value['Max Salary Ayah']),
                    nik: value['NIK Ayah'] === undefined ? "0000000000000000" : String(value['NIK Ayah']),
                })

                //@ts-ignore
                studentMothers.manyStudentParents.push({
                    studentId: value['Nama Siswa'],
                    relationship_w_student: 'biological mother',
                    name: value['Nama Ibu'] === undefined ? "-----" : value['Nama Ibu'],
                    birth_date: value['Tanggal Lahir Ibu'],
                    education: checkParentEducation(value['Jenjang Pendidikan Ibu']),
                    occupation: value['Pekerjaan Ibu'],
                    min_salary: value['Min Salary Ibu'] === undefined ? "0" : String(value['Min Salary Ibu']),
                    max_salary: value['Max Salary Ibu'] === undefined ? "0" : String(value['Max Salary Ibu']),
                    nik: value['NIK Ibu'] === undefined ? "0000000000000000" : String(value['NIK Ayah']),
                })

                //@ts-ignore
                studentGuardians.manyStudentParents.push({
                    studentId: value['Nama Siswa'],
                    relationship_w_student: 'guardian',
                    name: value['Nama Wali'] === undefined ? "-----" : value['Nama Wali'],
                    birth_date: value['Tanggal Lahir Wali'],
                    education: checkParentEducation(value['Jenjang Pendidikan Wali']),
                    occupation: value['Pekerjaan Wali'],
                    min_salary: value['Min Salary Wali'] === undefined ? "0" : String(value['Min Salary Wali']),
                    max_salary: value['Max Salary Wali'] === undefined ? "0" : String(value['Max Salary Wali']),
                    nik: value['NIK Wali'] === undefined ? "0000000000000000" : String(value['NIK Ayah']),
                })

            }
        })


        //@ts-ignore
        const studentValidator = new CreateManyStudentValidator(null, students)
        const resultStudentValidator = await validator.validate(studentValidator)
        const dataStudents = await Student.createMany(resultStudentValidator.manyStudents)

        dataStudents.map(value => {
            studentFathers.manyStudentParents.map((sf, index) => {
                //@ts-ignore
                if (value.$attributes.name == sf.studentId) {
                    //@ts-ignore
                    studentFathers.manyStudentParents[index]['studentId'] = value.$attributes.id
                }
            })
            studentMothers.manyStudentParents.map((sf, index) => {
                //@ts-ignore
                if (value.$attributes.name == sf.studentId) {
                    //@ts-ignore
                    studentMothers.manyStudentParents[index]['studentId'] = value.$attributes.id
                }
            })
            studentGuardians.manyStudentParents.map((sf, index) => {
                //@ts-ignore
                if (value.$attributes.name == sf.studentId) {
                    //@ts-ignore
                    studentGuardians.manyStudentParents[index]['studentId'] = value.$attributes.id
                }
            })
        })

        //@ts-ignore
        const studentFathersValidator = new CreateManyStudentParentValidator(null, studentFathers)
        const resultStudentFathersValidator = await validator.validate(studentFathersValidator)
        await StudentParent.createMany(resultStudentFathersValidator.manyStudentParents)

        //@ts-ignore
        const studentMothersValidator = new CreateManyStudentParentValidator(null, studentMothers)
        const resultStudentMothersValidator = await validator.validate(studentMothersValidator)
        await StudentParent.createMany(resultStudentMothersValidator.manyStudentParents)

        //@ts-ignore
        const studentGuardiansValidator = new CreateManyStudentParentValidator(null, studentGuardians)
        const resultStudentGuardianValidator = await validator.validate(studentGuardiansValidator)
        await StudentParent.createMany(resultStudentGuardianValidator.manyStudentParents)

    }
}