// app/api/generate-course/route.js

import { db } from "@/config/db";
import { coursesTable } from "@/config/schema";
import { auth, currentUser } from "@clerk/nextjs/server";
import { GoogleGenAI } from "@google/genai";
import axios from "axios";
import { NextResponse } from "next/server";
import { v4 as uuidv4 } from "uuid";
import { eq } from "drizzle-orm";

// ------------------ PROMPT ------------------
const PROMPT = `
Generate a learning course based on the following details. 
Make sure to add:
- Course Name
- Description
- Category
- Level
- Include Video (boolean)
- Number of Chapters
- Course Banner Image Prompt
- Chapters with Name, Duration, Topics
Output in strict JSON format:
{
  "course": {
    "name": "string",
    "description": "string",
    "category": "string",
    "level": "string",
    "includeVideo": "boolean",
    "noOfChapters": "number",
    "bannerImagePrompt": "string",
    "chapters": [
      {
        "chapterName": "string",
        "duration": "string",
        "topics": ["string"]
      }
    ]
  }
}
User Input:
`;

// ------------------ AI INIT ------------------
const ai = new GoogleGenAI({
  apiKey: process.env.GEMINI_API_KEY,
});

// ------------------ HELPERS ------------------
async function GenerateImage(imagePrompt) {
  try {
    const BASE_URL = "https://aigurulab.tech";

    const result = await axios.post(
      `${BASE_URL}/api/generate-image`,
      {
        width: 1024,
        height: 1024,
        input: imagePrompt,
        model: "flux",
        aspectRatio: "16:9",
      },
      {
        headers: {
          "x-api-key": process?.env?.AI_GURU_LAB_API,
          "Content-Type": "application/json",
        },
      }
    );

    console.log("🔹 Image generated successfully");
    return result.data.image;
  } catch (error) {
    console.error("❌ Image generation failed:", error.message);
    return null;
  }
}

function extractJSON(text) {
  try {
    if (!text) return null;

    // Remove Markdown code blocks if present
    let cleaned = text
      .replace(/```json/i, "")
      .replace(/```/g, "")
      .trim();

    // Find first JSON object in the text
    const match = cleaned.match(/{[\s\S]*}/);
    if (match) {
      return JSON.parse(match[0]);
    }
    return null;
  } catch (error) {
    console.error("❌ JSON parse failed:", error.message);
    return null;
  }
}

// ------------------ API HANDLER ------------------
export async function POST(req) {
  try {
    // 🔹 Step 1: Auth
    const user = await currentUser();
    if (!user) {
      return NextResponse.json(
        { message: "Unauthorized" },
        { status: 401 }
      );
    }

    const { has } = await auth();
    const hasPremiumAccess = has({ plan: "starter" });

    // 🔹 Step 2: Parse request body
    const { courseId, ...formData } = await req.json();
    console.log("🔹 Incoming data:", formData);

    // 🔹 Step 3: Check free plan course limit
    if (!hasPremiumAccess) {
      const existing = await db
        .select()
        .from(coursesTable)
        .where(eq(coursesTable.userEmail, user?.primaryEmailAddress.emailAddress));

      if (existing?.length >= 1) {
        return NextResponse.json({ resp: "limit exceed" }, { status: 403 });
      }
    }

    // 🔹 Step 4: Call Gemini
    const response = await ai.models.generateContent({
      model: "gemini-2.0-flash",
      config: { responseMimeType: "text/plain" },
      contents: [
        {
          role: "user",
          parts: [{ text: PROMPT + JSON.stringify(formData) }],
        },
      ],
    });

    const rawText = response?.candidates?.[0]?.content?.parts?.[0]?.text;
    console.log("🔹 Gemini raw output:", rawText?.slice(0, 200) + "...");

    const JSONResp = extractJSON(rawText);
    if (!JSONResp) {
      throw new Error("Gemini did not return valid JSON");
    }

    // 🔹 Step 5: Generate Banner Image
    const imagePrompt = JSONResp.course?.bannerImagePrompt || "Modern educational illustration";
    const bannerImageUrl = await GenerateImage(imagePrompt);

    // 🔹 Step 6: Save to DB
    await db.insert(coursesTable).values({
      ...formData,
      courseJson: JSONResp,
      userEmail: user?.primaryEmailAddress?.emailAddress,
      cid: courseId || uuidv4(),
      bannerImageUrl,
    });

    console.log("✅ Course saved successfully");

    return NextResponse.json({ courseId });
  } catch (error) {
    console.error("❌ API ERROR in generate-course:", error);
    return NextResponse.json(
      { message: "Internal Server Error", error: error.message },
      { status: 500 }
    );
  }
}
