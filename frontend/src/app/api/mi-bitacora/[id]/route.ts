import { NextRequest, NextResponse } from "next/server";

const BACKEND_URL = process.env.BACKEND_API_URL ?? "http://localhost:3000";

export async function GET(
  request: NextRequest,
  context: { params: Promise<{ id: string }> },
) {
  const { id } = await context.params;
  const searchParams = request.nextUrl.searchParams;
  const upstreamUrl = `${BACKEND_URL}/bitacora/${id}?${searchParams.toString()}`;

  try {
    const response = await fetch(upstreamUrl, {
      method: "GET",
      cache: "no-store",
      headers: {
        "Content-Type": "application/json",
      },
    });

    const payload = await response.json();

    return NextResponse.json(payload, {
      status: response.status,
    });
  } catch {
    return NextResponse.json(
      {
        success: false,
        message:
          "No fue posible conectar con el backend para obtener el detalle.",
      },
      { status: 502 },
    );
  }
}
