const express        = require('express')
const exphbs         = require('express-handlebars')
const mongoose       = require('mongoose')
const config         = require('./config')
const authMiddleware = require('./middleware/authMiddleware')
const authRouter     = require('./app/routes/auth/authRouter')
const tasksRouter    = require('./app/routes/tasks/tasksRouter')

const port           = process.env.port || 8000
const app            = express()

app.set('view engine', 'ejs');
app.set('views', './app/views/')

app.use(express.json())
app.use(express.static('public'));
app.use('/auth', authRouter)
app.use('/api/tasks', tasksRouter)

const start = async () => {
    try {
        await mongoose.connect(config.db.url)
        
        app.get('/', (req, res) => {

            const token = req.headers.authorization && req.headers.authorization.split(' ')[1]
            if (!token) {
                res.redirect('/login')
            } else {
                res.redirect('/tasks')
            }
        });
        //обработка запроса
        app.get('/login', (req, res) => {
            res.render('./pages/loginPage')
        })

        app.get('/tasks', (req, res) => {
            //определяю роль и даю нужный шаблон, по умолчанию dev
            res.render('./pages/tasksPage', { 
                token : {
                    role: 'DEVELOPER'
                }
            })
        })
        
        app.listen(port, () => {
            console.log(`Сервер запущен: ${port}`)
        })
        
    } catch (e) {
        console.log(`Ошибка запуска сервера: ${e}`)
    }
}

start()
