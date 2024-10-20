import { NextResponse } from "next/server";
import fs from "fs";
import path from "path";

export async function POST(request: Request) {
  // Get the code from the request body
  const { code } = await request.json();

  // Define the file path where the code will be saved
  const filePath = path.join(process.cwd(), "generated", "scene", "play.ts");

  // Ensure the directory exists
  fs.mkdirSync(path.dirname(filePath), { recursive: true });

  // Write the code to the file
  fs.writeFileSync(filePath, code);

  return NextResponse.json({ message: "File generated successfully!" });
}
