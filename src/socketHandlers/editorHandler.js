import fs from 'fs/promises';

export function handleEditorSocketEvents (socket, editorNameSpace) {    
    
    socket.on("writeFile", async ({data, pathToFileOrFolder}) => {
        
        try {
            const response = await fs.writeFile(pathToFileOrFolder, data)
            editorNameSpace.emit("writeFileSuccess", {
                data: "File written successfull",
                path: pathToFileOrFolder
            })
        } catch (error) {
            console.log("An error occured", error)
            socket.emit("error", {
                data: "Error writing the file"
            })
        }
    })

    socket.on("createFile", async ({pathToFileOrFolder}) => {
        const isFilePresent = await fs.stat(pathToFileOrFolder)
        
        if(isFilePresent) {
            socket.emit("error", {
                data: "File already exists"
            })
            return;
        }

        try {
            const response = await fs.writeFile(pathToFileOrFolder, "")
            socket.emit("createFileSuccess", {
                data: "File created successfully"
            })
        } catch (error) {
            socket.on("error", {
                data: "Error creating file"
            })
        }
    })

    socket.on("readFile", async ({pathToFileOrFolder}) => {
        try {
            const response = await fs.readFile(pathToFileOrFolder, { encoding: 'utf-8' })
            socket.emit("readFileSuccess", {
                value: response.toString(),
                path: pathToFileOrFolder
            })
        } catch (error) {
            socket.emit("error", {
                data: "Error reading file"
            })
        }
    })

    socket.on("deleteFile", async ({pathToFileOrFolder}) => {
        try {
            const response = await fs.unlink(pathToFileOrFolder)
            socket.on("deleteFileSuccess", {
                data: "File deleted"
            })
        } catch (error) {
            socket.emit("error", {
                data: "Error deleting the file"
            })
        }
    })

    socket.on("createFolder", async ({pathToFileOrFolder}) => {
        try {
            const response = await fs.mkdir(pathToFileOrFolder);
            socket.emit("createFolderSuccess", {
                data: "Folder created successfully"
            })
        } catch (error) {
            socket.emit("error", {
                data: "Error creating folder"
            })
        }
    })

    socket.on("deleteFolder", async ({pathToFileOrFolder}) => {
        try {
            const response = await fs.rmdir(pathToFileOrFolder, { recursive: true });
            socket.emit("deleteFolderSuccess", {
                data: "Folder deleted successfully"
            })
        } catch (error) {
            socket.emit("error", {
                data: "Error deleting tht folder"
            })
        }
    })
}