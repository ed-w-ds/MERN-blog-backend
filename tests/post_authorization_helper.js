const Blog = require('../models/blog')
const User = require('../models/user')

const initialBlogs = [
    {
        title: 'HTML is easy',
        author: 'John Doe',
        url: 'http://www.example.com',
        likes: 0,
    },
    {
        title: 'Browser can execute only Javascript',
        author: 'John Deer',
        url: 'http://www.google.com',
        likes: 1,
    },
]

const initialUsers = [
    {
        username: 'root',
        name: 'Superuser',
        password: 'salainen'
    },
    {
        username: 'johndoe',
        name: 'John Doe',
        password: '123456'
    }
]

module.exports = {
    initialBlogs,
    initialUsers
}