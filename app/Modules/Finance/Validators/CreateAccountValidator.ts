import { schema, CustomMessages, rules } from '@ioc:Adonis/Core/Validator'
import type { HttpContextContract } from '@ioc:Adonis/Core/HttpContext'
import { BillingType } from '../lib/enums'

export default class CreateAccountValidator {
  constructor(protected ctx: HttpContextContract) { }

  public schema = schema.create({
    accounts: schema.array().members(
      schema.object().members({
        coa_id: schema.string.optional([
          rules.exists({ table: 'finance.coas', column: 'id' })
        ]),
        student_id: schema.string.optional([
          rules.exists({ table: 'academic.students', column: 'id' })
        ]),
        employee_id: schema.string.optional([
          rules.exists({ table: 'public.employees', column: 'id' })
        ]),
        owner: schema.string.optional(),
        account_name: schema.string(),
        balance: schema.number.optional(),
        ref_amount: schema.number.optional(),
        type: schema.enum.optional(Object.values(BillingType)),
        number: schema.string([
          rules.regex(new RegExp("^[0-9]+$")),
          rules.unique({table: 'finance.accounts', column: 'number'})
        ]),
      })
    )
  })

  public messages: CustomMessages = {}
}
