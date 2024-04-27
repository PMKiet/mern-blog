import User from "../models/user.model.js"
import bcryptjs from 'bcryptjs'

export const signup = async (req, res) => {
    const { username, email, password } = req.body

    if (!username || !email || !password || username === '' || email === '' || password === '') {
        res.status(400).json({ message: 'All fields is required' })
    }

    const hashPassword = bcryptjs.hashSync(password, 10)

    const newUser = new User({
        username,
        email,
        password: hashPassword
    })

    try {

        await newUser.save()
        res.status(201).json({ message: 'Sign up successful' })

    } catch (error) {
        res.status(500).json({ message: error.message })
    }

}