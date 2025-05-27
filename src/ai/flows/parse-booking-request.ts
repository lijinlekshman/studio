
/**
 * @fileOverview Parses a natural language booking request into structured data.
 *
 * - parseBookingRequest - A function that parses the user's booking text.
 * - ParseBookingRequestInput - The input type for the parseBookingRequest function.
 * - ParseBookingRequestOutput - The return type for the parseBookingRequest function.
 */

// import {ai} from '@/ai/ai-instance'; // Commented out for static export
import {z} from 'zod';

const ParseBookingRequestInputSchema = z.object({
  requestText: z.string().describe('The natural language text from the user requesting a cab booking.'),
});
export type ParseBookingRequestInput = z.infer<typeof ParseBookingRequestInputSchema>;

const ParseBookingRequestOutputSchema = z.object({
  sourceName: z.string().optional().describe('The suggested name of the source location (e.g., "Punalur Bus Stand").'),
  destinationName: z.string().optional().describe('The suggested name of the destination location (e.g., "Kollam Beach").'),
  userName: z.string().optional().describe('The name of the user making the booking.'),
  email: z.string().optional().describe('The email address of the user.'),
  mobileNumber: z.string().optional().describe('The mobile number of the user.'),
  vehiclePreference: z.string().optional().describe('The preferred vehicle type (e.g., "Sedan", "SUV", "Mini").'),
});
export type ParseBookingRequestOutput = z.infer<typeof ParseBookingRequestOutputSchema>;

export async function parseBookingRequest(input: ParseBookingRequestInput): Promise<ParseBookingRequestOutput> {
  // NOTE: This flow will not work as intended in a pure static export
  // For static export, directly returning mock data.
  console.warn("parseBookingRequest called in static context, returning empty data.");
  return {
    sourceName: undefined,
    destinationName: undefined,
    userName: undefined,
    email: undefined,
    mobileNumber: undefined,
    vehiclePreference: undefined,
  };
}

/*
// Original Genkit prompt and flow definition - commented out for static export
import {ai}from '@/ai/ai-instance';

const prompt = ai.definePrompt({
  name: 'parseBookingRequestPrompt',
  input: {schema: ParseBookingRequestInputSchema},
  output: {schema: ParseBookingRequestOutputSchema},
  prompt: `You are an intelligent assistant for a cab booking application.
The user will provide a text request for booking a cab.
Your task is to parse this request and extract the following details:
- Source location name (sourceName)
- Destination location name (destinationName)
- User's name (userName)
- User's email (email)
- User's mobile number (mobileNumber)
- Preferred vehicle type (vehiclePreference). Valid types are "Sedan", "SUV", "Mini".

If any detail is not explicitly mentioned by the user, leave the corresponding field blank or undefined in the output.
Do not invent information. Only extract what is provided.

User Request:
{{{requestText}}}

Extract the details and provide them in the specified JSON output format.
Example:
User Request: "Book a cab from Trivandrum Central to Technopark for John Doe, john@example.com, 9876543210. I need an SUV."
Output:
{
  "sourceName": "Trivandrum Central",
  "destinationName": "Technopark",
  "userName": "John Doe",
  "email": "john@example.com",
  "mobileNumber": "9876543210",
  "vehiclePreference": "SUV"
}

User Request: "Cab from Punalur to Thenmala Dam"
Output:
{
  "sourceName": "Punalur",
  "destinationName": "Thenmala Dam"
}
`,
});

const parseBookingRequestFlow = ai.defineFlow(
  {
    name: 'parseBookingRequestFlow',
    inputSchema: ParseBookingRequestInputSchema,
    outputSchema: ParseBookingRequestOutputSchema,
  },
  async (input) => {
    const {output} = await prompt(input);
    return output!;
  }
);

// Wrapper function for the flow
// export async function parseBookingRequest(input: ParseBookingRequestInput): Promise<ParseBookingRequestOutput> {
//   return parseBookingRequestFlow(input);
// }
*/
