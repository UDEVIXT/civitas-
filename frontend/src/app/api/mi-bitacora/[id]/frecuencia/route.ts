import { NextRequest, NextResponse } from "next/server";

const BACKEND_URL = process.env.BACKEND_API_URL ?? "http://localhost:3000";

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const body = await request.json();
  const searchParams = request.nextUrl.searchParams;
  const upstreamUrl = `${BACKEND_URL}/bitacora/mi-bitacora/${id}/frecuencia?${searchParams.toString()}`;

  try {
    const response = await fetch(upstreamUrl, {
      method: "PATCH",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(body),
    });

    const raw = await response.text();
    let data: unknown = { success: response.ok };

    if (raw) {
      try {
        data = JSON.parse(raw);
      } catch {
        data = {
          success: response.ok,
          message: raw,
        };
      }
    }

    if (!response.ok) {
      return NextResponse.json(data, { status: response.status });
    }

    return NextResponse.json(data);
  } catch (error) {
    const message =
      error instanceof Error
        ? error.message
        : "Error al conectar con el servidor";
    return NextResponse.json(
      { success: false, message },
      { status: 500 }
    );
  }
}
