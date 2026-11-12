import { NextResponse } from "next/server";

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);

    const lesson = searchParams.get("lesson");
    const course = searchParams.get("course");
    const difficulty = searchParams.get("difficulty");

    if (!lesson) {
      return NextResponse.json(
        { error: "Lesson title is required" },
        { status: 400 }
      );
    }

    const apiKey = process.env.YOUTUBE_API_KEY;

    if (!apiKey) {
      return NextResponse.json(
        { error: "YouTube API key is not configured" },
        { status: 500 }
      );
    }

    const searchQuery = `${lesson} ${course || ""} tutorial ${difficulty || ""}`;

    const url = new URL(
      "https://www.googleapis.com/youtube/v3/search"
    );

    url.searchParams.set("part", "snippet");
    url.searchParams.set("q", searchQuery);
    url.searchParams.set("key", apiKey);
    url.searchParams.set("type", "video");
    url.searchParams.set("maxResults", "1");
    url.searchParams.set("videoEmbeddable", "true");
    url.searchParams.set("safeSearch", "strict");

    const response = await fetch(url.toString());

    if (!response.ok) {
      const errorText = await response.text();

      console.error("YouTube API error:", errorText);

      return NextResponse.json(
        { error: "YouTube search failed" },
        { status: 500 }
      );
    }

    const data = await response.json();

    const item = data.items?.[0];

    if (!item?.id?.videoId) {
      return NextResponse.json({
        videoId: null,
        title: null,
      });
    }

    return NextResponse.json({
      videoId: item.id.videoId,
      title: item.snippet?.title || "",
    });
  } catch (error: any) {
    console.error("YouTube route error:", error);

    return NextResponse.json(
      {
        error: error?.message || "Something went wrong",
      },
      { status: 500 }
    );
  }
}