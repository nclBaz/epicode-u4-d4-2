//const express = require("express") <-- OLD SYNTAX (we don't want to use old stuff)
import express from "express" // NEW SYNTAX (you can use this only if type:"module" is added on package.json)
import listEndpoints from "express-list-endpoints"
import cors from "cors"
import createHttpError from "http-errors"
import { join } from "path"
import usersRouter from "./api/users/index.js"
import booksRouter from "./api/books/index.js"
import filesRouter from "./api/files/index.js"
import {
  badRequestHandler,
  genericErrorHandler,
  notFoundHandler,
  unauthorizedHandler,
} from "./errorHandlers.js"

const server = express()
const port = 3001
const publicFolderPath = join(process.cwd(), "./public")

// *************************************** MIDDLEWARES *************************************

/* const { Unauthorized } = createHttpError

const loggerMiddleware = (req, res, next) => {
  console.log(
    `Request method: ${req.method} -- request url: ${req.url} -- ${new Date()}`
  )
  req.user = "Riccardo"
  next()
}

const policeOfficer = (req, res, next) => {
  if (req.user === "Riccardo") {
    next(Unauthorized("Riccardos are not allowed!"))
  } else {
    next()
  }
}

server.use(loggerMiddleware)
server.use(policeOfficer) */
server.use(express.static(publicFolderPath))
server.use(cors())
server.use(express.json()) // If you don't add this line BEFORE the endpoints, all requests' bodies will be UNDEFINED

// ************************************* ENDPOINTS ******************************************
server.use("/users", usersRouter) // /users will be the prefix that all the endpoints in the usersRouter will have
server.use("/books", booksRouter)
server.use("/files", filesRouter)
// ********************************** ERROR HANDLERS ****************************************

server.use(badRequestHandler)
server.use(unauthorizedHandler)
server.use(notFoundHandler)
server.use(genericErrorHandler)

server.listen(port, () => {
  console.table(listEndpoints(server))
  console.log(`Server is running on port ${port}`)
})
