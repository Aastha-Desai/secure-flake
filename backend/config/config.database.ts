import { User, SnowflakeConnection, Metrics } from '../types/types.index.js';

// Remove 'new' from the type annotation - just initialize directly
export const users = new Map<string, User>();
export const snowflakeConnections = new Map<string, SnowflakeConnection>();
export const metricHistory = new Map<string, Metrics[]>();

export function createUser(user: User): void {
    users.set(user.email, user);
}

export function getUserByEmail(email: string): User | undefined {
    return users.get(email);
}

export function saveSnowflakeConnection(userId: string, connection: SnowflakeConnection): void {
    snowflakeConnections.set(userId, connection);
}

export function getSnowflakeConnection(userId: string): SnowflakeConnection | undefined {
    return snowflakeConnections.get(userId);
}

export function saveMetrics(userId: string, metrics: Metrics): void {
    if (!metricHistory.has(userId)) {
        metricHistory.set(userId, []);
    }
    metricHistory.get(userId)!.push(metrics);
}

export function getMetrics(userId: string): Metrics[] | undefined {
    return metricHistory.get(userId);
}