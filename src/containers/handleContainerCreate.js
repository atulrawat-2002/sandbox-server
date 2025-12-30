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
                `${import.meta.dirname}/../projects/${projectId}:/home/sandbox/app`
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

    } catch (error) {
        console.log("Error creating container", error)
    }
}