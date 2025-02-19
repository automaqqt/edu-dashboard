import { DocType, UserRole } from "@/lib/constants";

export type UserRole = typeof UserRole[keyof typeof UserRole];
export type DocType = typeof DocType[keyof typeof DocType];