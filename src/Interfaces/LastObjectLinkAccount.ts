export default interface LastObjectLinkAccount {
    success: boolean;
    database: DatabaseObjectLinked | undefined;
    error?: string;
}
export interface DatabaseObjectLinked {
    id: string;
    username: string;
    guild: string;
    rank: string | undefined;
}
