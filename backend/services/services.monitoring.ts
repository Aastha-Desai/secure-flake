import snowflake from 'snowflake-sdk';
import { Metrics } from '../types/types.index';
import { snowflakeConnections, saveMetrics } from '../config/config.database';

export async function collectMetrics(userId: string): Promise<Metrics | void> {
    const creds = snowflakeConnections.get(userId);
    if (!creds) {
        console.log(`No credentials found for user ${userId}`);
        return;
    }

    try {
        console.log(`Starting metrics collection for user ${userId}...`);
        
        const connection = snowflake.createConnection({
            account: creds.hostAccount,
            username: creds.givenUsername,
            password: creds.givenPassword
        });

        await new Promise<void>((resolve, reject) => {
            connection.connect((err, conn) => err ? reject(err) : resolve()); // FIXED: was resolve(err)
        });

        console.log(`Connected to Snowflake for user ${userId}`);

        const result = await new Promise<any>((resolve, reject) => {
            connection.execute({
                sqlText: `
                    SELECT
                        COUNT(*) as query_count,
                        SUM(TOTAL_ELAPSED_TIME) as total_time,
                        AVG(TOTAL_ELAPSED_TIME) as avg_time
                    FROM SNOWFLAKE.ACCOUNT_USAGE.QUERY_HISTORY
                    WHERE START_TIME > DATEADD(minute, -5, CURRENT_TIMESTAMP())`,
                complete: (err, stmt, rows) => {
                    if (err) reject(err);
                    else resolve(rows![0]);
                }
            });
        });

        connection.destroy((err) => {
            if (err) console.log('Error disconnecting: ', err);
        });

        const metrics: Metrics = {
            timestamp: new Date(),
            queryCount: result.QUERY_COUNT || 0,
            totalTime: result.TOTAL_TIME || 0,
            avgTime: result.AVG_TIME || 0
        }

        saveMetrics(userId, metrics);
        console.log(`Metrics collected for user ${userId}:`, metrics);
        
        return metrics; // Return the metrics

    } catch (error) {
        console.log('Error collecting metrics for user', userId, ':', error);
    }
}

export function startMetricsCollectionInterval(userId: string, intervalMs: number = 5 * 60 * 1000): NodeJS.Timeout {
    // Collect immediately first!
    collectMetrics(userId);
    
    // Then set up the interval
    const intervalId = setInterval(() => {
        collectMetrics(userId);
    }, intervalMs);

    console.log(`Started metrics collection for user ${userId} every ${intervalMs / 60000} minutes.`);
    
    return intervalId; // Return so you can clear it later if needed
}

export function startBackgroundMonitoring(): void {
    // Collect immediately for all users
    for (const userId of snowflakeConnections.keys()) {
        collectMetrics(userId);
    }

    // Then set up interval
    setInterval(() => {
        for (const userId of snowflakeConnections.keys()) {
            collectMetrics(userId);
        }
    }, 5 * 60 * 1000);
  
    console.log('Background monitoring started - collecting every 5 minutes');
}