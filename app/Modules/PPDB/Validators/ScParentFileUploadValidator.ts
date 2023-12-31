import { schema, CustomMessages } from '@ioc:Adonis/Core/Validator'
import type { HttpContextContract } from '@ioc:Adonis/Core/HttpContext'

export default class ScParentFileUploadValidator {
  constructor(protected ctx: HttpContextContract) { }

  public schema = schema.create({
    file: schema.file({
      size: '2mb',
      extnames: ['jpg', 'jpeg', 'gif', 'png', 'pdf']
    }),
    category: schema.enum(['ktp'])
  })

  public messages: CustomMessages = {}
}
