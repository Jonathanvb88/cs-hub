import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";

export async function GET(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.accessToken) {
      return NextResponse.json({
        files: [],
        pending: true,
        message: "Microsoft Graph not connected — admin consent required",
      });
    }

    const query = req.nextUrl.searchParams.get("q") || "";
    const clientName = req.nextUrl.searchParams.get("client") || "";
    const searchTerm = query || clientName;

    if (!searchTerm) {
      return NextResponse.json({ files: [], message: "No search term provided" });
    }

    // Search OneDrive and SharePoint for files matching the term
    const searchRes = await fetch(
      `https://graph.microsoft.com/v1.0/search/query`,
      {
        method: "POST",
        headers: {
          Authorization: `Bearer ${session.accessToken}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          requests: [
            {
              entityTypes: ["driveItem"],
              query: { queryString: searchTerm },
              fields: ["id", "name", "webUrl", "lastModifiedDateTime", "size", "createdBy", "parentReference", "file"],
              from: 0,
              size: 25,
            },
          ],
        }),
      }
    );

    if (!searchRes.ok) {
      const err = await searchRes.text();
      return NextResponse.json({ files: [], error: err }, { status: searchRes.status });
    }

    const searchData = await searchRes.json();
    const hits = searchData.value?.[0]?.hitsContainers?.[0]?.hits || [];

    const files = hits.map((hit: Record<string, unknown>) => {
      const resource = hit.resource as Record<string, unknown>;
      return {
        id: resource.id,
        name: resource.name,
        webUrl: resource.webUrl,
        lastModified: resource.lastModifiedDateTime,
        size: resource.size,
        createdBy: (resource.createdBy as Record<string, unknown>)?.user,
        parentPath: (resource.parentReference as Record<string, unknown>)?.path,
        mimeType: (resource.file as Record<string, unknown>)?.mimeType,
        extension: (resource.name as string)?.split(".").pop()?.toLowerCase(),
      };
    });

    return NextResponse.json({ files, total: files.length });
  } catch (e) {
    return NextResponse.json({ files: [], error: String(e) }, { status: 500 });
  }
}
