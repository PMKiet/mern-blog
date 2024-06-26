import User from "../models/user.model.js"
import { errorHandler } from "../utils/error.js"
import bcryptjs from 'bcryptjs'

export const test = (req, res) => {
    res.json({ message: 'hello word' })
}

export const updateUser = async (req, res, next) => {
    if (req.user.id !== req.params.userId) {
        return next(errorHandler(403), 'You are not allowed to update user')
    }

    if (req.body.password) {
        if (req.body.password.length < 6) {
            return next(errorHandler(400, 'Password must be at least 6 characters'))
        }
        req.body.password = bcryptjs.compare(password, 10)
    }
    if (req.body.username) {

        if (req.body.username.length < 7 || req.body.username.length > 20) {
            return next(errorHandler(400, 'Username must be between7 and 20 characters'))
        }

        if (!req.body.username.match(/^[a-zA-Z0-9]+$/)) {
            return next(errorHandler(400, 'Username must be contain letters and numbers'))
        }
    }

    try {
        const updateUser = await User.findByIdAndUpdate(req.params.userId, {
            $set: {
                username: req.body.username,
                password: req.body.password,
                profilePicture: req.body.profilePicture,
                email: req.body.email
            },
        }, { new: true })
        const { password, ...rest } = updateUser._doc
        res.status(200).json(rest)
    } catch (error) {
        next(error)
    }
}

export const deleteUser = async (req, res, next) => {
    if (!req.user.isAdmin && req.user.id !== req.params.userId) {
        return next(403, 'You are not allow delete this user')
    }
    try {
        await User.findByIdAndDelete(req.params.userId)
        res.status(200).json({ message: 'User has been deleted' })
    } catch (error) {
        next(error)
    }
}

export const signout = (req, res, next) => {
    try {
        res.clearCookie('accessToken').status(200).json({ message: 'User has been sign Out' })
    } catch (error) {
        next(error)
    }
}

export const getUsers = async (req, res, next) => {
    if (!req.user.isAdmin) {
        return next(403, 'You are not allow see all users')
    } try {
        const startIndex = parseInt(req.query.startIndex) || 0
        const limit = parseInt(req.query.limit) || 9
        const sortDirection = req.query.sort === 'asc' ? 1 : -1

        const users = await User.find().sort({ createAt: sortDirection }).skip(startIndex).limit(limit)

        const userWithoutPassword = users.map((user) => {
            const { password, ...rest } = user._doc
            return rest
        })

        const totalUsers = await User.countDocuments()

        const now = new Date()

        const oneMonthAgo = new Date(
            now.getFullYear(),
            now.getMonth() - 1,
            now.getDate()
        )
        const lastMonthUsers = await User.countDocuments({
            createdAt: { $gte: oneMonthAgo }
        })

        res.status(200).json({
            users: userWithoutPassword,
            totalUsers,
            lastMonthUsers
        })
    } catch (error) {
        console.log(error);
        next(error)
    }
}

export const getUser = async (req, res, next) => {
    try {
        const user = await User.findById(req.params.userId)
        if (!user) {
            return next(errorHandler(400, 'user not found'))
        }
        const { password, ...rest } = user._doc
        res.status(200).json(rest)
    } catch (error) {
        next(error)
    }
}