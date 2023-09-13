const mongoose = require('mongoose')
const supertest = require('supertest')
const helper = require('./test_helper')
const app = require('../app')

// supertest takes care that the application being tested is started at the port it uses internally
const api = supertest(app)

const Blog = require('../models/blog')
const { describe } = require('node:test')
const { error } = require('console')
const User = require('../models/user')

beforeEach(async () => {
    await Blog.deleteMany({})
    await Blog.insertMany(helper.initialBlogs)
})

test('blogs are returned as json', async () => {
    await api
        .get('/api/blogs')
        .expect(200)
        .expect('Content-Type', /application\/json/)
})

test('all blogs are returned', async () => {
    const response = await api.get('/api/blogs')

    expect(response.body).toHaveLength(helper.initialBlogs.length)
})

test('unique identifier property of the blog posts is named id', async () => {
    const response = await api.get('/api/blogs')

    expect(response.body[0].id).toBeDefined()
})

describe('addition of a new blog', () => {
    const newBlog = {
        title: 'Crime and Punishment',
        author: 'Fyodor Dostoevsky',
        url: 'https://en.wikipedia.org/wiki/Crime_and_Punishment',
        likes: 10,
        user: request.user
    }

    test('a valid blog can be added', async () => {
        // check if the blog is added to the database
        await api
            .post('/api/blogs')
            .send(newBlog)
            .expect(201) // 201 means Created
            .expect('Content-Type', /application\/json/)
            // console.log('newBlog', newBlog)
        // verify that the number of blogs have increased by one
        const blogsAtEnd = await helper.blogsInDb()
        expect(blogsAtEnd).toHaveLength(helper.initialBlogs.length + 1)
    })
})

test('if the likes property is missing from the request, it will default to the value 0', async () => {
    const newBlogNoLikes = {
        title: 'Crime and Punishment',
        author: 'Fyodor Dostoevsky',
        url: 'https://en.wikipedia.org/wiki/Crime_and_Punishment',
        user: request.user
    }

    await api
        .post('/api/blogs')
        .send(newBlogNoLikes)
        .expect(201) // 201 means Created
        .expect('Content-Type', /application\/json/)
        
    const blogsAtEnd = await helper.blogsInDb()
    expect(blogsAtEnd[blogsAtEnd.length - 1].likes).toBe(0)
})

test('if the title and url properties are missing from the request data, the backend responds to the request with the status code 400 Bad Request', async () => {
    const newBlogNoTitleAndUrl = {
        title: 'No URL and Title',
        likes: 10
    }

    await api
        .post('/api/blogs')
        .send(newBlogNoTitleAndUrl)
        .expect(400) // bad request
})

test('deletion of a blog', async () => {
    const blogsAtStart = await helper.blogsInDb()
    const blogToDelete = blogsAtStart[0]

    await api
        .delete(`/api/blogs/${blogToDelete.id}`)
        .expect(204)

    const blogsAtEnd = await helper.blogsInDb()
    expect(blogsAtEnd).toHaveLength(helper.initialBlogs.length - 1)

    const contents = blogsAtEnd.map(r => r.title)
    expect(contents).not.toContain(blogToDelete.title)
})

test('updating a blog', async () => {
    const blogsAtStart = await helper.blogsInDb()
    const blogToUpdate = blogsAtStart[0]

    const updatedBlog = {
        title: 'HTML is easy!!!',
        author: 'John Deer',
        url: 'http://www.google.com',
        likes: 10
    }

    await api
        .put(`/api/blogs/${blogToUpdate.id}`)
        .send(updatedBlog)
        .expect(200)

    const blogsAtEnd = await helper.blogsInDb()
    expect(blogsAtEnd).toHaveLength(helper.initialBlogs.length)

    const contents = blogsAtEnd.map(r => r.title)
    expect(contents).toContain(updatedBlog.title)
})

describe('ensure invalid users are not created'), () => {

    test('invalid username not added', async () => {
        const usersAtStart = await helper.usersInDb()

        const newUser = {
            username: '<3',
            name: 'John Deers',
            password: '122344'
        }

        await api
            .post('/api/users')
            .send(newUser)
            .expect(400)

        const usersAtEnd = await helper.usersInDb()
        expect(usersAtEnd).toHaveLength(usersAtStart.length)
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
