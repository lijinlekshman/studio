
/**
 * @fileOverview Calculates the distance based on source and destination coordinates.
 *
 * - calculateDistance - A function that calculates the distance.
 * - CalculateDistanceInput - The input type for the calculateDistance function.
 * - CalculateDistanceOutput - The return type for the calculateDistance function.
 */

// import {ai} from '@/ai/ai-instance'; // Commented out for static export
import {z} from 'zod'; // Changed from 'genkit' to 'zod'

const CalculateDistanceInputSchema = z.object({
  sourceLat: z.number().describe('The latitude of the source location.'),
  sourceLng: z.number().describe('The longitude of the source location.'),
  destinationLat: z.number().describe('The latitude of the destination location.'),
  destinationLng: z.number().describe('The longitude of the destination location.'),
});
export type CalculateDistanceInput = z.infer<typeof CalculateDistanceInputSchema>;

const CalculateDistanceOutputSchema = z.object({
  distance: z.number().describe('The distance between source and destination in kilometers.'),
  fare: z.number().describe('The estimated fare for the ride.'), // Added fare
});
export type CalculateDistanceOutput = z.infer<typeof CalculateDistanceOutputSchema>;

export async function calculateDistance(input: CalculateDistanceInput): Promise<CalculateDistanceOutput> {
  // NOTE: This flow will not work as intended in a pure static export
  // as Genkit prompts/flows require a server environment.
  // For static export, directly returning mock data.
  console.warn("calculateDistance called in static context, returning mock data.");
  // Simple distance calculation (Haversine formula placeholder)
  const R = 6371; // Radius of the earth in km
  const dLat = (input.destinationLat - input.sourceLat) * Math.PI / 180;
  const dLng = (input.destinationLng - input.sourceLng) * Math.PI / 180;
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(input.sourceLat * Math.PI / 180) * Math.cos(input.destinationLat * Math.PI / 180) *
    Math.sin(dLng / 2) * Math.sin(dLng / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  const distance = R * c; // Distance in km

  return { distance: distance, fare: distance * 10 }; // Default mock distance and fare
}

/*
// Original Genkit prompt and flow definition - commented out for static export
import {ai} from '@/ai/ai-instance';

const prompt = ai.definePrompt({
  name: 'calculateDistancePrompt',
  input: {
    schema: CalculateDistanceInputSchema,
  },
  output: {
    schema: CalculateDistanceOutputSchema,
  },
  prompt: `You are a distance calculation service. Given the source and destination coordinates, calculate the distance in kilometers.

Source Latitude: {{{sourceLat}}}
Source Longitude: {{{sourceLng}}}
Destination Latitude: {{{destinationLat}}}
Destination Longitude: {{{destinationLng}}}

Return a JSON object containing the calculated distance in kilometers and an estimated fare. Only return the distance and fare.`,
});

const calculateDistanceFlow = ai.defineFlow(
  {
    name: 'calculateDistanceFlow',
    inputSchema: CalculateDistanceInputSchema,
    outputSchema: CalculateDistanceOutputSchema,
  },
  async input => {
    const {output} = await prompt(input);
    return output!;
  }
);
*/

