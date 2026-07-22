/* Barrel for the quote-form model. Existing imports of "../data" / "./data"
   keep working — the module was split by concern:
   - types.ts          form model types (Question, Questionnaire, Answers…)
   - services.ts       Step 1 service cards + ?servicio= deep-link resolution
   - questionnaires.ts Step 2 content — one questionnaire per business line
   - contact.ts        Step 3 fields, preferred channels, step metadata
   - validation.ts     Zod schemas + shared answer/format checks */

export * from "./types";
export * from "./services";
export * from "./questionnaires";
export * from "./contact";
export * from "./validation";
