/**
 * Represents a geographical coordinate.
 */
export interface Coordinate {
  /**
   * The latitude of the coordinate.
   */
  lat: number;
  /**
   * The longitude of the coordinate.
   */
  lng: number;
}

/**
 * Asynchronously retrieves the fare estimation.
 *
 * @param source The source location coordinate.
 * @param destination The destination location  coordinate.
 * @returns A promise that resolves to an number representing the estimated fare.
 */
export async function getFare(source: Coordinate, destination: Coordinate): Promise<number> {
  // TODO: Implement this by calling an API.
  return 25;
}
