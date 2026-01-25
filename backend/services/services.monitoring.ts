import snowflake from 'snowflake-sdk';
import { Metrics } from '../types/types.index';
import { snowflakeConnections, saveMetrics } from '../config/config.database';
import { resolve } from 'path/win32';

export async function collectMetrics(userId: string): Promise<Metrics | void> {
    const creds = snowflakeConnections.get(userId);
    if (!creds) return;

    try {
        const connection = snowflake.createConnection({
            account: creds.hostAccount,
            username: creds.givenUsername,
            password: creds.givenPassword
        });

        await new Promise<void>((resolve, reject) =>{
            connection.connect((err, conn) => err ? reject(err) : resolve(err));
        })

        const result = await new Promise<any>((resolve, reject) => {
            connection.execute({
                sqlText: `
                    SELECT
                        COUNT(*) as query_count,
                        SUM(TOTAL_ELAPSED_TIME) as total_time,
                        AVG(TOTAL_ELAPSED_TIME) as avg_time,
                    FROM SNOWFLAKE.ACCOUNT_USAGE.QUERY_HISTORY
                    WHERES START_TIME > DATEADD(minute, -5, CURRENT_TIMESTAMP())`,
                    complete: (err, stmt, rows) => {
                        if (err) reject(err);
                        else resolve(rows![0]);
                    }
            });
        });
        connection.destroy((err) => {
            if (err) console.log('Error disconnecting: ', err);
        });

        const metrics:Metrics = {
            timestamp: new Date(),
            queryCount: result.QUERY_COUNT || 0,
            totalTime: result.TOTAL_TIME || 0,
            avgTime: result.AVG_TIME || 0
        }

        saveMetrics(userId, metrics);

        console.log(`Metrics collected for user ${userId}: `, metrics);


    } catch (error){
        console.log('Error collecting metrics for user ', userId, ': ', error);
    }
}

export function startMetricsCollectionInterval(userId: string, intervalMs: number = 5 * 60 * 1000): void {
    setInterval(() => {
        collectMetrics(userId);
    }, intervalMs);

    console.log(`Started metrics collection interval for user ${userId} every ${intervalMs / 60000} minutes.`);
}

export function startBackgroundMonitoring(): void {
  setInterval(() => {
    for (const userId of snowflakeConnections.keys()) {
      collectMetrics(userId);
    }
  }, 5 * 60 * 1000); // 5 minutes
  
  console.log('Background monitoring started');
}

