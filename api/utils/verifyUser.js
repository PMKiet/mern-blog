import jwt from 'jsonwebtoken'
import { errorHandler } from './error.js'

export const verifyToken = (req, res, next) => {
    const token = req.cookies.accessToken
    console.log(token);
    if (!token) {
        return next(errorHandler(401, 'Unauthorized'))
    }
    jwt.verify(token, process.env.JWT_SECRET, (error, user) => {
        if (error) {
            return next(errorHandler(401, 'Unauthorized'))
        }
        req.user = user
        next()
    })
}