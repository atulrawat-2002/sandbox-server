import { v4 as uuid } from 'uuid'
import fs from 'fs/promises'
import { REACT_PROJECT_COMMAND } from '../config/serverConfig.js'
import { execPromisify } from '../utils/execUtility.js'
import path from 'path';
import directoryTree from 'directory-tree';

export const createProjectService = async () => {
    const projectId = uuid()
    console.log(projectId)

   fs.mkdir(`./projects/${projectId}`)

    const response = await execPromisify(`${REACT_PROJECT_COMMAND}`, {
        cwd: `./projects/${projectId}`
    })

    return projectId;
}

export const getProjectTreeService = (projectId) => {
    const projectPath = path.resolve(`./projects/${projectId}`);
    const tree = directoryTree(projectPath)
    return tree;
}