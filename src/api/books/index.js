// ******************************************** BOOKS RELATED ENDPOINTS *****************************

// *********************************************** BOOKS CRUD ***************************************

/*

1. CREATE --> POST http://localhost:3001/books/ (+ body)
2. READ --> GET http://localhost:3001/books/ (+ optional query parameters)
3. READ (single user) --> GET http://localhost:3001/books/:bookId
4. UPDATE (single user) --> PUT http://localhost:3001/books/:bookId (+ body)
5. DELETE (single user) --> DELETE http://localhost:3001/books/:bookId

*/

import express from "express"
import { fileURLToPath } from "url"
import { dirname, join } from "path"
import uniqid from "uniqid"
import fs from "fs"
import createHttpError from "http-errors"
import { checkBooksSchema, checkValidationResult } from "./validator.js"

const { BadRequest, NotFound } = createHttpError

const booksRouter = express.Router()

const booksJSONPath = join(
  dirname(fileURLToPath(import.meta.url)),
  "books.json"
)

const getBooks = () => JSON.parse(fs.readFileSync(booksJSONPath))
const writeBooks = booksArray =>
  fs.writeFileSync(booksJSONPath, JSON.stringify(booksArray))

const anotherStupidMiddleware = (req, res, next) => {
  console.log("Hey I am the stupid middleware")
  next()
}

booksRouter.post(
  "/",
  checkBooksSchema,
  checkValidationResult,
  (req, res, next) => {
    try {
      const newBook = { ...req.body, createdAt: new Date(), id: uniqid() }

      const books = getBooks()

      books.push(newBook)

      writeBooks(books)

      res.status(201).send({ id: newBook.id })
    } catch (error) {
      next(error)
    }
  }
)

booksRouter.get("/", anotherStupidMiddleware, (req, res, next) => {
  try {
    // throw new Error("KABOOOOOOOOOOOOOOOOOOOOOOOOM!")
    const books = getBooks()

    if (req.query && req.query.category) {
      const filteredBooks = books.filter(
        book => book.category === req.query.category
      )
      res.send(filteredBooks)
    } else {
      res.send(books)
    }
  } catch (error) {
    next(error) // This line here is going to send the error to the first error handler used in server.js
  }
})

booksRouter.get("/:bookId", (req, res, next) => {
  try {
    const books = getBooks()
    const foundBook = books.find(book => book.id === req.params.bookId)
    if (foundBook) {
      res.send(foundBook)
    } else {
      // next(createHttpError(404, `Book with id ${req.params.bookId} not found!`))
      next(NotFound(`Book with id ${req.params.bookId} not found!`))
      // this is going to create an error with status code 404 and a message and it is going to send it to the first error handler
      /*  res
        .status(404)
        .send({ message: `Book with id ${req.params.bookId} not found!` }) */
    }
  } catch (error) {
    next(error)
  }
})

booksRouter.put("/:bookId", (req, res, next) => {
  try {
    const books = getBooks()

    const index = books.findIndex(book => book.id === req.params.bookId)

    if (index !== -1) {
      const oldBook = books[index]

      const updatedBook = { ...oldBook, ...req.body, updatedAt: new Date() }
      books[index] = updatedBook

      writeBooks(books)

      res.send(updatedBook)
    } else {
      next(createHttpError(404, `Book with id ${req.params.bookId} not found!`))
      // next(NotFound, `Book with id ${req.params.bookId} not found!`)
    }
  } catch (error) {
    next(error)
  }
})

booksRouter.delete("/:bookId", (req, res, next) => {
  try {
    const books = getBooks()

    const remaingBooks = books.filter(book => book.id !== req.params.bookId)

    if (books.length !== remaingBooks.length) {
      writeBooks(remaingBooks)

      res.status(204).send()
    } else {
      next(createHttpError(404, `Book with id ${req.params.bookId} not found!`))
      // next(NotFound, `Book with id ${req.params.bookId} not found!`)
    }
  } catch (error) {
    next(error)
  }
})

export default booksRouter
