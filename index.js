const { log } = require("console");
const fs = require("fs/promises");

const nav = `<nav class="navbar navbar-light bg-light justify-content-between">
                  <a class="navbar-brand">Navbar</a>
                  <form class="form-inline">
                    <input class="form-control mr-sm-2" type="search" placeholder="Search" aria-label="Search">
                    <button class="btn btn-outline-success" type="submit">Search</button>
                  </form>
                </nav>`;

const footer = `<footer class="row row-cols-1 row-cols-sm-2 row-cols-md-5 py-5 my-5 border-top">
      <div class="col mb-3">
        <a href="/" class="d-flex align-items-center mb-3 link-body-emphasis text-decoration-none">
          <svg class="bi me-2" width="40" height="32">
            <use xlink:href="#bootstrap"></use>
          </svg>
        </a>
        <p class="text-body-secondary">© 2024</p>
      </div>
      <!-- Additional Footer Sections Here -->
    </footer>`;

const appendToHtml = async (path, file, content) => {
  if (!file.includes(content)) {
    try {
      const updatedHTML = file.replace("</body>", `${content}\n</body>`);
      await fs.writeFile(path, updatedHTML, "utf-8");
      log("Content appended successfully.");
    } catch (error) {
      log("Error appending content:", error);
    }
  } else {
    log("Content already exists in the file.");
  }
};

const removeFromHtml = async (path, file, contentToRemove) => {
  try {
    if (file.includes(contentToRemove)) {
      const updatedHTML = file.replace(contentToRemove, "");
      await fs.writeFile(path, updatedHTML, "utf-8");
      log("Content removed successfully.");
    } else {
      log("Content not found in the file.");
    }
  } catch (error) {
    log("Error removing content:", error);
  }
};

const createFile = async (name) => {
  try {
    await fs.access(`./${name}`);
    log("File already exists.");
  } catch {
    const initialHtml = `<!doctype html>
<html lang="en">
  <head>
    <meta charset="utf-8">
    <meta name="viewport" content="width=device-width, initial-scale=1, shrink-to-fit=no">
    <link rel="stylesheet" href="https://cdn.jsdelivr.net/npm/bootstrap@4.0.0/dist/css/bootstrap.min.css" crossorigin="anonymous">
    <title>Hello, world!</title>
  </head>
  <body>
    <h1>Hello, world!</h1>
  </body>
</html>`;
    await fs.writeFile(`./${name}`, initialHtml, "utf-8");
    log("File created successfully.");
  }
};

(async () => {
  console.log("ami file open korbo");
  try {
    const myfilework = await fs.open("./command.txt", "r");

    myfilework.on("change", async function () {
      //   let salt = await myfilework.stat();
      let size = (await myfilework.stat()).size;
      let buf = Buffer.alloc(size);
      let offset = 0;
      let length = buf.byteLength;
      let position = 0;

      await myfilework.read(buf, offset, length, position);

      const commandText = buf.toString("utf-8");

      const commands = commandText.split(" ");

      console.log(commands);
      if (commands[0] !== "bp") {
        console.log("invalid command !");
      } else {
        const action = commands[1];
        const fileName = commands[2];
        const contentType =
          commands[3] === "nav" ? nav : commands[3] === "footer" ? footer : "";
        if (action === "create") {
          await createFile(fileName);
        } else if (contentType) {
          const file = await fs.readFile(`./${fileName}`, "utf-8");

          if (action === "append") {
            await appendToHtml(`./${fileName}`, file, contentType);
          } else if (action === "remove") {
            await removeFromHtml(`./${fileName}`, file, contentType);
          } else {
            console.log("Invalid action specified.");
          }
        }
      }
    });

    const commandWatch = fs.watch("./command.txt");

    for await (let e of commandWatch) {
      console.log(e);
      if (e.eventType === "change") {
        myfilework.emit("change");
      }
    }
  } catch (error) {}
})();
