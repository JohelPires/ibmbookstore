const express = require('express')
const app = express()
const jwt = require('jsonwebtoken')
const bcrypt = require('bcrypt')
const database = require('./db/db')
const Book = require('./model/book')
const Comment = require('./model/comment')
const Author = require('./model/author')
const User = require('./model/user')
const { Op } = require('sequelize')

app.use(express.json())

app.get('/book/', (req, res) => {
    const isbn = req.query.isbn || ''
    const title = req.query.title || ''
    const author = req.query.author || ''
    console.log(typeof title, typeof isbn)
    if (isbn || title || author) {
        Book.findAll({
            where: {
                [Op.or]: [{ isbn: isbn }, { title: title }],
            },
        })
            .then((result) => {
                res.json(result)
            })
            .catch((err) => {
                res.json(err)
            })
    } else {
        Book.findAll()
            .then((result) => {
                res.json(result)
            })
            .catch((err) => {
                res.json(err)
            })
    }
})

// app.get('/book', (req, res))
app.post('/comment', (req, res) => {
    const { review, id_user, id_book, stars } = req.body
    if (review && id_user && id_book) {
        Comment.create({
            review: review,
            id_user: id_user,
            id_book: id_book,
            stars: stars,
        })
            .then((result) => {
                res.json(result)
            })
            .catch((err) => {
                res.json(err)
            })
    }
})
app.get('/comment/:id_book', (req, res) => {
    const { id_book } = req.params
    Comment.findAll({
        where: { id_book: id_book },
    })
        .then((result) => {
            res.json(result)
        })
        .catch((err) => {
            res.json(err)
        })
})

app.post('/book', (req, res) => {
    const { title, isbn, id_author, description } = req.body
    if (title && isbn && id_author) {
        Book.create({
            title: title,
            isbn: isbn,
            id_author: id_author,
            description: description ? description : null,
        })
            .then((result) => {
                res.json(result)
            })
            .catch((err) => {
                res.json(err)
            })
    } else {
        res.json('title, isbn and id_author are required.')
    }
})

app.post('/register', (req, res) => {
    const { name, email, password } = req.body
    if (name && email && password) {
        bcrypt.hash(password, 10, (err, hashedPassword) => {
            if (err) {
                res.status(500).json({ error: 'Internal server error' })
            } else {
                User.create({
                    name: name,
                    email: email,
                    password: hashedPassword,
                })
                    .then((result) => {
                        res.json(result)
                    })
                    .catch((err) => {
                        res.json(err)
                    })
            }
        })
    } else {
        res.json('name, email and password are required.')
    }
})

app.post('/author', (req, res) => {
    const { name } = req.body
    if (name) {
        Author.create({
            name: name,
        })
            .then((result) => {
                res.json(result)
            })
            .catch((err) => {
                res.json(err)
            })
    } else {
        res.json('name is required.')
    }
})
;(async () => {
    try {
        await database.sync({ alter: true })
        console.log('Banco de dados conectado e modelos sincronizados.')

        app.listen(5000, () => {
            console.log('Servidor iniciado na porta 5000.')
        })
    } catch (error) {
        console.error('Erro ao conectar-se ao banco de dados:', error)
    }
})()
