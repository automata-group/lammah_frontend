import { NextRequest, NextResponse } from "next/server";

// SSRF Protection: Restrict allowed hosts strictly to legitimate Pinterest domains
const ALLOWED_HOSTS = [
  "pinimg.com",
  "pinterest.com",
  "pin.it",
];

function isAllowedHost(hostname: string): boolean {
  const lower = hostname.toLowerCase();
  
  // Reject localhost, loopback, private IPs, and internal docker service names
  if (
    lower === "localhost" ||
    lower === "127.0.0.1" ||
    lower === "0.0.0.0" ||
    lower === "::1" ||
    lower === "backend" ||
    lower === "warp" ||
    lower === "caddy" ||
    lower === "db" ||
    lower.startsWith("10.") ||
    lower.startsWith("192.168.") ||
    lower.startsWith("169.254.") || // AWS/cloud metadata
    /^172\.(1[6-9]|2[0-9]|3[0-1])\./.test(lower)
  ) {
    return false;
  }

  return ALLOWED_HOSTS.some(
    (allowed) => lower === allowed || lower.endsWith(`.${allowed}`)
  );
}

export async function GET(req: NextRequest) {
  let url = req.nextUrl.searchParams.get("url");
  if (!url) {
    return new NextResponse("Missing url parameter", { status: 400 });
  }

  try {
    let parsedUrl: URL;
    try {
      parsedUrl = new URL(url);
    } catch {
      return new NextResponse("Invalid URL format", { status: 400 });
    }

    if (!["http:", "https:"].includes(parsedUrl.protocol)) {
      return new NextResponse("Invalid protocol", { status: 400 });
    }

    if (!isAllowedHost(parsedUrl.hostname)) {
      return new NextResponse("Forbidden host", { status: 403 });
    }

    // 1. If it's a Pinterest pin page or pin.it link, resolve the actual image URL first
    if (parsedUrl.hostname.includes("pinterest.") || parsedUrl.hostname.includes("pin.it")) {
      try {
        const pageRes = await fetch(url, {
          headers: {
            "User-Agent":
              "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36",
            Accept: "text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8",
          },
          redirect: "follow",
        });
        const html = await pageRes.text();

        // Look for og:image, twitter:image, or link rel="image_src"
        const metaMatch =
          html.match(/<meta\s+(?:property|name)=["'](?:og:image|twitter:image)["']\s+content=["']([^"']+)["']/i) ||
          html.match(/<meta\s+content=["']([^"']+)["']\s+(?:property|name)=["'](?:og:image|twitter:image)["']/i) ||
          html.match(/<link\s+rel=["']image_src["']\s+href=["']([^"']+)["']/i);

        if (metaMatch && metaMatch[1]) {
          url = metaMatch[1].replace(/&amp;/g, "&");
          url = url.replace(/\/(?:236x|474x|564x)\//, "/736x/");
        } else {
          // Look for any i.pinimg.com image in the HTML with exact extension
          const pinImgMatch = html.match(
            /https:\/\/i\.pinimg\.com\/(?:originals|736x|564x|474x|236x)\/[a-zA-Z0-9_\/\.\-]+(?:\.jpg|\.jpeg|\.png|\.webp)/i
          );
          if (pinImgMatch && pinImgMatch[0]) {
            url = pinImgMatch[0].replace(/\/(?:236x|474x|564x)\//, "/736x/");
          } else {
            // Fallback: search any i.pinimg.com image
            const anyPin = html.match(
              /https:\/\/i\.pinimg\.com\/[a-zA-Z0-9_\/\.\-]+(?:\.jpg|\.jpeg|\.png|\.webp)/i
            );
            if (anyPin && anyPin[0]) {
              url = anyPin[0].replace(/\/(?:236x|474x|564x)\//, "/736x/");
            }
          }
        }
      } catch (e) {
        console.warn("Could not resolve pinterest page:", e);
      }
    }

    // Re-validate resolved target URL
    const targetUrl = new URL(url);
    if (!["http:", "https:"].includes(targetUrl.protocol)) {
      return new NextResponse("Invalid resolved protocol", { status: 400 });
    }

    if (!isAllowedHost(targetUrl.hostname)) {
      return new NextResponse("Forbidden resolved host", { status: 403 });
    }

    const response = await fetch(url, {
      headers: {
        "User-Agent":
          "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36",
        Accept: "image/avif,image/webp,image/apng,image/svg+xml,image/*,*/*;q=0.8",
        Referer: "https://www.pinterest.com/",
      },
    });

    if (!response.ok) {
      return new NextResponse(`Failed to fetch image: ${response.status}`, {
        status: response.status,
      });
    }

    const contentType = response.headers.get("content-type") || "image/jpeg";
    if (!contentType.startsWith("image/")) {
      return new NextResponse("Expected image content type", { status: 400 });
    }

    const arrayBuffer = await response.arrayBuffer();

    return new NextResponse(arrayBuffer, {
      headers: {
        "Content-Type": contentType,
        "Cache-Control": "public, max-age=86400",
      },
    });
  } catch (err: any) {
    console.error("Proxy image error:", err);
    return new NextResponse("Failed to proxy image", { status: 500 });
  }
}

