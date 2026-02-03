import { BriefStopResponse } from "../types";
import { API_BASE_URL } from "./config";

export async function fetchNearestStops(
  lat: number,
  lon: number,
  signal?: AbortSignal,
): Promise<BriefStopResponse[]> {
  const res = await fetch(
    `${API_BASE_URL}/stops/nearest?lat=${lat}&lon=${lon}`,
    { signal },
  );

  if (!res.ok) {
    throw new Error("Failed to fetch stops");
  }

  return res.json();
}
