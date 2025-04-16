'use server';
/**
 * @fileOverview Provides destination suggestions based on the user's current location.
 *
 * - suggestDestinations - A function that suggests destinations.
 * - SuggestDestinationsInput - The input type for the suggestDestinations function.
 * - SuggestDestinationsOutput - The return type for the suggestDestinations function.
 */

import {ai} from '@/ai/ai-instance';
import {z} from 'genkit';

const SuggestDestinationsInputSchema = z.object({
  currentLocation: z.object({
    lat: z.number().describe('The latitude of the current location.'),
    lng: z.number().describe('The longitude of the current location.'),
  }).describe('The current geographical coordinate of the user.'),
  pastRideHistory: z.array(z.object({
    destination: z.object({
      lat: z.number().describe('The latitude of the destination.'),
      lng: z.number().describe('The longitude of the destination.'),
    }).describe('The geographical coordinate of the destination.'),
  })).optional().describe('The user ride history with lattitude and longitude of the destination'),
});
export type SuggestDestinationsInput = z.infer<typeof SuggestDestinationsInputSchema>;

const SuggestDestinationsOutputSchema = z.array(z.object({
  lat: z.number().describe('The latitude of the suggested destination.'),
  lng: z.number().describe('The longitude of the suggested destination.'),
  name: z.string().describe('The name of the suggested destination')
})).describe('A list of suggested destinations with their coordinates.');
export type SuggestDestinationsOutput = z.infer<typeof SuggestDestinationsOutputSchema>;

export async function suggestDestinations(input: SuggestDestinationsInput): Promise<SuggestDestinationsOutput> {
  return suggestDestinationsFlow(input);
}

const prompt = ai.definePrompt({
  name: 'suggestDestinationsPrompt',
  input: {
    schema: z.object({
      currentLocation: z.object({
        lat: z.number().describe('The latitude of the current location.'),
        lng: z.number().describe('The longitude of the current location.'),
      }).describe('The current geographical coordinate of the user.'),
      pastRideHistory: z.array(z.object({
        destination: z.object({
          lat: z.number().describe('The latitude of the destination.'),
          lng: z.number().describe('The longitude of the destination.'),
        }).describe('The geographical coordinate of the destination.'),
      })).optional().describe('The user ride history with lattitude and longitude of the destination'),
    }),
  },
  output: {
    schema: z.array(z.object({
      lat: z.number().describe('The latitude of the suggested destination.'),
      lng: z.number().describe('The longitude of the suggested destination.'),
      name: z.string().describe('The name of the suggested destination')
    })).describe('A list of suggested destinations with their coordinates.'),
  },
  prompt: `You are a ride assistant specializing in destinations within Kerala and India. Given the user's current location and past ride history, suggest popular destinations within Kerala and India.

Current Location: {{{currentLocation.lat}}}, {{{currentLocation.lng}}}.

{{#if pastRideHistory}}
Past Ride History:
{{#each pastRideHistory}}
  Destination: {{this.destination.lat}}, {{this.destination.lng}}
{{/each}}
{{/if}}

Suggest destinations (latitude, longitude and a descriptive name) that the user may want to go to. Return the destination name in the format "City Name, State".

Return a JSON array of objects containing the suggested destination's latitude, longitude and a descriptive name.
`,
});

const suggestDestinationsFlow = ai.defineFlow<
  typeof SuggestDestinationsInputSchema,
  typeof SuggestDestinationsOutputSchema
>({
  name: 'suggestDestinationsFlow',
  inputSchema: SuggestDestinationsInputSchema,
  outputSchema: SuggestDestinationsOutputSchema,
}, async input => {
  const {output} = await prompt(input);
  return output!;
});
