const blogsRouter = require('express').Router()
const { error } = require('console')
const Blog = require('../models/blog')
const User = require('../models/user')
const jwt = require('jsonwebtoken')

blogsRouter.get('/', async (request, response) => {
    const blogs = await Blog
        .find({})
        .populate('user', { username: 1, name: 1 })

    response.json(blogs)
    })

blogsRouter.post('/', async (request, response) => {
    const body = request.body
    const decodedToken = jwt.verify(request.token, process.env.SECRET)

    if (!decodedToken || !request.token) {
        return response.status(401).json({ error: 'token missing or invalid' })
    }
    if (request.token === undefined) {
        return response.status(401).json({ error: 'token undefined' })
    }

    const user = await User.findById(decodedToken.id)

    const blog = new Blog({
        title: body.title,
        author: body.author,
        url: body.url,
        likes: body.likes,
        user: user.id,
    })

    if (!blog.title || !blog.url) {
        return response.status(400).json({
            error: 'title or url missing'
        })
    }

    const savedBlog = await blog.save()
    user.blogs = user.blogs.concat(savedBlog._id)
    await user.save()

    response.status(201).json(savedBlog)
})

blogsRouter.delete('/:id', async (request, response) => {
    const user = request.user

    try {
    const blog = await Blog.findById(request.params.id)
    if (blog.user.toString() !== user.id.toString()) {
        return response.status(401).json({ error: 'only the creator can delete blogs' })
    }

    await Blog.findByIdAndRemove(request.params.id)
    console.log(`blog ${blog.title} by ${blog.author} deleted`)
    response.status(204).end()
    } catch (error) {
        next(error)
    }
})
// blogsRouter.delete('/:id', async (request, response) => {
//     const decodedToken = jwt.verify(request.token, process.env.SECRET)
//     if (!decodedToken) {
//         return response.status(401).json({ error: 'token missing or invalid' })
//     }

//     const blog = await Blog.findById(request.params.id)
//     if (blog.user.toString() !== decodedToken.id.toString()) {
//         return response.status(401).json({ error: 'only the creator can delete blogs' })
//     }

//     await Blog.findByIdAndRemove(request.params.id)
//     response.status(204).end()
// })

blogsRouter.put('/:id', async (request, response) => {
    const body = request.body
    const blog = {
        title: body.title,
        author: body.author,
        url: body.url,
        likes: body.likes,
        id: body.id,
        usersWhoLiked: body.usersWhoLiked
    }
    const updatedBlog = await Blog.findByIdAndUpdate(request.params.id, blog, { new: true })
    console.log('updatedBlog', updatedBlog)
    response.json(updatedBlog)
})

blogsRouter.post('/:id/comments', async (request, response) => {
    if (!request.body.comment || request.body.comment === '') {
        return response.status(400).json({
            error: 'comment missing'
        })
    }
    const body = request.body
    const blog = await Blog.findById(request.params.id)
    blog.comments = blog.comments.concat(body.comment)
    const updatedBlog = await Blog.findByIdAndUpdate(request.params.id, blog, { new: true })
    response.json(updatedBlog)
})

module.exports = blogsRouter