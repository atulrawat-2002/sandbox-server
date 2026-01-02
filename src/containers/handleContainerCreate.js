import Docker from "dockerode";

const docker = new Docker();

export const handleContainerCreate = async (projectId, terminalSocket, req, tcpSocket, head) => {
  console.log("Project id recieved for container", projectId);

  try {
    
    terminalSocket.handleUpgrade(req, tcpSocket, head, async (establishedWSCnn) => {
          console.log("Inside the upgrading the connection")
          
    const container = await docker.createContainer({
      Image: "sandbox",
      AttachStdin: true,
      AttachStdout: true,
      AttachStderr: true,
      Cmd: ["/bin/bash"],
      Tty: true,
      User: "sandbox",
      ExposedPorts: {
        "5173/tcp": {},
      },
      ENV: ["HOST=0.0.0.0"],
      HostConfig: {
        Binds: [`${process.cwd()}/projects/${projectId}:/home/sandbox/app`],
        PortBindings: {
          "5173/tcp": [
            {
              HostPort: "0",
            },
          ],
        },
      },
    });

    console.log("container created", container.id);
    await container.start();

    terminalSocket.emit("connection", establishedWSCnn, req, container);

     })

    console.log("container start");

  } catch (error) {
    console.log("Error creating container", error);
  }
};
