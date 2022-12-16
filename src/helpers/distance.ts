import { Client, DistanceMatrixResponse, Status, TravelMode, UnitSystem } from "@googlemaps/google-maps-services-js";
import { AxiosError } from "axios";
import { DistanceImpossibleError, DistanceServiceError } from "errors/errors";
import config from "config/config";
import { Coordinates } from "./definitions";

export type DistanceService = "GOOGLE" | "?";

export class Distance {
  private static async googleDistanceRequestBy2Coordinates(
    origins: Coordinates,
    destionations: Coordinates[]
  ): Promise<DistanceMatrixResponse> {
    const client = new Client({});
    const result = await client
      .distancematrix({
        params: {
          origins: [origins],
          destinations: destionations,
          mode: TravelMode.driving,
          units: UnitSystem.metric,
          key: config.GOOGLE_MAPS_API_KEY,
        }
      });

    return result;
  }

  private static async getGoogleShortestDistanceBy2Coordinates(
    origins: Coordinates,
    destionations: Coordinates[]
  ): Promise<number[]> {
    try {
      const results = await Distance.googleDistanceRequestBy2Coordinates(origins, destionations);

      if (results.status === 200) {
        if (results?.data?.rows?.length) {
          const distances: number[] = [];

          for (const result of results.data.rows) {
            for (const element of result.elements) {
              if (element.status !== Status.OK) {
                distances.push(-1);
                continue;
              }

              const distanceVal = element.distance.value;
              distances.push(distanceVal);
            }
          }

          return distances;
        }

        throw new DistanceImpossibleError("No valid distance found");

      } else {
        // TODO: log error
        throw new DistanceServiceError(`Invalid status from google distance request ${results.status}`);
      }

    } catch (e) {
      // TODO: log error
      if (e instanceof AxiosError) {
        throw new DistanceServiceError((<AxiosError<{ error_message: string }>>e).response?.data?.error_message);
      } else if (e instanceof Error) {
        throw new DistanceServiceError(e.message);
      } else {
        throw new DistanceServiceError(String(e));
      }
    }
  }

  public static async getShortestDistanceBy2Coordinates(
    origins: Coordinates,
    destionations: Coordinates[],
    service: DistanceService = "GOOGLE"
  ): Promise<number[]> {
    switch (service) {
      case "GOOGLE":
        return Distance.getGoogleShortestDistanceBy2Coordinates(origins, destionations);
      default:
        throw Error("Unsuported distance service");
    }
  }
}
