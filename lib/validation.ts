import { z } from "zod";

export const couplesSchema = z.object({
  category: z.literal("couples"),
  theme: z.enum(["light", "dark"]),
  yourName: z.string().min(2, "Your name must be at least 2 characters"),
  partnerName: z.string().min(2, "Partner's name must be at least 2 characters"),
  relationshipDate: z.string().optional(),
  message: z.string().min(5, "Love message must be at least 5 characters"),
});

export const friendsSchema = z.object({
  category: z.literal("friends"),
  theme: z.enum(["light", "dark"]),
  yourName: z.string().min(2, "Your name must be at least 2 characters"),
  partnerName: z.string().min(2, "Friend's name must be at least 2 characters"),
  relationshipDate: z.string().min(2, "Friendship date is required"),
  message: z.string().min(5, "Friendship message must be at least 5 characters"),
});

export const breakupSchema = z.object({
  category: z.literal("breakup"),
  theme: z.enum(["light", "dark"]),
  yourName: z.string().min(2, "Your name must be at least 2 characters"),
  partnerName: z.string().min(2, "Ex-partner's name must be at least 2 characters"),
  relationshipDate: z.string().optional(),
  message: z.string().min(5, "Final message must be at least 5 characters"),
});

export const websiteFormSchema = z.discriminatedUnion("category", [
  couplesSchema,
  friendsSchema,
  breakupSchema,
]);

export type CouplesInput = z.infer<typeof couplesSchema>;
export type FriendsInput = z.infer<typeof friendsSchema>;
export type BreakupInput = z.infer<typeof breakupSchema>;
export type WebsiteInput = z.infer<typeof websiteFormSchema>;
