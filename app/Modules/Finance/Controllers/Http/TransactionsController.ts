import type { HttpContextContract } from '@ioc:Adonis/Core/HttpContext'
import Transaction from '../../Models/Transaction';
import CreateTransactionValidator from '../../Validators/CreateTransactionValidator';
import { validate as uuidValidation } from "uuid";
import UpdateTransactionValidator from '../../Validators/UpdateTransactionValidator';
import Billing from '../../Models/Billing';
import { BillingStatus } from '../../lib/enums';

export default class TransactionsController {
  public async index({ request, response }: HttpContextContract) {
    const { page = 1, limit = 10, mode = "page" } = request.qs();

    try {
      let data = {}
      if (mode === 'page') {
        data = await Transaction.query()
          .preload('billings', qBilling => {
            qBilling.select('name', 'amount', 'remaining_amount', 'account_id').preload('account', qAccount => qAccount.select('account_name'))
          })
          .paginate(page, limit);
      } else {
        data = await Transaction.query()
        .preload('billings', qBilling => {
          qBilling.select('name', 'amount', 'remaining_amount', 'account_id').preload('account', qAccount => qAccount.select('account_name'))
        })
      }

      response.ok({ message: "Berhasil mengambil data", data });
    } catch (error) {
      const message = "FTR-IND: " + error.message || error;
      console.log(error);
      response.badRequest({
        message: "Gagal mengambil data",
        error: message,
        error_data: error,
      });
    }
  }

  public async store({ request, response }: HttpContextContract) {
    const payload = await request.validate(CreateTransactionValidator)

    const { items: paidItems, ...transactionPayload } = payload

    const totalAmount = paidItems.reduce((sum, current) => sum + current.amount, 0)

    try {
      const transactionData: Transaction = await Transaction.create({...transactionPayload, amount: totalAmount})

      const attachBill = paidItems.reduce((result, item) => {
        result[item.billing_id] = { amount: item.amount}
        return result
      }, {})

      // insert ke tabel pivot
      await transactionData.related('billings').attach(attachBill)
      const relatedBilling = await transactionData.related('billings').query()
      
      //////
      // kurangi sisa pembayaran di billing sesuai jumlah yg sudah dibayarkan
      // kenapa dibikin object Map disini, utk relasi paidItems.billingId dengan relatedBilling.id
      const paidItemsMap = new Map(paidItems.map(item => [item.billing_id, item.amount]))

      const updateBillingPayload = relatedBilling.map(item => {
        const amountPaid = paidItemsMap.get(item.id) || 0
        const remainingAmount = item.remainingAmount - amountPaid
        let newStatus = item.status

        if (remainingAmount !== item.remainingAmount) {
          if (remainingAmount > 0) newStatus = BillingStatus.PAID_PARTIAL
          if (remainingAmount <= 0) newStatus = BillingStatus.PAID_FULL
        }

        return {
          id: item.id,
          remaining_amount: remainingAmount,
          status: newStatus
        }
      })

      await Billing.updateOrCreateMany("id", updateBillingPayload)
      //////


      const data = await Transaction.query()
        .where('id', transactionData.id)
        .preload('billings')
      response.created({ message: "Berhasil menyimpan data", data })
    } catch (error) {
      const message = "FTR-STO: " + error.message || error;
      response.badRequest({
        message: "Gagal menyimpan data",
        error: message,
      })
    }
  }

  public async show({ params, response }: HttpContextContract) {
    const { id } = params;

    if (!uuidValidation(id)) {
      return response.badRequest({ message: "ID tidak valid" });
    }

    try {
      const data = await Transaction.query()
        .where('id', id)
        .preload('billings', qBilling => {
          qBilling
            .select('name', 'amount', 'remaining_amount', 'account_id')
            .preload('account', qAccount => {
              qAccount.select('account_name', 'number')
            })
        })
        .preload('teller', qEmployee => qEmployee.select('name'))
        .firstOrFail()
      response.ok({ message: "Berhasil mengambil data", data });
    } catch (error) {
      const message = "FTR-SHO: " + error.message || error;
      console.log(error);
      response.badRequest({
        message: "Gagal mengambil data",
        error: message,
        error_data: error,
      })
    }
  }

  public async update({ params, request, response }: HttpContextContract) {
    const { id } = params;
    const payload = await request.validate(UpdateTransactionValidator);
    if (JSON.stringify(payload) === "{}") {
      return response.badRequest({ message: "Data tidak boleh kosong" });
    }

    try {
      const transaction = await Transaction.findOrFail(id);
      const data = await transaction.merge(payload).save();
      response.ok({ message: "Berhasil mengubah data", data });
    } catch (error) {
      const message = "FTR-UPD: " + error.message || error;
      console.log(error);
      response.badRequest({
        message: "Gagal mengubah data",
        error: message,
        error_data: error,
      });
    }
  }

  public async destroy({ params, response }: HttpContextContract) {
    const { id } = params;
    if (!uuidValidation(id)) {
      return response.badRequest({ message: "ID tidak valid" });
    }

    try {
      const data = await Transaction.findOrFail(id);
      await data.delete();
      response.ok({ message: "Berhasil menghapus data" });
    } catch (error) {
      const message = "FMB-DES: " + error.message || error;
      console.log(error);
      response.badRequest({
        message: "Gagal menghapus data",
        error: message,
        error_data: error,
      });
    }
  }
}
