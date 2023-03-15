/* eslint-disable @typescript-eslint/no-explicit-any */
export interface Rank {
    name: string;
    displayName: string;
    server: string;
    season?: any;
}

export interface User {
    username: string;
    lastSeen: number;
    online: boolean;
}

export interface Member {
    user: User;
    joinDate: string;
}

export interface Owner {
    username: string;
    lastSeen: number;
    online: boolean;
}

export interface Leveling {
    level: number;
    exp: number;
    totalExp: number;
}

export interface Clan {
    name: string;
    tag: string;
    currentTrophies: number;
    creationTime: string;
    members: Member[];
    owner: Owner;
    leveling: Leveling;
}

export interface Rank {
    level: number;
    experience: number;
    percentage: number;
    rankDisplay: string;
}

export interface Friend {
    username: string;
    lastSeen: number;
    online: boolean;
}

export interface PikaUserStatsResponse {
    friendStatus: string;
    discord_verified: boolean;
    lastSeen: number;
    ranks: Rank[];
    email_verified: boolean;
    discord_boosting: boolean;
    clan: Clan;
    rank: Rank;
    friends: Friend[];
    username: string;
}
