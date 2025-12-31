import Docker from 'dockerode';

const docker = new Docker();

export const handleContainerCreate = async (projectId, socket) => {
    console.log("Project id recieved for container", projectId);
    
    try {
        const container = await docker.createContainer({
        Image: 'sandbox',
        AttachStdin: true,
        AttachStdout: true,
        AttachStderr: true,
        Cmd: ['/bin/bash'],
        Tty: true,
        User: 'sandbox',
        HostConfig: {
            Binds: [
                `${process.cwd()}/projects/${projectId}:/home/sandbox/app`
            ],
            PortBindings: {
                "5173/tcp": [
                    {
                        "HostPort": "0"
                    }
                ]
            },
            ExposedPorts: {
                "5173/tcp": {}
            },
            ENV: ["HOST=0.0.0.0"]
        }
    })

    console.log("container created", container.id)

    await container.start();

    console.log("container start")

    container.exec({
        Cmd: ["/bin/bash"],
        User: 'sandbox',
        AttachStdin: true,
        AttachStdout: true,
        AttachStderr: true,
    }, (err, exec) => {
        if (err){
            console.log("Error while creating the exec", err)
            return;
        }
        exec.start( { hijack: true }, (err, stream) => {
            if (err) {
                console.log("Error while starting the exec", err)
                return;
            }

            processStream(stream, socket);
            socket.on('shell-input', (data) => {
                stream.write("ls\n", (err) => {
                    if (err) {
                        console.log("Error while writing to the stream", err)
                    } else {
                        console.log("Writing to the stream")
                    }
                });
            })

        } )
    })

    } catch (error) {
        console.log("Error creating container", error)
    }
}


function processStream(stream, socket) {
    let buffer = Buffer.from("");

    stream.on("data", (data) => {
        buffer = Buffer.concat([data, buffer]);
        socket.emit("shell-output", buffer.toString());
        buffer = Buffer.from("");
    })

    stream.on("end", () => {
        console.log("Stream ended");
        socket.emit("shell-output", "Stream Ended");
    })

    stream.on("error", (err) => {
        console.log("Stream Error", err);
        socket.emit("shell-output", "Stream Error");
    })
}