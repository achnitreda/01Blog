import { Role } from "./role.enum";

export interface User {
    id: number;
    username: string;
    email: string;
    role: Role;
    banned: boolean;
    banReason?: string | null;
    bannedAt?: string | null;
    createdAt: string;
}
