export interface User {
    id: string;
    email: string;
    password: string;
    createdAt: Date;
}

export interface SnowflakeConnection {
    hostAccount: string;
    givenUsername: string;
    givenPassword: string;
}

export interface Metrics {
    timestamp: Date;
    queryCount: number;
    totalTime: number;
    avgTime: number;
}

declare module 'express-session' {
    interface SessionData {
        userId: string;
    }
}