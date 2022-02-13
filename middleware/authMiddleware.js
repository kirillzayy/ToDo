const jwt       = require('jsonwebtoken')
const { auth }  = require('../config')

module.exports = (roles) => {
    return (req, res, next) => {

        if (req.method === 'OPTIONS') {
            next()
        }
        
        try {
            const token = req.headers.authorization.split(' ')[1]
            if (!token) {
                return res.status(403).json({message: `Пользователь не авторизован`})
            }

            const decodedData = jwt.verify(token, auth.secret)
            req.user = decodedData
            let hasRoles = false
            
            roles.forEach((role) => {
                if (req.user.roles.includes(role)) hasRoles = true;   
            })
            
            if (!hasRoles) {
                return res.status(403).json({message: `Недостаточно прав доступа`})
            }
            
            next()

        } catch (e) {
            return res.status(403).json({message: `Пользователь не авторизован`})
        }
    }
} 