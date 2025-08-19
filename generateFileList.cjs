const fs = require("fs");
const path = require("path");

const dataDir = path.join(__dirname, "public/data");

function getFilesBySubfolder(dir) {
  const result = {};

  // Read the contents of the directory
  const items = fs.readdirSync(dir, { withFileTypes: true });

  items.forEach((item) => {
    const itemPath = path.join(dir, item.name);

    if (item.isDirectory()) {
      // Recursively get files in subfolders
      result[item.name] = getFilesBySubfolder(itemPath);
    } else if (item.isFile() && item.name.endsWith(".json")) {
      // Add JSON files to the result
      const folderName = path.basename(dir);
      if (!result[folderName]) {
        result[folderName] = [];
      }
      result[folderName].push(item.name);
    }
  });

  return result;
}

function generateFileList() {
  try {
    const subfolders = fs
      .readdirSync(dataDir, { withFileTypes: true })
      .filter((item) => item.isDirectory());

    subfolders.forEach((subfolder) => {
      const subfolderPath = path.join(dataDir, subfolder.name);
      const files = fs
        .readdirSync(subfolderPath)
        .filter((file) => file.endsWith(".json"));

      const outputFile = path.join(subfolderPath, `.${subfolder.name}.json`);
      fs.writeFileSync(outputFile, JSON.stringify(files, null, 2));
      console.log(
        `File list for '${subfolder.name}' generated successfully at ${outputFile}`
      );
    });
  } catch (error) {
    console.error("Error generating file lists:", error);
  }
}

generateFileList();
