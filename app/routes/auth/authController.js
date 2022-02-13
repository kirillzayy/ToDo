const User      = require('../../models/User')
const Role      = require('../../models/Role')
const crypto    = require('crypto')
const jwt       = require('jsonwebtoken')
const { auth }  = require('../../../config')

const generateAccessToken = (id, roles) => {
    const payload = {
        id,
        roles
    }
    
    return jwt.sign(payload, auth.secret, {expiresIn: '24h'})
}

class authController {
    
    async registration (req, res) {
        try {
            const {username, password} = req.body
            const person = await User.findOne({username})
            
            if (person) res.status(400).json({message: 'Пользователь с таким именем уже существует'})
            
            const hashPassword = crypto.createHash('md5').update(password).digest('hex')
            const userRole = await Role.findOne({value: 'ADMIN'})
            const user = new User({username: username, password: hashPassword, roles: [userRole.value]})
            await user.save()
            
            return res.json({message: 'Пользователь зарегистрирован'})
            
        } catch (e) {
            return res.status(400).json({message: `Ошибка при регистрации: ${e}`})
        }
    }
    
    async login (req, res) {
        try {
            const {username, password} = req.body
            const user = await User.findOne({username})
            
            console.log(req.body)
            
            if (!user) res.status(400).json({message: `Пользователь ${e} не найден`})
            
            const hashPassword = crypto.createHash('md5').update(password).digest('hex')
            const validPassword = hashPassword === user.password
            
            if (!validPassword) res.status(400).json({message: `Неверный пароль`})
            
            const token = generateAccessToken(user._id, user.roles)
            return res.json({token})
            
        } catch (e) {
            return res.status(400).json({message: `Ошибка при авторизации: ${e}`})
        }
    }
    
    async getUsers (req, res) {
        try {
            const users = await User.find()
            
            return res.json(users)
        } catch (e) {
            return res.status(400).json({message: `Ошибка: ${e}`})
        }
    }
}

module.exports = new authController()