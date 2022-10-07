import express from "express"
import multer from "multer"
import { extname } from "path"
import { saveUsersAvatars } from "../../lib/fs-tools.js"

const filesRouter = express.Router()

filesRouter.post(
  "/:userId/avatar",
  multer({ limits: { fileSize: 1024 * 1024 } }).single("avatar"),
  async (req, res, next) => {
    // "avatar" needs to match precisely the name of the field appended in the FormData object coming from the FE.
    // If they don't match, multer is not going to find that file
    try {
      console.log("FILE --> ", req.file)

      // Find the user by userId ("36k8a8w0l8vgogor") in users.json
      // save the file as /public/img/users/36k8a8w0l8vgogor.gif
      // Update that user by adding the path to reach the image, like "avatar": "/public/img/users/36k8a8w0l8vgogor.gif"
      // This is going to give the FE the possibility to display the image later on in an <img src="http://localhost:3001/public/img/users/36k8a8w0l8vgogor.gif" />
      const fileName = req.params.userId + extname(req.file.originalname)
      await saveUsersAvatars(fileName, req.file.buffer)
      res.send({ message: "FILE UPLOADED!" })
    } catch (error) {
      next(error)
    }
  }
)

filesRouter.post(
  "/multiple",
  multer().array("avatars"),
  async (req, res, next) => {
    try {
      console.log("FILE --> ", req.files)
      const arrayOfPromises = req.files.map(file =>
        saveUsersAvatars(file.originalname, file.buffer)
      )
      await Promise.all(arrayOfPromises)
      res.send({ message: "FILES UPLOADED!" })
    } catch (error) {
      next(error)
    }
  }
)

export default filesRouter
