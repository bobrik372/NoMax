import { z } from "zod";
export declare const Username: z.ZodString;
export declare const Nickname: z.ZodString;
export declare const DisplayName: z.ZodString;
export declare const SettingsSchema: z.ZodObject<{
    theme: z.ZodDefault<z.ZodEnum<["light", "dark"]>>;
    fontScale: z.ZodDefault<z.ZodNumber>;
    language: z.ZodDefault<z.ZodEnum<["ru", "en"]>>;
}, "strip", z.ZodTypeAny, {
    theme: "light" | "dark";
    fontScale: number;
    language: "ru" | "en";
}, {
    theme?: "light" | "dark" | undefined;
    fontScale?: number | undefined;
    language?: "ru" | "en" | undefined;
}>;
export declare const RegisterResponse: z.ZodObject<{
    passphrase: z.ZodString;
}, "strip", z.ZodTypeAny, {
    passphrase: string;
}, {
    passphrase: string;
}>;
export declare const LoginRequest: z.ZodObject<{
    passphrase: z.ZodString;
}, "strip", z.ZodTypeAny, {
    passphrase: string;
}, {
    passphrase: string;
}>;
export declare const LoginResponse: z.ZodObject<{
    accessToken: z.ZodString;
    user: z.ZodObject<{
        username: z.ZodString;
        displayName: z.ZodString;
        nickname: z.ZodString;
        avatarUrl: z.ZodNullable<z.ZodString>;
    }, "strip", z.ZodTypeAny, {
        username: string;
        displayName: string;
        nickname: string;
        avatarUrl: string | null;
    }, {
        username: string;
        displayName: string;
        nickname: string;
        avatarUrl: string | null;
    }>;
}, "strip", z.ZodTypeAny, {
    accessToken: string;
    user: {
        username: string;
        displayName: string;
        nickname: string;
        avatarUrl: string | null;
    };
}, {
    accessToken: string;
    user: {
        username: string;
        displayName: string;
        nickname: string;
        avatarUrl: string | null;
    };
}>;
export declare const ChangePasswordRequest: z.ZodObject<{
    currentPassphrase: z.ZodString;
    newPassphrase: z.ZodString;
}, "strip", z.ZodTypeAny, {
    currentPassphrase: string;
    newPassphrase: string;
}, {
    currentPassphrase: string;
    newPassphrase: string;
}>;
export declare const SendMessageRequest: z.ZodObject<{
    to: z.ZodString;
    type: z.ZodEnum<["text", "image", "video", "audio"]>;
    text: z.ZodOptional<z.ZodString>;
    mediaId: z.ZodOptional<z.ZodString>;
}, "strip", z.ZodTypeAny, {
    type: "text" | "image" | "video" | "audio";
    to: string;
    text?: string | undefined;
    mediaId?: string | undefined;
}, {
    type: "text" | "image" | "video" | "audio";
    to: string;
    text?: string | undefined;
    mediaId?: string | undefined;
}>;
export declare const SearchRequest: z.ZodObject<{
    q: z.ZodString;
}, "strip", z.ZodTypeAny, {
    q: string;
}, {
    q: string;
}>;
export declare const BlockRequest: z.ZodObject<{
    username: z.ZodString;
}, "strip", z.ZodTypeAny, {
    username: string;
}, {
    username: string;
}>;
