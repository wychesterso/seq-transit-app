export interface ArrivalResponse {
  tripId: string;
  scheduledArrivalSeconds: number;
  scheduledArrivalLocal: string;
  effectiveArrivalSeconds: number;
  effectiveArrivalLocal: string;
  arrivalDelaySeconds?: number;
  scheduledDepartureSeconds: number;
  scheduledDepartureLocal: string;
  effectiveDepartureSeconds: number;
  effectiveDepartureLocal: string;
  departureDelaySeconds?: number;
  realTime: boolean;
  cancelled: boolean;
  skipped: boolean;
}

export interface ArrivalsAtStopResponse {
  stop: BriefStopResponse;
  stopSequence: number;
  isFirstStop: boolean;
  isLastStop: boolean;
  nextThreeArrivals: ArrivalResponse[];
}

export interface BriefServiceResponse {
  serviceGroup: ServiceGroup;
  routeShortName: string;
  routeLongName: string;
  routeType: number;
}

export interface BriefStopResponse {
  stopId: string;
  stopCode: string;
  stopName: string;
  stopLat: number;
  stopLon: number;
  zoneId: string;
}

export interface FullServiceResponse {
  serviceGroup: ServiceGroup;
  routeShortName: string;
  routeLongName: string;
  routeType: number;
  routeColor: string;
  routeTextColor: string;
  adjacentStop: BriefStopResponse;
  arrivalsAtStops: ArrivalsAtStopResponse[];
}

export interface FullStopResponse {
  stopInfo: BriefStopResponse;
  services: ServiceResponse[];
}

export interface ServiceGroup {
  routeShortName: string;
  tripHeadsign: string;
  directionId: number;
}

export interface ServiceResponse {
  serviceGroup: ServiceGroup;
  routeShortName: string;
  routeLongName: string;
  routeType: number;
  arrivalsAtNearestStop: ArrivalsAtStopResponse;
}
