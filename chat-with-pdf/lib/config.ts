import z from "zod";

const envSchema = z.object({
  GOOGLE_API_KEY: z.string().min(1),
  PINECONE_API_KEY: z.string().min(1),
  PINECONE_INDEX_NAME: z.string().min(1),
  PINECONE_NAME_SPACE: z.string().optional().default("default"),
});

export const env = envSchema.parse(process.env);