const Router            = require('express')
const router            = new Router()
const controller        = require('./tasksController')
const authMiddleware    = require('../../../middleware/authMiddleware')

router.get('/', controller.getTasks)
router.post('/add', controller.addTask)
router.post('/edit', controller.editTask)
router.post('/delete', controller.deleteTask)
router.get('/restore', controller.restoreAllTasks)
//router.get('/users', authMiddleware(['ADMIN']), controller.getUsers)

module.exports = router