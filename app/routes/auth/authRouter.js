const Router            = require('express')
const router            = new Router()
const controller        = require('./authController')
const authMiddleware    = require('../../../middleware/authMiddleware')

router.post('/registration', controller.registration)
router.post('/login', controller.login)
router.get('/users', authMiddleware(['ADMIN']), controller.getUsers)

module.exports = router