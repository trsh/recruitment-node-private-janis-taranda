import { AddressType, Client, GeocodeResponse } from "@googlemaps/google-maps-services-js";
import { AxiosError } from "axios";
import config from "config/config";
import { GeocodeAddressError, GeocodeServiceError } from "errors/errors";

export interface GeoCodeData {
  fullAddress: string;
  lat: number;
  lng: number;
}

export type GecodeService = "GOOGLE" | "?";

export class Geocode {
  private static acceptedAddressTypes: AddressType[] = [AddressType.premise, AddressType.street_address, AddressType.subpremise];

  private static async googleGeocodeRequestByAddress(address: string): Promise<GeocodeResponse> {
    const client = new Client({});
    const result = await client
      .geocode({
        params: {
          key: config.GOOGLE_MAPS_API_KEY,
          address
        }
      });

    return result;
  }

  private static async getGoogleGeocodeDataByAddress(address: string): Promise<GeoCodeData> {
    try {
      const results = await Geocode.googleGeocodeRequestByAddress(address);

      if (results.status === 200) {
        if (results?.data?.results?.length) {
          for (const result of results.data.results) {
            const isValid = result.types.some(type => Geocode.acceptedAddressTypes.includes(type));
            if (isValid) {
              return {
                fullAddress: result.formatted_address,
                lat: result.geometry.location.lat,
                lng: result.geometry.location.lng
              };
            }
          }
        }

        throw new GeocodeAddressError(`No valid address found by "${address}"`);

      } else {
        // TODO: log error
        throw new GeocodeServiceError(`Invalid status from google geocode request ${results.status}`);
      }

    } catch (e) {
      // TODO: log error
      if (e instanceof AxiosError) {
        throw new GeocodeServiceError((<AxiosError<{ error_message: string }>>e).response?.data?.error_message);
      } else if (e instanceof Error) {
        throw new GeocodeServiceError(e.message);
      } else {
        throw new GeocodeServiceError(String(e));
      }
    }
  }

  public static async getGeocodeDataByAddress(address: string, service: GecodeService = "GOOGLE"): Promise<GeoCodeData> {
    switch (service) {
      case "GOOGLE":
        return Geocode.getGoogleGeocodeDataByAddress(address);
      default:
        throw Error("Unsuported geocode service");
    }
  }
}
