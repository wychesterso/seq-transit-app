import { ServiceResponse } from "../types";
import { API_BASE_URL } from "./config";

export async function fetchNearestServices(
  lat: number,
  lon: number,
  signal?: AbortSignal,
): Promise<ServiceResponse[]> {
  const res = await fetch(
    `${API_BASE_URL}/services/nearest?lat=${lat}&lon=${lon}`,
    { signal },
  );

  if (!res.ok) {
    throw new Error("Failed to fetch services");
  }

  return res.json();
}

export async function fetchServicesByPrefix(
  prefix: string,
  lat: number,
  lon: number,
  signal?: AbortSignal,
): Promise<ServiceResponse[]> {
  const res = await fetch(
    `${API_BASE_URL}/services/prefix?prefix=${prefix}&lat=${lat}&lon=${lon}`,
    { signal },
  );

  if (!res.ok) {
    throw new Error("Failed to fetch services");
  }

  return res.json();
}
