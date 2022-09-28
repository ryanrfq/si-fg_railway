import type { HttpContextContract } from '@ioc:Adonis/Core/HttpContext'
import AssetStatus from 'Inventory/Models/AssetStatus'

export default class AssetStatusesController {
  public async index({ request, response }: HttpContextContract) {
    const { page = 1, limit = 10, keyword = "", mode = "page" } = request.qs()

    try {
      let data = {}
      if (mode === "page") {
        data = await AssetStatus
          .query()
          .whereILike('id', `%${keyword}%`)
          .orderBy('id')
          .paginate(page, limit)
      } else if (mode === "list") {
        data = await AssetStatus
          .query()
          .whereILike('id', `%${keyword}%`)
          .orderBy('id')
      } else {
        return response.badRequest({ message: "Mode tidak dikenali, (pilih: page / list)" })
      }

      response.ok({ message: "Berhasil mengambil data", data })
    } catch (error) {
      response.badRequest({ message: "Gagal mengambil data", error: error.message })
    }
  }

  public async create({ }: HttpContextContract) { }

  public async store({ }: HttpContextContract) { }

  public async show({ }: HttpContextContract) { }

  public async edit({ }: HttpContextContract) { }

  public async update({ }: HttpContextContract) { }

  public async destroy({ }: HttpContextContract) { }
}
