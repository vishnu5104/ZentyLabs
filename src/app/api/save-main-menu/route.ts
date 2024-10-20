import { NextResponse } from 'next/server';
import { promises as fs } from 'fs'; // Use promises API for async file operations
import path from 'path'; // To handle file paths

export async function POST(request: Request) {
  try {
    // Paths
    const body = await request.json();
    const { title, buttons, wallet } = body;
    const gamebuilderDir = path.join(process.cwd(), 'src', 'app', 'gamebuilder'); // gamebuilder directory
    const copydir = path.join(process.cwd(), 'src', 'app'); // gamebuilder directory
    const scenesDir = path.join(gamebuilderDir, 'scenes'); // scenes folder inside gamebuilder
    const copiesDir = path.join(copydir, 'cubegame'); // new directory for copied files
    const copiedScenesDir = path.join(copiesDir, 'scenes'); // new scenes folder inside gamebuildercopy

    // Ensure the target directories exist
    await fs.mkdir(copiesDir, { recursive: true });
    await fs.mkdir(copiedScenesDir, { recursive: true });

    // 1. Copy files from the `scenes` directory to the new `scenes` folder inside `gamebuildercopy`
    const sceneFiles = await fs.readdir(scenesDir);
    for (const file of sceneFiles) {
      const originalFilePath = path.join(scenesDir, file);
      let fileContents = await fs.readFile(originalFilePath, 'utf8'); // Read the contents of the original file

      // If the file is 'Mainmenu.ts', modify the playButton event handler
      if (file === 'Mainmenu.ts') {

        
        // Find and replace the playButton click handler logic
        fileContents = fileContents.replace(
          /this\.playButton\.on\("pointerdown", \(\) => {[^}]*}\);/g,
          `
          const wallet = "${wallet}"
          this.playButton.on("pointerdown", () => {
            if (this.walletAddress.toLowerCase().startsWith("0x0c467c60e97221de6cd9".toLowerCase()) {
              this.scene.start("PlayScene");
            } else {
              console.log('not connected');
            }
          });
          `
        );

        // Append a console log at the end (if required)
        fileContents += '\nconsole.log("hi");';
      }

      // Create a new filename without altering the extension
      const newFileName = `${path.basename(file, path.extname(file))}${path.extname(file)}`;

      const newFilePath = path.join(copiedScenesDir, newFileName); // Path for the new file in copied scenes folder
      await fs.writeFile(newFilePath, fileContents, 'utf8'); // Write file contents
    }

    // 2. Copy files from the `gamebuilder` directory (excluding the `scenes` folder) to `gamebuildercopy`
    const gamebuilderFiles = await fs.readdir(gamebuilderDir);
    for (const file of gamebuilderFiles) {
      const originalFilePath = path.join(gamebuilderDir, file);

      // Skip the `scenes` folder
      if (file === 'scenes') continue;

      const stats = await fs.lstat(originalFilePath);
      if (stats.isFile()) {
        let fileContents = await fs.readFile(originalFilePath, 'utf8'); // Read the contents of the file

        // Create a new filename without altering the extension
        const newFileName = `${path.basename(file, path.extname(file))}${path.extname(file)}`;

        const newFilePath = path.join(copiesDir, newFileName); // Path for the new file in the main copies folder
        await fs.writeFile(newFilePath, fileContents, 'utf8'); // Write file contents
      }
    }

    return NextResponse.json({ message: 'Files copied successfully, with Mainmenu.ts modified' }, { status: 200 });
  } catch (error) {
    console.error('Error copying files:', error);
    return NextResponse.json({ message: 'Error copying files', error }, { status: 500 });
  }
}
