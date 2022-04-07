const express        = require('express')
// const exphbs         = require('express-handlebars')
const mongoose       = require('mongoose')
const config         = require('./config')
// const authMiddleware = require('./middleware/authMiddleware')
const authRouter     = require('./app/routes/auth/authRouter')
const tasksRouter    = require('./app/routes/tasks/tasksRouter')

const cookieParser = require('cookie-parser')
const bodyParser = require('body-parser')
const crypto = require('crypto');

const port           = process.env.port || 8000
const app            = express()

const getHashedPassword = (password) => {
    const sha256 = crypto.createHash('sha256');
    const hash = sha256.update(password).digest('base64');
    return hash;
}

app.set('view engine', 'ejs');
app.set('views', './app/views/')

// To support URL-encoded bodies
app.use(bodyParser.urlencoded({ extended: true }));

// To parse cookies from the HTTP Request
app.use(cookieParser());

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
                    // role: 'DEVELOPER',
                    role: 'CUSTOMER',
                    // role: 'DEVELOPER',
                    theme: 'light',
                    name: 'Kirill',
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
