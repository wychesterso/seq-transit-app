import {
  BriefServiceResponse,
  FullServiceResponse,
  ServiceResponse,
} from "../types";
import { API_BASE_URL } from "./config";

export async function fetchNearestServices(
  lat: number,
  lon: number,
  signal?: AbortSignal,
): Promise<ServiceResponse[]> {
  const res = await fetch(
    `${API_BASE_URL}/services/nearest?lat=${lat}&lon=${lon}&radius=XL`,
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
): Promise<BriefServiceResponse[]> {
  const res = await fetch(
    `${API_BASE_URL}/services/prefix?prefix=${prefix}&lat=${lat}&lon=${lon}`,
    { signal },
  );

  if (!res.ok) {
    throw new Error("Failed to fetch services");
  }

  return res.json();
}

export async function fetchServicesAtStop(
  id: string,
  signal?: AbortSignal,
): Promise<ServiceResponse[]> {
  const res = await fetch(`${API_BASE_URL}/services/stop?id=${id}`, { signal });

  if (!res.ok) {
    throw new Error("Failed to fetch services");
  }

  return res.json();
}

export async function fetchFullServiceInfo(
  routeShortName: string,
  tripHeadsign: string,
  directionId: number,
  lat: number,
  lon: number,
  signal?: AbortSignal,
): Promise<FullServiceResponse> {
  const res = await fetch(
    `${API_BASE_URL}/services/info?route=${routeShortName}&headsign=${tripHeadsign}&dir=${directionId}&lat=${lat}&lon=${lon}`,
    { signal },
  );

  if (!res.ok) {
    throw new Error("Failed to fetch service info");
  }

  return res.json();
}
