const mongoose = require('mongoose')
const supertest = require('supertest')
const helper = require('./post_authorization_helper')
const app = require('../app')

// supertest takes care that the application being tested is started at the port it uses internally
const api = supertest(app)

const Blog = require('../models/blog')
const { describe } = require('node:test')
const { error } = require('console')
const User = require('../models/user')

const jwt = require('jsonwebtoken')
const { get } = require('lodash')
const { request } = require('http')

let token = ''
let decodedToken = ''

const getBlogs = async () => {
    const blogs = await api
        .get('/api/blogs')
        .set('Authorization', `Bearer ${token}`)
        .expect(200)
        .expect('Content-Type', /application\/json/)
    return blogs
}

beforeEach(async () => {
    await User.deleteMany({})
    await api
        .post('/api/users')
        .send(helper.initialUsers[0])
        .expect(201)
        .expect('Content-Type', /application\/json/)

    await api
        .post('/api/users')
        .send(helper.initialUsers[1])
        .expect(201)
        .expect('Content-Type', /application\/json/)

    const loginResponse = 
        await api
            .post('/api/login')
            .send(helper.initialUsers[0])
            .expect(200)
            .expect('Content-Type', /application\/json/)
        
    const tokenToDecode = loginResponse.body.token
    token = tokenToDecode
    decodedToken = jwt.verify(tokenToDecode, process.env.SECRET)

    // delete all blogs
    await Blog.deleteMany({})
    // add blogs
    let i = 0
    while (i < helper.initialBlogs.length)  {
        const blog = helper.initialBlogs[i]
        blog.user = decodedToken.id
        await api
            .post('/api/blogs')
            .set('Authorization', `Bearer ${token}`)
            .send({ ...blog, user: decodedToken.id })
            .expect(201)
            .expect('Content-Type', /application\/json/)
        i++
    } 
    const blogs = 
    await api
        .get('/api/blogs')
        .set('Authorization', `Bearer ${token}`)
        .expect(200)
        .expect('Content-Type', /application\/json/)
})

test('blogs are returned as json', async () => {
    await api
        .get('/api/blogs')
        .set('Authorization', `Bearer ${token}`)
        .expect(200)
        .expect('Content-Type', /application\/json/)
})

test('all blogs are returned', async () => {
    const response = await getBlogs()
    expect(response.body).toHaveLength(helper.initialBlogs.length)
})

test('unique identifier property of the blog posts is defined', async () => {
    const response = await getBlogs()
    expect(response.body[0].user.id).toBeDefined()
})

describe('addition of a new blog', () => {
    const request = decodedToken

    const newBlog = {
        title: 'Crime and Punishment',
        author: 'Fyodor Dostoevsky',
        url: 'https://en.wikipedia.org/wiki/Crime_and_Punishment',
        likes: 10,
        user: request.username
    }

    test('a valid blog can be added', async () => {
        // check if the blog is added to the database
        await api
            .post('/api/blogs')
            .set('Authorization', `Bearer ${token}`)
            .send(newBlog)
            .expect(201) // 201 means Created
            .expect('Content-Type', /application\/json/)
        // verify that the number of blogs have increased by one
        const blogsAtEnd = await getBlogs()
        expect(blogsAtEnd.body).toHaveLength(helper.initialBlogs.length + 1)
    })
})

test('if the likes property is missing from the request, it will default to the value 0', async () => {
    const request = decodedToken
    const newBlogNoLikes = {
        title: 'Crime and Punishment',
        author: 'Fyodor Dostoevsky',
        url: 'https://en.wikipedia.org/wiki/Crime_and_Punishment',
        user: request.username
    }

    await api
        .post('/api/blogs')
        .set('Authorization', `Bearer ${token}`)
        .send(newBlogNoLikes)
        .expect(201) // 201 means Created
        .expect('Content-Type', /application\/json/)

    const blogsAtEnd = await getBlogs()
    expect(blogsAtEnd.body[blogsAtEnd.body.length - 1].likes).toBe(0)
})

test('if the title and url properties are missing from the request data, the backend responds to the request with the status code 400 Bad Request', async () => {
    const newBlogNoTitleAndUrl = {
        title: 'No URL and Title',
        likes: 10
    }

    await api
        .post('/api/blogs')
        .set('Authorization', `Bearer ${token}`)
        .send(newBlogNoTitleAndUrl)
        .expect(400) // bad request
})

test('deletion of a blog', async () => {
    const blogsAtStart = await getBlogs()
    const blogToDelete = blogsAtStart.body[0]

    await api
        .delete(`/api/blogs/${blogToDelete.id}`)
        .set('Authorization', `Bearer ${token}`)
        .expect(204)

    const blogsAtEnd = await getBlogs()
    expect(blogsAtEnd.body).toHaveLength(helper.initialBlogs.length - 1)

    const contents = blogsAtEnd.body.map(r => r.title)
    expect(contents).not.toContain(blogToDelete.title)
})

test('updating a blog', async () => {
    const blogsAtStart = await getBlogs()
    const blogToUpdate = blogsAtStart.body[0]

    const updatedBlog = {
        title: 'HTML is easy!!!',
        author: 'John Deer',
        url: 'http://www.google.com',
        likes: 10
    }

    await api
        .put(`/api/blogs/${blogToUpdate.id}`)
        .set('Authorization', `Bearer ${token}`)
        .send(updatedBlog)
        .expect(200)

    const blogsAtEnd = await getBlogs()
    expect(blogsAtEnd.body).toHaveLength(helper.initialBlogs.length)

    const contents = blogsAtEnd.body.map(r => r.title)
    expect(contents).toContain(updatedBlog.title)
})

describe('ensure invalid users are not created'), () => {

    test('invalid username not added', async () => {
        const usersAtStart = await api
            .get('/api/users')
            .expect(200)
            .expect('Content-Type', /application\/json/)

        const newUser = {
            username: '<3',
            name: 'John Deers',
            password: '122344'
        }

        await api
            .post('/api/users')
            .send(newUser)
            .expect(400)

        const usersAtEnd = await api
            .get('/api/users')
            .expect(200)
            .expect('Content-Type', /application\/json/)

        expect(usersAtEnd.body).toHaveLength(usersAtStart.length)
    })

    test('invalid password not added', async () => {
        const usersAtStart = await helper.usersInDb()

        const newUser = {
            username: 'Dostoevsky',
            name: 'Fyodor Dostoevsky',
            password: '12'
        }

        await api
            .post('/api/users')
            .send(newUser)
            .expect(400)

        const usersAtEnd = await helper.usersInDb()
        expect(usersAtEnd).toHaveLength(usersAtStart.length)
    })
}

afterAll(() => {
    mongoose.connection.close()
})
