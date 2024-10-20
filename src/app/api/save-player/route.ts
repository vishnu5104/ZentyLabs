// src/app/api/save-cube/route.js

import { NextResponse } from "next/server";
import fs from "fs";
import path from "path";

export async function POST(req) {
  const cubeData = await req.json();

  // Specify the path to save the JSON file
  const filePath = path.join(process.cwd(), "cubeData.json");

  try {
    // Save cube data to JSON file
    fs.writeFileSync(filePath, JSON.stringify(cubeData, null, 2));
    return NextResponse.json({ message: "Cube data saved successfully." });
  } catch (error) {
    return NextResponse.json(
      { message: "Failed to save cube data." },
      { status: 500 }
    );
  }
}
