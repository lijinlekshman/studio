
'use server';
/**
 * @fileOverview Provides destination suggestions based on the user's current location.
 *
 * - suggestDestinations - A function that suggests destinations.
 * - SuggestDestinationsInput - The input type for the suggestDestinations function.
 * - SuggestDestinationsOutput - The return type for the suggestDestinations function.
 */

import {ai}from '@/ai/ai-instance';
import {z} from 'zod';

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

const prompt = ai.definePrompt({
  name: 'suggestDestinationsPrompt',
  input: {
    schema: SuggestDestinationsInputSchema,
  },
  output: {
    schema: SuggestDestinationsOutputSchema,
  },
  prompt: `You are a ride assistant specializing in destinations within Kerala, India. Given the user's current location and past ride history, suggest popular destinations within Kerala. Focus on destinations within and around Punalur city (Kollam district, Kerala), including places within a 25km radius.

Current Location: {{{currentLocation.lat}}}, {{{currentLocation.lng}}}.

{{#if pastRideHistory}}
Past Ride History:
{{#each pastRideHistory}}
  Destination: {{this.destination.lat}}, {{this.destination.lng}}
{{/each}}
{{/if}}

Suggest destinations (latitude, longitude and a descriptive name) that the user may want to go to. Consider cities from all districts of Kerala, such as Thiruvananthapuram, Kollam, Pathanamthitta, Alappuzha, Kottayam, Idukki, Ernakulam, Thrissur, Palakkad, Malappuram, Kozhikode, Wayanad, Kannur, and Kasaragod. Include specific locations around Punalur, like Thenmala Dam, Achankovil, Rosemala, and other nearby attractions and towns in Kollam district like Aryankavu, Kulathupuzha, Anchal and Ottackal Weir. Return the destination name in the format "Location Name, City, State".
Include a variety of places including tourist spots, towns, and transport hubs like bus stands or railway stations from the specified areas.
Return a JSON array of objects containing the suggested destination's latitude, longitude and a descriptive name.
Ensure you include at least these specific locations if relevant to the current location context:
Punalur Bus Stand, Punalur, Kerala
Punalur Railway Station, Punalur, Kerala
Thenmala Dam, Thenmala, Kerala
Achankovil River, Achankovil, Kerala
Rosemala View Point, Rosemala, Kerala
Kollam Beach, Kollam, Kerala
Sree Padmanabhaswamy Temple, Thiruvananthapuram, Kerala
Munnar Top Station, Idukki, Kerala
Fort Kochi, Ernakulam, Kerala
Kozhikode Beach, Kozhikode, Kerala
Alappuzha Beach, Alappuzha, Kerala
Vadakkunnathan Temple, Thrissur, Kerala
Napier Museum, Thiruvananthapuram, Kerala
Varkala Cliff, Varkala, Kerala
Pathanamthitta Town, Pathanamthitta, Kerala
Kottayam Town, Kottayam, Kerala
Wayanad Wildlife Sanctuary, Wayanad, Kerala
Palakkad Fort, Palakkad, Kerala
Malappuram Town, Malappuram, Kerala
Kannur Fort, Kannur, Kerala
Bekal Fort, Kasaragod, Kerala
Aryankavu, Kollam District, Kerala
Kulathupuzha, Kollam District, Kerala
Kollam Junction Railway Station, Kollam, Kerala
Sasthamcotta Lake, Kollam District, Kerala
Anchal Town, Kollam District, Kerala
Thangassery Lighthouse, Kollam, Kerala
Ottackal Weir, Punalur, Kollam District, Kerala
`,
});

const suggestDestinationsFlow = ai.defineFlow(
  {
    name: 'suggestDestinationsFlow',
    inputSchema: SuggestDestinationsInputSchema,
    outputSchema: SuggestDestinationsOutputSchema,
  },
  async input => {
    const {output} = await prompt(input);
    return output!;
  }
);

export async function suggestDestinations(input: SuggestDestinationsInput): Promise<SuggestDestinationsOutput> {
  return suggestDestinationsFlow(input);
}
