import { BriefServiceResponse } from "../types";

export async function fetchNearestServices(
  lat: number,
  lon: number,
  signal?: AbortSignal,
): Promise<BriefServiceResponse[]> {
  const res = await fetch(`/services/nearest?lat=${lat}&lon=${lon}`, {
    signal,
  });

  if (!res.ok) {
    throw new Error("Failed to fetch services");
  }

  return res.json();
}
