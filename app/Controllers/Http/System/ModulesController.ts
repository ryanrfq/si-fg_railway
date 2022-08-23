import type { HttpContextContract } from '@ioc:Adonis/Core/HttpContext'
import Module from 'App/Models/Module'
import { schema, rules } from '@ioc:Adonis/Core/Validator'
import Database from '@ioc:Adonis/Lucid/Database'

export default class ModulesController {
  public async index({ request, response }: HttpContextContract) {
    const { page = 1, limit = 10, keyword = "" } = request.qs()

    try {
      const data = await Module
        .query()
        .whereILike('id', `%${keyword}%`)
        .orderBy('id')
        .paginate(page, limit)
      response.ok({ message: "Berhasil mengambil data", data })
    } catch (error) {
      response.badRequest({ message: "Gagal mengambil data", error })
    }
  }

  public async store({ request, response }: HttpContextContract) {
    const createModuleSchema = schema.create({
      id: schema.string([
        rules.unique({ table: 'modules', column: 'id' }),
        rules.alphaNum({ allow: ['underscore', 'dash'] })
      ]),
      description: schema.string.optional()
    })

    const payload = await request.validate({ schema: createModuleSchema })

    try {
      const data = await Module.create(payload)
      response.created({ message: "Berhasil menyimpan data", data })
    } catch (error) {
      response.badRequest({ message: "Gagal menyimpan data", error })
    }
  }

  public async show({ params, response }: HttpContextContract) {
    const { id } = params
    try {
      const data = await Module.query().preload('menus', query => query.preload('functions')).where('id', id)
      const data2 = await Database.from('modules').select('*') //select("menus.*", "modules.description")
        .leftJoin('menus', query => query.on('modules.id', '=', 'menus.module_id'))
        .where('modules.id', id)
      // .toSQL()
      response.ok({ message: "Berhasil mengambil data", data, data2 })
    } catch (error) {
      console.log(error);

      response.badRequest({ message: "Gagal mengambil data", error })
    }
  }

  public async update({ params, request, response }: HttpContextContract) {
    try {
      const { id } = params
      const updateModuleScheme = schema.create({
        id: schema.string.optional({}, [
          rules.unique({ table: 'modules', column: 'id' }),
          rules.alphaNum({ allow: ['underscore', 'dash'] })
        ]),
        description: schema.string.nullableAndOptional()
      })

      const payload = await request.validate({ schema: updateModuleScheme })

      await Module.findOrFail(id)

      let newData = {}
      if (payload.id) { Object.assign(newData, { id: payload.id }) }
      if (payload.description) { Object.assign(newData, { description: payload.description }) }

      await Module.query().where('id', id).update(newData)

      response.ok({ message: "Berhasil mengubah data" })
    } catch (error) {
      response.badRequest({ message: "Gagal mengubah data", error: error.message })
      console.log(error);
    }
  }

  public async destroy({ params, response }: HttpContextContract) {
    const { id } = params
    try {
      const module = await Module.findOrFail(id)
      await module.delete()

      response.ok({ message: "Berhasil mengahpus data" })
    } catch (error) {
      response.badRequest({ message: "Gagal menghapus data", error: error.message })
    }
  }
}
