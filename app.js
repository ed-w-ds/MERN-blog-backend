const mongoose = require('mongoose')
const express = require('express')
require('express-async-errors')
const cors = require('cors')

const config = require('./utils/config')

const app = express()
const middleware = require('./utils/middleware')
const blogsRouter = require('./controllers/blogs.js')
const usersRouter = require('./controllers/users.js')
const loginRouter = require('./controllers/login.js')
const testingRouter = require('./controllers/testing.js')

mongoose.set('strictQuery', false)

mongoose.connect(config.MONGODB_URI)
    .then(() => {
        console.log('connected to MongoDB', config.MONGODB_URI)
    })
    .catch((error) => {
        console.log('error connecting to MongoDB:', error.message)
    })

app.use(cors())
app.use(express.static('build'))
app.use(express.json())
app.use(middleware.requestLogger)
app.use(middleware.tokenExtractor)

app.use('/api/blogs', middleware.userExtractor, blogsRouter)
app.use('/api/users', usersRouter)
app.use('/api/login', loginRouter)
if (process.env.NODE_ENV === 'test ') {
    app.use('/api/testing', testingRouter)
}

app.use(middleware.errorHandler)

module.exports = app




// MODEL/BLOG.JS 
// const mongoose = require('mongoose')
// mongoose.set('strictQuery', false)

// const blogSchema = new mongoose.Schema({
//   title: String,
//   author: String,
//   url: String,
//   likes: Number
// })
// blogSchema.set('toJSON', {
//     transform: (document, returnedObject) => {
//         returnedObject.id = returnedObject._id.toString()
//         delete returnedObject._id
//         delete returnedObject.__v
//     }
// })
// exported from MODEL/BLOG.JS:
// const Blog = mongoose.model('Blog', blogSchema)

// CONTROLLERS/BLOGS.JS
// app.get('/api/blogs', (request, response) => {
//   Blog
//     .find({})
//     .then(blogs => {
//       response.json(blogs)
//     })
// })

// app.post('/api/blogs', (request, response) => {
//   const body = request.body

//   const blog = new Blog({
//     title: body.title,
//     author: body.author,
//     url: body.url,
//     likes: body.likes
//   })

//   blog
//     .save()
//     .then(savedBlog => {
//       response.status(201).json(savedBlog)
//     })
// })