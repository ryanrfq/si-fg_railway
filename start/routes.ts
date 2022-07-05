/*
|--------------------------------------------------------------------------
| Routes
|--------------------------------------------------------------------------
|
| This file is dedicated for defining HTTP routes. A single file is enough
| for majority of projects, however you can define routes in different
| files and just make sure to import them inside this file. For example
|
| Define routes in following two files
| ├── start/routes/cart.ts
| ├── start/routes/customer.ts
|
| and then import them inside `start/routes.ts` as follows
|
| import './routes/cart'
| import './routes/customer'
|
*/

import Route from '@ioc:Adonis/Core/Route'

Route.get('/', async ({ auth }) => {
  return { hello: 'you are logged in', data: auth.user }

}).middleware("auth")

Route.post('/password-encrypt', 'System/UsersController.password_encrypt').as('passwordEncrypt')
Route.post('/auth/login', 'System/UsersController.login').as('auth.login')
Route.post('/auth/logout', 'System/UsersController.logout').as('auth.logout').middleware('auth')
Route.post('/auth/register', 'System/UsersController.register').as('auth.register')
Route.post('/auth/reset-password', 'System/UsersController.resetUserPassword').as('auth.resetUserPassword').middleware(['auth', 'checkRole:admin'])
Route.get('/admin/get-users', 'System/UsersController.getUsers').as('admin.get-user').middleware('auth')
Route.resource('/division/', 'DivisionsController').as('division').apiOnly().middleware({ '*': ['auth', 'checkRole:admin'] })
Route.resource('/employee/', 'EmployeesController').as('employee').apiOnly().middleware({ '*': ['auth', 'checkRole:admin'] })
Route.resource('/activity/', 'ActivitiesController').as('activity').apiOnly().middleware({ '*': ['auth', 'checkRole:admin'] })
Route.resource('/presence/', 'PresencesController').as('presence').middleware({ '*': ['auth', 'checkRole:admin'] })
Route.get('/employee-list/', 'EmployeesController.getEmployee').as('employee.list').middleware(['auth', 'checkRole:admin'])
Route.get('/division-list/', 'DivisionsController.getDivision').as('division.list').middleware(['auth', 'checkRole:admin'])
Route.get('/activity-list/', 'ActivitiesController.getActivity').as('activity.list').middleware(['auth', 'checkRole:admin'])
