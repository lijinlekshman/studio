'use server';
/**
 * @fileOverview Calculates the fare based on source and destination coordinates.
 *
 * - calculateFare - A function that calculates the fare.
 * - CalculateFareInput - The input type for the calculateFare function.
 * - CalculateFareOutput - The return type for the calculateFare function.
 */

import {ai} from '@/ai/ai-instance';
import {z} from 'genkit';

const CalculateFareInputSchema = z.object({
  sourceLat: z.number().describe('The latitude of the source location.'),
  sourceLng: z.number().describe('The longitude of the source location.'),
  destinationLat: z.number().describe('The latitude of the destination location.'),
  destinationLng: z.number().describe('The longitude of the destination location.'),
});
export type CalculateFareInput = z.infer<typeof CalculateFareInputSchema>;

const CalculateFareOutputSchema = z.object({
  fare: z.number().describe('The calculated fare in INR.'),
  distance: z.number().describe('The distance between source and destination in kilometers.'),
});
export type CalculateFareOutput = z.infer<typeof CalculateFareOutputSchema>;

export async function calculateFare(input: CalculateFareInput): Promise<CalculateFareOutput> {
  return calculateFareFlow(input);
}

const prompt = ai.definePrompt({
  name: 'calculateFarePrompt',
  input: {
    schema: z.object({
      sourceLat: z.number().describe('The latitude of the source location.'),
      sourceLng: z.number().describe('The longitude of the source location.'),
      destinationLat: z.number().describe('The latitude of the destination location.'),
      destinationLng: z.number().describe('The longitude of the destination location.'),
    }),
  },
  output: {
    schema: z.object({
      fare: z.number().describe('The calculated fare in INR.'),
      distance: z.number().describe('The distance between source and destination in kilometers.'),
    }),
  },
  prompt: `You are a fare calculation service. Given the source and destination coordinates, calculate the fare based on the distance.
Use a base fare of ₹50 and charge ₹10 per kilometer. Also output the distance in kilometers.

Source Latitude: {{{sourceLat}}}
Source Longitude: {{{sourceLng}}}
Destination Latitude: {{{destinationLat}}}
Destination Longitude: {{{destinationLng}}}

Return a JSON object containing the calculated fare and the distance.`,
});

const calculateFareFlow = ai.defineFlow<
  typeof CalculateFareInputSchema,
  typeof CalculateFareOutputSchema
>({
  name: 'calculateFareFlow',
  inputSchema: CalculateFareInputSchema,
  outputSchema: CalculateFareOutputSchema,
}, async input => {
  const {output} = await prompt(input);
  return output!;
});
