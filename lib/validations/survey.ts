import { z } from "zod";

export const surveyDesignSchema = z.object({
  title: z.string().min(1, "Title is required"),
  titleEn: z.string().optional(),
  titleRu: z.string().optional(),
  imageUrl: z.string().min(1, "Image is required"),
});

export type SurveyDesignInput = z.infer<typeof surveyDesignSchema>;

export const surveyDesignBulkSchema = z.object({
  action: z.enum(["delete"]),
  ids: z.array(z.string().uuid()).min(1),
});

export const priceBandValues = [
  "UNDER_25",
  "FROM_25_TO_40",
  "FROM_40_TO_55",
  "FROM_55_TO_70",
  "OVER_70",
] as const;

export const surveyResponseSchema = z
  .object({
    designId: z.string().uuid(),
    score: z.number().int().min(0).max(100),
    wouldBuy: z.boolean(),
    priceBand: z.enum(priceBandValues).optional(),
    suggestion: z.string().max(1000).optional(),
  })
  .refine((data) => !data.wouldBuy || !!data.priceBand, {
    message: "Price band is required when you would buy",
    path: ["priceBand"],
  });

export type SurveyResponseInput = z.infer<typeof surveyResponseSchema>;

export const ageBandValues = [
  "UNDER_18",
  "AGE_18_24",
  "AGE_25_34",
  "AGE_35_44",
  "AGE_45_PLUS",
  "UNSPECIFIED",
] as const;

export const genderValues = ["FEMALE", "MALE", "OTHER", "UNSPECIFIED"] as const;

export const surveyDemographicsSchema = z.object({
  ageBand: z.enum(ageBandValues).optional(),
  gender: z.enum(genderValues).optional(),
});

export type SurveyDemographicsInput = z.infer<typeof surveyDemographicsSchema>;
