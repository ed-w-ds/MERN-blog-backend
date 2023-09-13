/* eslint-disable */
const testingRouter = require('express').Router()
const Blog = require('../models/blog')
const User = require('../models/user')

console.log('testing.js: testingRouter: ', testingRouter)

testingRouter.post('/reset', async (request, response) => {
    await Blog.deleteMany({})
    await User.deleteMany({})

    response.status(204).end()
})

module.exports = testingRouter