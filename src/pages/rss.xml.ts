import type { APIRoute } from "astro";
import { getCollection } from "astro:content";
import site from "../site.config";

function escapeXml(s: string) {
  return s
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

export const GET: APIRoute = async (context) => {
  const posts = (await getCollection("posts"))
    .filter((p) => !p.data.draft)
    .sort((a, b) => b.data.pubDate.valueOf() - a.data.pubDate.valueOf());

  const siteUrl = (context.site?.href ?? "https://navet.up.railway.app").replace(/\/$/, "");

  const items = posts
    .map((post) => `    <item>
      <title>${escapeXml(post.data.title)}</title>
      <link>${siteUrl}/posts/${post.id}/</link>
      <guid>${siteUrl}/posts/${post.id}/</guid>
      <pubDate>${post.data.pubDate.toUTCString()}</pubDate>
      <description>${escapeXml(post.data.description)}</description>
    </item>`)
    .join("\n");

  const xml = `<?xml version="1.0" encoding="UTF-8"?>
<rss version="2.0">
  <channel>
    <title>${escapeXml(site.title)}</title>
    <description>${escapeXml(site.tagline)}</description>
    <link>${siteUrl}/</link>
    <language>en-us</language>
${items}
  </channel>
</rss>`;

  return new Response(xml, {
    headers: {
      "Content-Type": "application/xml; charset=utf-8",
    },
  });
};
