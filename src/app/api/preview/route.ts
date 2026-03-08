import { NextResponse } from "next/server"
import ogs from "open-graph-scraper"

export async function POST(req: Request) {
  try {
    const { url } = await req.json()

    if (!url) {
      return NextResponse.json({ error: "No URL" }, { status: 400 })
    }

    const { result } = await ogs({ url })

    return NextResponse.json({
      title: result.ogTitle || "",
      image: result.ogImage?.[0]?.url || ""
    })
  } catch (error) {
    console.error(error)

    return NextResponse.json(
      { error: "Preview failed" },
      { status: 500 }
    )
  }
}