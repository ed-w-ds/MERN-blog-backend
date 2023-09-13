const bcrypt = require('bcrypt');
const usersRouter = require('express').Router();
const User = require('../models/user');


usersRouter.get('/', async (request, response) => {
    const users = await User
        .find({})
        .populate('blogs', { title: 1, author: 1, url: 1, likes: 1 })

    response.json(users);
});

usersRouter.post('/', async (request, response) => {
    const { username, name, password } = request.body;

    // hash the password
    saltRounds = 10
    const passwordHash = await bcrypt.hash(password, saltRounds)

    const user = new User({
        username,
        name,
        passwordHash,
    })

    if (!username || !password) {
        return response.status(400).json({
            error: 'username and/or password missing'
        })
    }

    // is required as the password received by the backend is the hashed password
    if (password.length < 3) {
        return response.status(400).json({
            error: 'password must be at least 3 characters long'
        })
    }

    // not required as it is handled by mongoose in the schema
    if (username.length < 3) {
        return response.status(400).json({
            error: 'username must be at least 3 characters long'
        })
    }

    const savedUser = await user.save()
    response.status(201).json(savedUser)
})

module.exports = usersRouter;
