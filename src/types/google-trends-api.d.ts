declare module 'google-trends-api' {
  interface TrendsParams {
    keyword: string;
    startTime?: Date;
    endTime?: Date;
  }

  function interestOverTime(options: TrendsParams): Promise<string>;
  function relatedTopics(options: TrendsParams): Promise<string>;
  function relatedQueries(options: TrendsParams): Promise<string>;

  export { interestOverTime, relatedTopics, relatedQueries };
  export default { interestOverTime, relatedTopics, relatedQueries };
} 