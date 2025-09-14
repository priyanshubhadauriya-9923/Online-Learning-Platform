// app/api/generate-course-layout/route.jsx
import { db } from "@/config/db";
import { coursesTable } from "@/config/schema";
import { auth, currentUser } from "@clerk/nextjs/server";
import { GoogleGenAI } from "@google/genai";
import axios from "axios";
import { NextResponse } from "next/server";
import { v4 as uuidv4 } from "uuid";
import { eq } from "drizzle-orm";

/**
 * Debug: set DEBUG=true as a Vercel environment variable while troubleshooting.
 * WARNING: turn DEBUG off in production after debugging to avoid leaking details.
 */
const DEBUG = process.env.DEBUG === "true";

const PROMPT = `
Generate a learning course based on the following details.
Return STRICT JSON only using this schema:
{
  "course": {
    "name": "string",
    "description": "string",
    "category": "string",
    "level": "string",
    "includeVideo": true|false,
    "noOfChapters": number,
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

/* -------------------- Helpers -------------------- */

function makeErrorResponse(step, message, extra = null, status = 500) {
  const body = { success: false, step, message };
  if (DEBUG && extra) body.details = extra;
  console.error(`[${step}]`, message, extra ?? "");
  return NextResponse.json(body, { status });
}

function safeJSONExtract(text) {
  if (!text || typeof text !== "string") return null;

  // strip common markdown code fences
  let cleaned = text.replace(/```json/gi, "").replace(/```/g, "").trim();

  // Try to match the first top-level JSON object/array
  const objMatch = cleaned.match(/({[\s\S]*})/);
  if (objMatch) {
    try {
      return JSON.parse(objMatch[0]);
    } catch (err) {
      // fall through to more permissive attempts
    }
  }

  // Attempt to find last '{' to last '}' region (avoid greedy mismatches)
  const start = cleaned.indexOf("{");
  const end = cleaned.lastIndexOf("}");
  if (start !== -1 && end !== -1 && end > start) {
    const candidate = cleaned.slice(start, end + 1);
    try {
      return JSON.parse(candidate);
    } catch (err) {
      // give up
    }
  }

  return null;
}

async function GenerateImage(imagePrompt) {
  if (!process.env.AI_GURU_LAB_API) {
    throw new Error("Missing AI_GURU_LAB_API env variable");
  }

  const BASE_URL = "https://aigurulab.tech";
  try {
    const resp = await axios.post(
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
          "x-api-key": process.env.AI_GURU_LAB_API,
          "Content-Type": "application/json",
        },
        timeout: 60_000, // 60s timeout for the image provider
      }
    );

    // provider returns base64 image or url in resp.data.image
    return resp.data?.image ?? null;
  } catch (err) {
    // Wrap the error so calling code can choose to continue or fail
    console.error("GenerateImage error:", err?.message ?? err);
    // include minimal info for debugging
    throw new Error(err?.response?.data?.message ?? err?.message ?? "Image generation failed");
  }
}

/* -------------------- API Handler -------------------- */

export async function POST(req) {
  try {
    // 1) Quick env check
    const missingEnv = [];
    if (!process.env.GEMINI_API_KEY) missingEnv.push("GEMINI_API_KEY");
    if (!process.env.AI_GURU_LAB_API) missingEnv.push("AI_GURU_LAB_API");
    if (missingEnv.length) {
      return makeErrorResponse("env", `Missing env vars: ${missingEnv.join(", ")}`, null, 500);
    }

    // 2) Auth
    const user = await currentUser();
    if (!user) return NextResponse.json({ success: false, message: "Unauthorized" }, { status: 401 });

    const userEmail =
      user?.primaryEmailAddress?.emailAddress ||
      user?.emailAddresses?.[0]?.emailAddress ||
      user?.email;

    if (!userEmail) {
      return makeErrorResponse("auth", "Logged-in user has no email address available", null, 400);
    }

    const { has } = await auth();
    const hasPremiumAccess = has({ plan: "starter" });

    // 3) Parse incoming body
    let body;
    try {
      body = await req.json();
    } catch (err) {
      return makeErrorResponse("parse_request", "Invalid JSON in request body", err?.message, 400);
    }

    const { courseId: incomingCid, ...formData } = body || {};
    console.log("Incoming formData preview:", Object.keys(formData));

    // 4) Free-plan limit check
    if (!hasPremiumAccess) {
      try {
        const existing = await db.select().from(coursesTable).where(eq(coursesTable.userEmail, userEmail));
        if (existing?.length >= 1) {
          return NextResponse.json({ success: false, resp: "limit exceed" }, { status: 403 });
        }
      } catch (err) {
        return makeErrorResponse("db_check", "Failed checking existing courses", err?.message);
      }
    }

    // 5) Call Gemini
    let ai;
    try {
      ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });
    } catch (err) {
      return makeErrorResponse("ai_init", "Failed to initialize AI client", err?.message);
    }

    let aiResponse;
    try {
      aiResponse = await ai.models.generateContent({
        model: "gemini-2.0-flash",
        config: { responseMimeType: "text/plain" },
        contents: [
          {
            role: "user",
            parts: [{ text: PROMPT + JSON.stringify(formData) }],
          },
        ],
      });
    } catch (err) {
      return makeErrorResponse("ai_call", "Gemini API call failed", err?.message ?? err, 502);
    }

    // 6) Extract JSON from AI response
    const rawText = aiResponse?.candidates?.[0]?.content?.parts?.[0]?.text ?? "";
    console.log("AI raw text snippet:", rawText?.slice(0, 300));
    const parsed = safeJSONExtract(rawText);
    if (!parsed) {
      // send back rawText snippet if DEBUG
      return makeErrorResponse(
        "ai_parse",
        "Could not extract valid JSON from AI response",
        DEBUG ? { rawText: rawText?.slice(0, 200) } : null,
        502
      );
    }

    // 7) Image generation (non-fatal; we'll continue if it fails)
    let bannerImageUrl = null;
    try {
      const imagePrompt = parsed?.course?.bannerImagePrompt || "Modern educational illustration";
      bannerImageUrl = await GenerateImage(imagePrompt);
    } catch (err) {
      // log but don't fail entire request - save with null banner and return a warning
      console.warn("Warning: banner image generation failed:", err?.message ?? err);
      // keep bannerImageUrl as null and record warning for response
    }

    // 8) Save to DB (stringify course JSON to avoid column type issues)
    const cid = incomingCid || uuidv4();
    try {
      await db.insert(coursesTable).values({
        ...formData,
        courseJson: JSON.stringify(parsed),
        userEmail,
        cid,
        bannerImageUrl,
      });
    } catch (err) {
      return makeErrorResponse("db_insert", "Failed to insert course into DB", err?.message ?? err);
    }

    // 9) Success
    const respBody = { success: true, courseId: cid, bannerImageUrl };
    if (!bannerImageUrl) respBody.warning = "Banner image generation failed or returned null";
    return NextResponse.json(respBody, { status: 201 });
  } catch (err) {
    // Catch-all error - include stack only when DEBUG
    return makeErrorResponse("unknown", "Unhandled server error", DEBUG ? err?.stack ?? err : null, 500);
  }
}
