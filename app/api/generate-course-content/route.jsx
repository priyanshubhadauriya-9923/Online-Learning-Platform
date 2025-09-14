import { NextResponse } from "next/server";
import { GoogleGenAI } from "@google/genai";
import axios from "axios";
import { db } from "@/config/db";
import { coursesTable } from "@/config/schema";
import { eq } from "drizzle-orm";

const ai = new GoogleGenAI({
  apiKey: process.env.GEMINI_API_KEY,
});

const PROMPT = `
Depends on Chapter name and Topic Generate content for each topic in HTML and give response in JSON format.
Schema:{ 
chapterName: string,
topics: [
  {
    topic: string,
    content: string
  }
]
}
User Input:
`;

export async function POST(req) {
  try {
    const { courseJson, courseTitle, courseId } = await req.json();

    const promises = courseJson?.chapters?.map(async (chapter) => {
      const config = { responseMimeType: "text/plain" };
      const model = "gemini-2.0-flash";
      const contents = [
        {
          role: "user",
          parts: [{ text: PROMPT + JSON.stringify(chapter) }],
        },
      ];

      const response = await ai.models.generateContent({ model, config, contents });
      const RawResp = response.candidates?.[0]?.content?.parts?.[0]?.text || "";

      let JSONResp;
      try {
        const RawJson = RawResp.replace(/```json/g, "").replace(/```/g, "").trim();
        JSONResp = JSON.parse(RawJson);
      } catch (err) {
        console.error("❌ JSON parse failed", RawResp);
        throw new Error("AI response invalid JSON");
      }

      // Get Youtube Videos
      const youtubeData = await GetYoutubeVideo(chapter?.chapterName);

      return {
        youtubeVideo: youtubeData,
        courseData: JSONResp,
      };
    });

    const CourseContent = await Promise.all(promises);

    // Save to DB
    await db
      .update(coursesTable)
      .set({ courseContent: JSON.stringify(CourseContent) })
      .where(eq(coursesTable.cid, courseId));

    return NextResponse.json({
      success: true,
      courseName: courseTitle,
      CourseContent,
    });
  } catch (err) {
    console.error("❌ API ERROR in generate-course-content:", err);
    return NextResponse.json(
      { success: false, error: err.message ?? "Unknown error" },
      { status: 500 }
    );
  }
}

const YOUTUBE_BASE_URL = "https://www.googleapis.com/youtube/v3/search";

const GetYoutubeVideo = async (topic) => {
  try {
    const params = {
      part: "snippet",
      q: topic,
      maxResults: 4, // ✅ FIXED
      type: "video",
      key: process.env.YOUTUBE_API_KEY,
    };

    const resp = await axios.get(YOUTUBE_BASE_URL, { params });
    return resp.data.items?.map((item) => ({
      videoId: item.id?.videoId,
      title: item?.snippet?.title,
    }));
  } catch (err) {
    console.error("❌ YouTube API failed", err.response?.data || err.message);
    return [];
  }
};
