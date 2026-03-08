import { NextResponse } from "next/server"
import * as cheerio from "cheerio"

export async function POST(req: Request) {
  const { url } = await req.json()

  try {
    const res = await fetch(url)
    const html = await res.text()

    const $ = cheerio.load(html)

    const title =
      $('meta[property="og:title"]').attr("content") ||
      $("title").text()

    const image = $('meta[property="og:image"]').attr("content")

    return NextResponse.json({
      title,
      image,
    })
  } catch {
    return NextResponse.json({
      title: "",
      image: "",
    })
  }
}