// This file is machine-generated - DO NOT EDIT.


/**
 * @fileOverview An AI-powered cab dispatch optimizer.
 *
 * - optimizeDispatch - A function that optimizes cab dispatch based on real-time traffic and demand.
 * - OptimizeDispatchInput - The input type for the optimizeDispatch function.
 * - OptimizeDispatchOutput - The return type for the optimizeDispatch function.
 */

import {ai} from '@/ai/ai-instance';
import {z} from 'genkit';
import {Coordinate} from '@/services/map';

const OptimizeDispatchInputSchema = z.object({
  availableCabs: z
    .array(
      z.object({
        cabId: z.string().describe('The unique identifier of the cab.'),
        currentLocation: z
          .object({
            lat: z.number().describe('The latitude of the cab.'),
            lng: z.number().describe('The longitude of the cab.'),
          })
          .describe('The current location of the cab.'),
      })
    )
    .describe('A list of available cabs and their current locations.'),
  requestLocations: z
    .array(
      z.object({
        requestId: z.string().describe('The unique identifier of the request.'),
        pickupLocation: z
          .object({
            lat: z.number().describe('The latitude of the pickup location.'),
            lng: z.number().describe('The longitude of the pickup location.'),
          })
          .describe('The pickup location of the request.'),
      })
    )
    .describe('A list of cab requests and their pickup locations.'),
  trafficConditions: z
    .string()
    .describe('A description of the current traffic conditions in the city.'),
  demandHotspots: z
    .array(
      z.object({
        location: z
          .object({
            lat: z.number().describe('The latitude of the demand hotspot.'),
            lng: z.number().describe('The longitude of the demand hotspot.'),
          })
          .describe('The location of the demand hotspot.'),
        demandLevel: z
          .string()
          .describe('The level of demand in the hotspot (e.g., high, medium, low).'),
      })
    )
    .describe('A list of areas with high demand for cabs.'),
});

export type OptimizeDispatchInput = z.infer<typeof OptimizeDispatchInputSchema>;

const OptimizeDispatchOutputSchema = z.object({
  dispatchPlan: z
    .array(
      z.object({
        requestId: z.string().describe('The ID of the request to dispatch.'),
        cabId: z.string().describe('The ID of the cab assigned to the request.'),
        estimatedWaitTime: z
          .number()
          .describe('The estimated wait time in minutes for the cab to arrive.'),
        routeSummary: z
          .string()
          .describe('A short human readable summary of the route the driver should take.'),
      })
    )
    .describe('A dispatch plan that optimizes cab assignments.'),
});

export type OptimizeDispatchOutput = z.infer<typeof OptimizeDispatchOutputSchema>;

export async function optimizeDispatch(input: OptimizeDispatchInput): Promise<OptimizeDispatchOutput> {
  // NOTE: This flow will not work as intended in a pure static export
  // as Genkit prompts/flows require a server environment.
  try {
    return await optimizeDispatchFlow(input);
  } catch (error) {
    console.error("Error in optimizeDispatch (static context):", error);
    return { dispatchPlan: [] }; // Fallback for static export
  }
}

const optimizeDispatchPrompt = ai.definePrompt({
  name: 'optimizeDispatchPrompt',
  input: {
    schema: z.object({
      availableCabs: z
        .array(
          z.object({
            cabId: z.string().describe('The unique identifier of the cab.'),
            currentLocation: z
              .object({
                lat: z.number().describe('The latitude of the cab.'),
                lng: z.number().describe('The longitude of the cab.'),
              })
              .describe('The current location of the cab.'),
          })
        )
        .describe('A list of available cabs and their current locations.'),
      requestLocations: z
        .array(
          z.object({
            requestId: z.string().describe('The unique identifier of the request.'),
            pickupLocation: z
              .object({
                lat: z.number().describe('The latitude of the pickup location.'),
                lng: z.number().describe('The longitude of the pickup location.'),
              })
              .describe('The pickup location of the request.'),
          })
        )
        .describe('A list of cab requests and their pickup locations.'),
      trafficConditions: z
        .string()
        .describe('A description of the current traffic conditions in the city.'),
      demandHotspots: z
        .array(
          z.object({
            location: z
              .object({
                lat: z.number().describe('The latitude of the demand hotspot.'),
                lng: z.number().describe('The longitude of the demand hotspot.'),
              })
              .describe('The location of the demand hotspot.'),
            demandLevel: z
              .string()
              .describe('The level of demand in the hotspot (e.g., high, medium, low).'),
          })
        )
        .describe('A list of areas with high demand for cabs.'),
    }),
  },
  output: {
    schema: z.object({
      dispatchPlan: z
        .array(
          z.object({
            requestId: z.string().describe('The ID of the request to dispatch.'),
            cabId: z.string().describe('The ID of the cab assigned to the request.'),
            estimatedWaitTime: z
              .number()
              .describe('The estimated wait time in minutes for the cab to arrive.'),
            routeSummary: z
              .string()
              .describe('A short human readable summary of the route the driver should take.'),
          })
        )
        .describe('A dispatch plan that optimizes cab assignments.'),
    }),
  },
  prompt: `You are an expert AI dispatch system for a cab company. You are tasked with assigning cabs to ride requests to minimize wait times and optimize routes.

Here is a list of available cabs and their current locations:
{{#each availableCabs}}
- Cab ID: {{this.cabId}}, Location: Lat: {{this.currentLocation.lat}}, Lng: {{this.currentLocation.lng}}
{{/each}}

Here is a list of current ride requests and their pickup locations:
{{#each requestLocations}}
- Request ID: {{this.requestId}}, Pickup Location: Lat: {{this.pickupLocation.lat}}, Lng: {{this.pickupLocation.lng}}
{{/each}}

The current traffic conditions are: {{{trafficConditions}}}

Here is a list of areas with high demand for cabs:
{{#each demandHotspots}}
- Location: Lat: {{this.location.lat}}, Lng: {{this.location.lng}}, Demand Level: {{this.demandLevel}}
{{/each}}

Based on this information, generate a dispatch plan that assigns cabs to ride requests in an efficient manner. Minimize the wait times for riders and consider the current traffic conditions and demand hotspots.

Output the dispatch plan as a JSON array of objects, where each object has the following fields:
- requestId: The ID of the request to dispatch
- cabId: The ID of the cab assigned to the request
- estimatedWaitTime: The estimated wait time in minutes for the cab to arrive
- routeSummary: A short summary of the route the driver should take
`, // Replace with Handlebars template
});

const optimizeDispatchFlow = ai.defineFlow<
  typeof OptimizeDispatchInputSchema,
  typeof OptimizeDispatchOutputSchema
>({
  name: 'optimizeDispatchFlow',
  inputSchema: OptimizeDispatchInputSchema,
  outputSchema: OptimizeDispatchOutputSchema,
},
async input => {
  const {output} = await optimizeDispatchPrompt(input);
  return output!;
});

