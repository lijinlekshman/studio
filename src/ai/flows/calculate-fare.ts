
/**
 * @fileOverview Calculates the distance based on source and destination coordinates.
 *
 * - calculateDistance - A function that calculates the distance.
 * - CalculateDistanceInput - The input type for the calculateDistance function.
 * - CalculateDistanceOutput - The return type for the calculateDistance function.
 */

import {ai} from '@/ai/ai-instance';
import {z} from 'genkit';

const CalculateDistanceInputSchema = z.object({
  sourceLat: z.number().describe('The latitude of the source location.'),
  sourceLng: z.number().describe('The longitude of the source location.'),
  destinationLat: z.number().describe('The latitude of the destination location.'),
  destinationLng: z.number().describe('The longitude of the destination location.'),
});
export type CalculateDistanceInput = z.infer<typeof CalculateDistanceInputSchema>;

const CalculateDistanceOutputSchema = z.object({
  distance: z.number().describe('The distance between source and destination in kilometers.'),
});
export type CalculateDistanceOutput = z.infer<typeof CalculateDistanceOutputSchema>;

export async function calculateDistance(input: CalculateDistanceInput): Promise<CalculateDistanceOutput> {
  // NOTE: This flow will not work as intended in a pure static export
  // as Genkit prompts/flows require a server environment.
  // For static export, this will likely result in an error or unexpected behavior.
  // Consider returning mock data or a simplified calculation if this needs to "work" client-side.
  try {
    return await calculateDistanceFlow(input);
  } catch (error) {
    console.error("Error in calculateDistance (static context):", error);
    // Fallback for static export: return a default or throw.
    // Returning a default distance to prevent complete UI breakage.
    return { distance: 0 };
  }
}

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

Return a JSON object containing the calculated distance in kilometers. Only return the distance.`,
});

const calculateDistanceFlow = ai.defineFlow<
  typeof CalculateDistanceInputSchema,
  typeof CalculateDistanceOutputSchema
>({
  name: 'calculateDistanceFlow',
  inputSchema: CalculateDistanceInputSchema,
  outputSchema: CalculateDistanceOutputSchema,
}, async input => {
  const {output} = await prompt(input);
  return output!;
});
