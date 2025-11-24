import { projectService } from "../service/projectService.js"


export const createPostController = async (req, res) => {

    const response = projectService()

    res.json({ "message": response })

}