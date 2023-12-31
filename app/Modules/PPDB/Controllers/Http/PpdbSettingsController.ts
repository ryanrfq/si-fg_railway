import type { HttpContextContract } from '@ioc:Adonis/Core/HttpContext'
import PPDBSetting from '../../Models/PPDBSetting'
import CreatePpdbBatchValidator from '../../Validators/CreatePpdbBatchValidator'
import PPDBBatch from '../../Models/PPDBBatch'
import { validate as uuidValidation } from 'uuid'
import UpdatePpdbBatchValidator from '../../Validators/UpdatePpdbBatchValidator'
import UpdatePpdbSettingValidator from '../../Validators/UpdatePpdbSettingValidator'
import UpdatePpdbStatusValidator from '../../Validators/UpdatePpdbStatusValidator'
import { ModelPaginatorContract } from '@ioc:Adonis/Lucid/Orm'

export default class PpdbSettingsController {
    public async showGuide({ response }: HttpContextContract) {
        try {
            const data = await PPDBSetting.query().select('guideContent')
            response.ok({ message: "Berhasil mengambil data panduan pendaftaran", data })
        } catch (error) {
            response.internalServerError({ message: "PP_SET_SH-01: Gagal mengambil data panduan pendaftaran", error: error.message })
        }
    }

    public async updateGuide({ request, response }: HttpContextContract) {
        const payload = await request.validate(UpdatePpdbSettingValidator)

        if (JSON.stringify(payload) === '{}') {
            console.log("data update kosong");
            return response.badRequest({ message: "PP_SET_UP-01: Data tidak boleh kosong" })
        }

        try {
            const currentData = await PPDBSetting.first()
            const data = await currentData!.merge({ guideContent: payload.guide_content }).save()
            response.ok({ message: "Berhasil mengubah data panduan pendaftaran", data })
        } catch (error) {
            response.internalServerError({ message: "PP_SET_UP-02: Gagal mengubah data panduan pendaftaran", error: error.message })
        }
    }

    public async showActiveStatus({ response }: HttpContextContract) {
        try {
            const data = await PPDBSetting.query().select('active')
            response.ok({ message: "Berhasil mengambil data status aktivasi ppdb", data })
        } catch (error) {
            response.internalServerError({ message: "PP_SET_ACT_SH-01: Gagal mengambil data status aktivasi ppdb", error: error.message })
        }
    }

    public async updateActiveStatus({ request, response }: HttpContextContract) {
        const payload = await request.validate(UpdatePpdbStatusValidator)

        try {
            const currentData = await PPDBSetting.first()
            const data = await currentData!.merge(payload).save()
            response.ok({ message: "Berhasil mengubah status aktivasi ppdb", data })
        } catch (error) {
            response.internalServerError({ message: "PP_SET_ACT_UP-01: Gagal mengubah status aktivasi ppdb", error: error.message })
        }
    }

    public async indexBatches({ request, response }: HttpContextContract) {
        const { page = 1, limit = 10, keyword = "", is_active } = request.qs()

        try {
            let data: ModelPaginatorContract<PPDBBatch>
            if (is_active) {
                data = await PPDBBatch.query()
                    .whereILike('name', `%${keyword}%`)
                    .where('active', is_active)
                    .preload('academicYears')
                    .preload('entranceExamSchedule')
                    .orderBy('name')
                    .paginate(page, limit)
            } else {
                data = await PPDBBatch.query()
                    .whereILike('name', `%${keyword}%`)
                    .preload('academicYears')
                    .preload('entranceExamSchedule')
                    .orderBy('name')
                    .paginate(page, limit)
            }

            response.ok({ message: "Berhasil mengambil data semua gelombang pendaftaran", data })
        } catch (error) {
            response.badRequest({ message: "PP_SET_BAT_IN-01: Gagal mengambil data gelombang pendaftaran", error: error.message })
        }
    }

    public async createBatch({ request, response }: HttpContextContract) {
        const payload = await request.validate(CreatePpdbBatchValidator)

        try {
            const data = await PPDBBatch.create(payload)
            response.created({ message: "Berhasil menyimpan data gelombang pendaftaran", data })
        } catch (error) {
            response.badRequest({ message: "PP_SET_BAT_CR-01: Gagal menyimpan data gelombang pendaftaran", error: error.message })
        }
    }

    public async updateBatch({ params, request, response }: HttpContextContract) {
        const { id } = params
        if (!uuidValidation(id)) { return response.badRequest({ message: "ID gelombang tidak valid" }) }

        const payload = await request.validate(UpdatePpdbBatchValidator)

        if (JSON.stringify(payload) === '{}') {
            console.log("data update kosong");
            return response.badRequest({ message: "PP_SET_BAT_UP-01: Data tidak boleh kosong" })
        }

        if (payload.active === true) {
            try {
                const inactiveAcademicYear = await PPDBBatch.query().where('id', id).whereHas('academicYears', ay => ay.where('active', false))
                if (inactiveAcademicYear) throw new Error("Tidak dapat set status ke aktif, karena gelombang ini masuk tahun akademik yg tidak aktif")

                const activeBatch = await PPDBBatch.findBy('active', true)
                if (activeBatch) {
                    throw new Error("Sudah ada gelombang lain yang aktif")
                }
            } catch (error) {
                return response.badRequest({
                    message: "PP_SET_BAT_UP-02: Gagal update data gelombang pendaftaran",
                    error: error.message
                })
            }
        }

        try {
            const batch = await PPDBBatch.findOrFail(id)
            const data = await batch.merge(payload).save()
            response.ok({ message: "Berhasil update data gelombang pendaftaran", data })
        } catch (error) {
            response.badRequest({ message: "PP_SET_BAT_UP-03: Gagal update data gelombang pendaftaran", error: error.message })
        }
    }

    public async showBatch({ params, response }: HttpContextContract) {
        const { id } = params
        if (!uuidValidation(id)) { return response.badRequest({ message: "PP_SET_BAT_SH-01: ID gelombang tidak valid" }) }

        try {
            const data = await PPDBBatch
                .query()
                .where('id', id)
                .preload('academicYears')
                .preload('entranceExamSchedule')
                .firstOrFail()
            response.ok({ message: "Berhasil mengambil data gelombang pendaftaran", data })
        } catch (error) {
            response.badRequest({ message: "PP_SET_BAT_SH-02: Gagal mengambil data gelombang pendaftaran", error: error.message })
        }
    }

    public async deleteBatch({ params, response }: HttpContextContract) {
        const { id } = params
        if (!uuidValidation(id)) { return response.badRequest({ message: "PP_SET_BAT_DE-01: ID gelombang tidak valid" }) }

        try {
            const data = await PPDBBatch.find(id)

            if (data === null) throw new Error("Data gelombang dengan ID ini tidak ditemukan")
            if (data.active === true) throw new Error("Gelombang ini masih aktif, tidak dapat dihapus")

            await data.delete()
            response.ok({ message: "Berhasil menghapus data gelombang pendaftaran" })
        } catch (error) {
            response.badRequest({
                message: "PP_SET_BAT_DE-02: Gagal menghapus data gelombang pendaftaran",
                error: error.message
            })
        }
    }
}
