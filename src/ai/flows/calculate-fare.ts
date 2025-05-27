
'use server';
/**
 * @fileOverview Calculates the distance based on source and destination coordinates.
 *
 * - calculateDistance - A function that calculates the distance.
 * - CalculateDistanceInput - The input type for the calculateDistance function.
 * - CalculateDistanceOutput - The return type for the calculateDistance function.
 */

import {ai} from '@/ai/ai-instance';
import {z} from 'zod';

const CalculateDistanceInputSchema = z.object({
  sourceLat: z.number().describe('The latitude of the source location.'),
  sourceLng: z.number().describe('The longitude of the source location.'),
  destinationLat: z.number().describe('The latitude of the destination location.'),
  destinationLng: z.number().describe('The longitude of the destination location.'),
});
export type CalculateDistanceInput = z.infer<typeof CalculateDistanceInputSchema>;

const CalculateDistanceOutputSchema = z.object({
  distance: z.number().describe('The distance between source and destination in kilometers.'),
  fare: z.number().describe('The estimated fare for the ride.'),
});
export type CalculateDistanceOutput = z.infer<typeof CalculateDistanceOutputSchema>;

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

Return a JSON object containing the calculated distance in kilometers and an estimated fare. Only return the distance and fare.
For the fare, use a base of 25 and add 10 per kilometer.
`,
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

export async function calculateDistance(input: CalculateDistanceInput): Promise<CalculateDistanceOutput> {
  return calculateDistanceFlow(input);
}
