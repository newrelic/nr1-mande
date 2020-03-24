export default {
  title: 'APIs',
  metrics: [
    {
      title: '5xx Error Rate',
      query: {
        nrql: `SELECT percentage(count(*), where httpResponseCode like '5%') as 'result' FROM Transaction`,
        lookup: 'result',
      },
    },
    {
      title: 'Non 5xx Error Rate',
      threshold: {
        critical: 5.5,
        warning: 4.9,
      },
      query: {
        nrql: `SELECT percentage(count(*), where httpResponseCode like '4%') as 'result' FROM Transaction`,
        lookup: 'result',
      },
    },
    {
      title: 'Latency 90th Percentile',
      query: {
        nrql: `SELECT percentile(duration, 90) as 'percentile' FROM Transaction`,
        lookup: 'percentile',
      },
    },
  ],
}