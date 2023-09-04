import Route from '@ioc:Adonis/Core/Route'
Route.group(() => {
    Route.get('/', () => {
        return "You got here at finance!"
    })

    Route.resource('master-billings', 'MasterBillingsController').apiOnly().middleware({ '*': ['auth'] })
    Route.resource('billings', 'BillingsController').apiOnly().except(['update']).middleware({ '*': ['auth:api,parent_api'] })
    Route.put('billings', 'BillingsController.update').middleware(['auth'])
    Route.resource('accounts', 'AccountsController').apiOnly().middleware({ '*': ['auth'] })
    Route.resource('transactions', 'TransactionsController').apiOnly().middleware({ '*': ['auth'] })
    Route.resource('transaction-documents', 'TransactionDocumentsController').apiOnly().middleware({
        'index': ['auth:api,parent_api'],
        'store': ['auth:parent_api']
    })

}).prefix('finance').namespace('FinanceControllers')
