import express from 'express'
import { createPostController } from '../../controllers/projectController.js'

const router = express.Router()

router.post('/', createPostController)

export default router;