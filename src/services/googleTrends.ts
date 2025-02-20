import googleTrends from 'google-trends-api';

export interface TrendsData {
  interestOverTime: any;
  relatedTopics: any;
  relatedQueries: any;
}

export async function getTrendsData(query: string, timeframe: string): Promise<TrendsData | null> {
  try {
    let startTime: Date | undefined;
    const endTime = new Date();

    // Set time range
    switch (timeframe) {
      case 'current':
        startTime = new Date(endTime.getTime() - 7 * 24 * 60 * 60 * 1000); // recent 7 days 
        break;
      case 'historical':
        startTime = new Date(endTime.getTime() - 365 * 24 * 60 * 60 * 1000); // recent 1 year
        break;
      case 'forecast':
        startTime = new Date(endTime.getTime() - 30 * 24 * 60 * 60 * 1000); // recent 30 days
        break;
    }

    // Get all data in parallel
    const [interestOverTime, relatedTopics, relatedQueries] = await Promise.all([
      googleTrends.interestOverTime({
        keyword: query,
        startTime,
        endTime,
      }),
      googleTrends.relatedTopics({
        keyword: query,
        startTime,
        endTime,
      }),
      googleTrends.relatedQueries({
        keyword: query,
        startTime,
        endTime,
      })
    ]);

    return {
      interestOverTime: JSON.parse(interestOverTime),
      relatedTopics: JSON.parse(relatedTopics),
      relatedQueries: JSON.parse(relatedQueries)
    };
  } catch (error) {
    console.error('Google Trends API Error:', error);
    return null;
  }
} 