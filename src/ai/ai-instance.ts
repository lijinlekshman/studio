import {genkit} from 'genkit';
import {googleAI} from '@genkit-ai/googleai';

// Provide a fallback empty string if the API key is not set
// This can help prevent errors during server-side processing or build time
// if the environment variable isn't available in that context.
const apiKey = process.env.GOOGLE_GENAI_API_KEY || "";

export const ai = genkit({
  promptDir: './prompts',
  plugins: [
    googleAI({
      apiKey: apiKey,
    }),
  ],
  model: 'googleai/gemini-2.0-flash',
  // Consider enabling tracing and metrics in a dedicated Genkit server environment
  // enableTracingAndMetrics: true,
});
