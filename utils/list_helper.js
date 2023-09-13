const _ = require('lodash')

const dummy = (blogs) => {
    return 1
}

const totalLikes = (blogs) => {
    return blogs.reduce(
        (total, blogs) => {
            return total + blogs.likes
        }, 0)
}

const favPost = (blogs) => {
    return blogs.reduce(
        (fav, blogs) => {
            return fav.likes > blogs.likes 
            ? fav 
            : blogs
        }, {})
}

const mostBlogs = (blogs) => {
    return _
        .chain(blogs)
        .countBy('author')
        .map((blogs, author) => (
            { author, blogs }
        ))
        .maxBy('blogs')
        .value()
}

const mostLikes = (blogs) => {
    return _
    .chain(blogs)
    .groupBy('author')
    .map((blogs, author) => (
        { author, likes: _.sumBy(blogs, 'likes') }
    ))
    .maxBy('likes')
    .value()
}

module.exports = {
    dummy,
    totalLikes,
    favPost,
    mostBlogs,
    mostLikes,
}
