import { v4 as uuid } from 'uuid'
import fs from 'fs/promises'
import child_process from 'child_process'
import util from 'util'
import { REACT_PROJECT_COMMAND } from '../config/serverConfig.js'
const execpromisified = util.promisify(child_process.exec);


export const projectService = async () => {
    const projectid = uuid()
    console.log(projectid)

   fs.mkdir(`./projects/${projectid}`)

    const response = await execpromisified(`${REACT_PROJECT_COMMAND}`, {
        cwd: `./projects/${projectid}`
    })

    return response;
}