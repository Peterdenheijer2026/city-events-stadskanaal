import { NextResponse } from "next/server";

// Gebruik PDOK Locatieserver (BAG-adressen) – geen API-key nodig.
// Documentatie: https://www.pdok.nl/locatieserver
const PDOK_URL = "https://api.pdok.nl/bzk/locatieserver/search/v3_1/free";

export async function POST(request: Request) {
  try {
    const body = await request.json().catch(() => ({}));
    const rawPostcode = typeof body.postcode === "string" ? body.postcode : "";
    const rawHouseNumber = typeof body.houseNumber === "string" ? body.houseNumber : "";

    const postcode = rawPostcode.replace(/\s+/g, "").toUpperCase();
    const houseNumber = rawHouseNumber.trim();

    if (!postcode || !houseNumber) {
      return NextResponse.json({ error: "postcode_en_huisnummer_verplicht" }, { status: 400 });
    }

    const params = new URLSearchParams({
      q: `${postcode} ${houseNumber}`,
      fq: `postcode:${postcode}`,
      rows: "1",
      fl: "straatnaam,woonplaatsnaam",
    });

    const res = await fetch(`${PDOK_URL}?${params.toString()}`, {
      headers: { Accept: "application/json" },
      cache: "no-store",
    });

    if (!res.ok) {
      return NextResponse.json({ error: "upstream_error" }, { status: 502 });
    }

    const data = await res.json() as {
      response?: { docs?: Array<{ straatnaam?: string; woonplaatsnaam?: string }> };
    };

    const doc = data.response?.docs?.[0];
    if (!doc) {
      return NextResponse.json({ error: "not_found" }, { status: 404 });
    }

    const street = doc.straatnaam ?? "";
    const city = doc.woonplaatsnaam ?? "";

    if (!street && !city) {
      return NextResponse.json({ error: "no_address" }, { status: 404 });
    }

    return NextResponse.json({ street, city });
  } catch (e) {
    return NextResponse.json(
      { error: e instanceof Error ? e.message : "unknown_error" },
      { status: 500 }
    );
  }
}

