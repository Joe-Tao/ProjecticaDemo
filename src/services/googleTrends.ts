import googleTrends from 'google-trends-api';

interface TimelineData {
  time: string;
  value: number;
  formattedTime: string;
  formattedValue: string;
}

interface TopicData {
  topic: {
    title: string;
    type: string;
  };
  value: number;
  formattedValue: string;
}

interface QueryData {
  query: string;
  value: number;
  formattedValue: string;
}

export interface TrendsData {
  interestOverTime: {
    default: {
      timelineData: TimelineData[];
    };
  };
  relatedTopics: {
    default: {
      rankedList: Array<{
        rankedKeyword: TopicData[];
      }>;
    };
  };
  relatedQueries: {
    default: {
      rankedList: Array<{
        rankedKeyword: QueryData[];
      }>;
    };
  };
}

async function retryOperation<T>(
  operation: () => Promise<T>,
  retries = 3,
  delay = 1000
): Promise<T> {
  try {
    return await operation();
  } catch (error) {
    if (retries > 0) {
      await new Promise(resolve => setTimeout(resolve, delay));
      return retryOperation(operation, retries - 1, delay * 2);
    }
    throw error;
  }
}

async function fetchTrendsData(params: { keyword: string; startTime?: Date; endTime: Date }) {
  try {
    const result = await retryOperation(() => googleTrends.interestOverTime(params));
    return JSON.parse(result);
  } catch (error) {
    console.error('Error fetching interest over time:', error);
    throw error;
  }
}

async function fetchRelatedTopics(params: { keyword: string; startTime?: Date; endTime: Date }) {
  try {
    const result = await retryOperation(() => googleTrends.relatedTopics(params));
    return JSON.parse(result);
  } catch (error) {
    console.error('Error fetching related topics:', error);
    throw error;
  }
}

async function fetchRelatedQueries(params: { keyword: string; startTime?: Date; endTime: Date }) {
  try {
    const result = await retryOperation(() => googleTrends.relatedQueries(params));
    return JSON.parse(result);
  } catch (error) {
    console.error('Error fetching related queries:', error);
    throw error;
  }
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

    const params = {
      keyword: query,
      startTime,
      endTime,
    };

    // Get all data with individual error handling
    const [interestOverTime, relatedTopics, relatedQueries] = await Promise.all([
      fetchTrendsData(params).catch(error => {
        console.error('Interest over time fetch failed:', error);
        return null;
      }),
      fetchRelatedTopics(params).catch(error => {
        console.error('Related topics fetch failed:', error);
        return null;
      }),
      fetchRelatedQueries(params).catch(error => {
        console.error('Related queries fetch failed:', error);
        return null;
      })
    ]);

    // If all requests failed, return null
    if (!interestOverTime && !relatedTopics && !relatedQueries) {
      throw new Error('All Google Trends API requests failed');
    }

    // Return partial data if some requests succeeded
    return {
      interestOverTime: interestOverTime || { default: { timelineData: [] } },
      relatedTopics: relatedTopics || { default: { rankedList: [{ rankedKeyword: [] }] } },
      relatedQueries: relatedQueries || { default: { rankedList: [{ rankedKeyword: [] }] } }
    };
  } catch (error) {
    console.error('Google Trends API Error:', error);
    if (error instanceof Error) {
      console.error('Error details:', error.message);
      console.error('Error stack:', error.stack);
    }
    return null;
  }
} 