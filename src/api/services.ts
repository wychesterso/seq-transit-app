import { BriefServiceResponse } from "../types";
import { API_BASE_URL } from "./config";

export async function fetchNearestServices(
  lat: number,
  lon: number,
  signal?: AbortSignal,
): Promise<BriefServiceResponse[]> {
  const res = await fetch(
    `${API_BASE_URL}/services/nearest?lat=${lat}&lon=${lon}`,
    { signal },
  );

  if (!res.ok) {
    throw new Error("Failed to fetch services");
  }

  return res.json();
}
