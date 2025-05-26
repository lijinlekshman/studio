
/**
 * @fileOverview Provides destination suggestions based on the user's current location.
 *
 * - suggestDestinations - A function that suggests destinations.
 * - SuggestDestinationsInput - The input type for the suggestDestinations function.
 * - SuggestDestinationsOutput - The return type for the suggestDestinations function.
 */

// import {ai} from '@/ai/ai-instance'; // Commented out for static export
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
  // NOTE: This flow will not work as intended in a pure static export
  // For static export, directly returning mock data.
  console.warn("suggestDestinations called in static context, returning mock data.");
  return [ // Mock data for static export
    { lat: 9.0345, lng: 76.9245, name: "Punalur Bus Stand, Punalur, Kerala" },
    { lat: 9.0321, lng: 76.9203, name: "Punalur Railway Station, Punalur, Kerala" },
    { lat: 8.9987, lng: 77.0807, name: "Thenmala Dam, Thenmala, Kerala" },
    { lat: 9.1700, lng: 76.7800, name: "Achankovil River, Achankovil, Kerala" },
    { lat: 9.0750, lng: 77.1540, name: "Rosemala View Point, Rosemala, Kerala" },
    { lat: 8.9700, lng: 76.7300, name: "Kollam Beach, Kollam, Kerala" },
    { lat: 8.4860, lng: 76.9490, name: "Sree Padmanabhaswamy Temple, Thiruvananthapuram, Kerala" },
  ];
}

/*
// Original Genkit prompt and flow definition - commented out for static export
import {ai} from '@/ai/ai-instance';

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
  prompt: `You are a ride assistant specializing in destinations within Kerala, India. Given the user's current location and past ride history, suggest popular destinations within Kerala. Focus on destinations within and around Punalur city (Kollam district, Kerala), including places within a 25km radius.

Current Location: {{{currentLocation.lat}}}, {{{currentLocation.lng}}}.

{{#if pastRideHistory}}
Past Ride History:
{{#each pastRideHistory}}
  Destination: {{this.destination.lat}}, {{this.destination.lng}}
{{/each}}
{{/if}}

Suggest destinations (latitude, longitude and a descriptive name) that the user may want to go to. Consider cities from all districts of Kerala, such as Thiruvananthapuram, Kollam, Pathanamthitta, Alappuzha, Kottayam, Idukki, Ernakulam, Thrissur, Palakkad, Malappuram, Kozhikode, Wayanad, Kannur, and Kasaragod. Include specific locations around Punalur, like Thenmala Dam, Achankovil, Rosemala, and other nearby attractions and towns in Kollam district. Return the destination name in the format "Location Name, City, State".

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
*/
