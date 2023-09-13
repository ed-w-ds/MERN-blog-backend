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

const nonExistingId = async () => {
    const blog = new Blog({
        title: 'willremovethissoon',
        author: 'John Doe',
        url: 'http://www.example.com',
        likes: 0,
    })
    await blog.save()
    await blog.remove()

    return blog._id.toString()
}

const blogsInDb = async () => {
    const blogs = await Blog.find({})
    return blogs.map(blog => blog.toJSON())
}

const usersInDb = async () => {
    const users = await User.find({})
    return users.map(user => user.toJSON())
}

module.exports = {
    initialBlogs,
    nonExistingId,
    blogsInDb,
    usersInDb,
}
