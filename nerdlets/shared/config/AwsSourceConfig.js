export default {
  title: 'Source',
  eventTypes: [
    {
      event: 'DatastoreSample',
      attributes: [
        ['awsAccountId', 'AWS'],
        ['awsRegion', 'AWS'],
        ['provider.bucketName', 'AWS'],
        ['label.Name', 'Tags'],
        ['label.Workflow', 'Tags'],
      ],
    },
  ],
  metrics: [
    {
      title: 'Source Bucket Size (Avg MB)',
      threshold: {
        critical: 500,
        warning: 300,
      },
      query: {
        nrql: `SELECT average(provider.bucketSizeBytes.Average/1000000) as 'result' from DatastoreSample WHERE provider.bucketName like '%source%' and provider = 'S3Bucket'`,
        lookup: 'result',
      },
      detailDashboardId: 'Source-Bucket-Detail',
    },
    {
      title: 'Source 4xx Errors (Count)',
      threshold: {
        critical: 10,
        warning: 5,
      },
      query: {
        nrql: `SELECT sum(provider.error4xxErrors.Sum) as 'result' from DatastoreSample WHERE provider = 'S3BucketRequests' AND entityName like '%source%'`,
        lookup: 'result',
      },
      detailDashboardId: 'Source-4xx-Detail',
    },
    {
      title: 'Source 5xx Errors (Count)',
      threshold: {
        critical: 5,
        warning: 2,
      },
      query: {
        nrql: `SELECT sum(provider.error5xxErrors.Sum) as 'result' from DatastoreSample WHERE provider = 'S3BucketRequests' AND entityName like '%source%'`,
        lookup: 'result',
      },
      detailDashboardId: 'Source-5xx-Detail',
    },
    {
      title: 'Source All Requests',
      threshold: {
        critical: 400,
        warning: 300,
      },
      query: {
        nrql: `SELECT sum(provider.allRequests.Sum) as 'result' from DatastoreSample WHERE provider = 'S3BucketRequests' AND entityName like '%source%'`,
        lookup: 'result',
      },
      detailDashboardId: 'Source-Request-Detail',
    },
    {
      title: 'Source # of Objects (Avg)',
      threshold: {
        critical: 10,
        warning: 8,
      },
      query: {
        nrql: `SELECT average(provider.numberOfObjects.Average) as 'result' from DatastoreSample WHERE provider.bucketName like '%source%'`,
        lookup: 'result',
      },
      detailDashboardId: 'Source-Objects-Detail',
    },
    {
      title: 'Source First Byte Latency - Avg (ms)',
      threshold: {
        critical: 150,
        warning: 100,
      },
      query: {
        nrql: `SELECT average(provider.firstByteLatency.Average) as 'result' from DatastoreSample WHERE provider = 'S3BucketRequests' AND entityName like '%source%'`,
        lookup: 'result',
      },
      detailDashboardId: 'Source-FB-Detail',
    },
    {
      title: 'Source Total Request Latency - Avg (ms)',
      threshold: {
        critical: 200,
        warning: 180,
      },
      query: {
        nrql: `SELECT average(provider.totalRequestLatency.Average) as 'result' from DatastoreSample where provider='S3BucketRequests' where entityName like '%source%'`,
        lookup: 'result',
      },
      detailDashboardId: 'Source-Request-Latency-Detail',
    },
  ],
  overviewDashboard: [
    {
      nrql: `SELECT average(provider.bucketSizeBytes.Average/1000000) as 'MB' from DatastoreSample WHERE provider.bucketName like '%source%' and provider = 'S3Bucket'`,
      columnStart: 1,
      columnEnd: 3,
      chartSize: 'small',
      chartType: 'billboard',
      title: 'Source Bucket Size (MB)',
      useSince: true,
    },
    {
      nrql: `SELECT average(provider.bucketSizeBytes.Average/1000000) as 'MB' from DatastoreSample WHERE provider.bucketName like '%source%' and provider = 'S3Bucket'`,
      columnStart: 4,
      columnEnd: 12,
      chartSize: 'small',
      chartType: 'line',
      title: 'Source Bucket Size (MB)',
      useSince: true,
    },
    {
      nrql: `SELECT sum(provider.error4xxErrors.Sum) as '4xx Errors' from DatastoreSample WHERE provider = 'S3BucketRequests' AND entityName like '%source%'`,
      columnStart: 1,
      columnEnd: 3,
      chartSize: 'small',
      chartType: 'billboard',
      title: 'Source 4xx Errors',
      useSince: true,
    },
    {
      nrql: `SELECT sum(provider.error4xxErrors.Sum) as '4xx Errors' from DatastoreSample WHERE provider = 'S3BucketRequests' AND entityName like '%source%'`,
      columnStart: 4,
      columnEnd: 12,
    chartSize: 'small',
      chartType: 'line',
      title: 'Source 4xx Errors',
      useSince: true,
    },
    {
      nrql: `SELECT sum(provider.error5xxErrors.Sum) as '5xx Errors' from DatastoreSample WHERE provider = 'S3BucketRequests' AND entityName like '%source%'`,
      columnStart: 1,
      columnEnd: 3,
      chartSize: 'small',
      chartType: 'billboard',
      title: 'Source 5xx Errors',
      useSince: true,
    },
    {
      nrql: `SELECT sum(provider.error5xxErrors.Sum) as '5xx Errors' from DatastoreSample WHERE provider = 'S3BucketRequests' AND entityName like '%source%'`,
      columnStart: 4,
      columnEnd: 12,
      chartSize: 'small',
      chartType: 'line',
      title: 'Source 5xx Errors',
      useSince: true,
    },
    {
      nrql: `SELECT sum(provider.allRequests.Sum) as 'Requests' from DatastoreSample WHERE provider = 'S3BucketRequests' AND entityName like '%source%'`,
      columnStart: 1,
      columnEnd: 3,
      chartSize: 'small',
      chartType: 'billboard',
      title: 'Source All Requests',
      useSince: true,
    },
    {
      nrql: `SELECT sum(provider.allRequests.Sum) as 'Requests' from DatastoreSample WHERE provider = 'S3BucketRequests' AND entityName like '%source%'`,
      columnStart: 4,
      columnEnd: 12,
      chartSize: 'small',
      chartType: 'line',
      title: 'Source All Requests',
      useSince: true,
    },
    {
      nrql: `SELECT average(provider.firstByteLatency.Average) as 'ms' from DatastoreSample WHERE provider = 'S3BucketRequests' AND entityName like '%source%'`,
      columnStart: 1,
      columnEnd: 3,
      chartSize: 'small',
      chartType: 'billboard',
      title: 'Source First Byte Latency (Avg - ms)',
      useSince: true,
    },
    {
      nrql: `SELECT average(provider.firstByteLatency.Average) as 'ms' from DatastoreSample WHERE provider = 'S3BucketRequests' AND entityName like '%source%'`,
      columnStart: 4,
      columnEnd: 12,
      chartSize: 'small',
      chartType: 'line',
      title: 'Source First Byte Latency (Avg - ms)',
      useSince: true,
    },
    {
      nrql: `SELECT average(provider.totalRequestLatency.Average) as 'ms' from DatastoreSample where provider='S3BucketRequests' where entityName like '%source%'`,
      columnStart: 1,
      columnEnd: 3,
      chartSize: 'small',
      chartType: 'billboard',
      title: 'Views Source Total Request Latency (Avg - ms)',
      useSince: true,
    },
    {
      nrql: `SELECT average(provider.totalRequestLatency.Average) as 'ms' from DatastoreSample where provider='S3BucketRequests' where entityName like '%source%'`,
      columnStart: 4,
      columnEnd: 12,
      chartSize: 'small',
      chartType: 'line',
      title: 'Views Source Total Request Latency (Avg - ms)',
      useSince: true,
    }
  ],
  detailDashboards: [
    {
      id: 'Source-Bucket-Detail',
      config: [
        {
          nrql: `SELECT average(provider.bucketSizeBytes.Average/1000000) as 'MB' from DatastoreSample WHERE provider.bucketName like '%source%' and provider = 'S3Bucket'`,
          columnStart: 1,
          columnEnd: 3,
          chartSize: 'medium',
          chartType: 'billboard',
          title: 'Source Bucket Size (MB)',
          useSince: true,
        },
        {
          nrql: `SELECT average(provider.bucketSizeBytes.Average/1000000) as 'MB' from DatastoreSample WHERE provider.bucketName like '%source%' and provider = 'S3Bucket'`,
          columnStart: 4,
          columnEnd: 12,
          chartSize: 'medium',
          chartType: 'line',
          title: 'Source Bucket Size (MB)',
          useSince: true,
        }
      ],
    },
    {
      id: 'Source-4xx-Detail',
      config: [
        {
          nrql: `SELECT sum(provider.error4xxErrors.Sum) as '4xx Errors' from DatastoreSample WHERE provider = 'S3BucketRequests' AND entityName like '%source%'`,
          columnStart: 1,
          columnEnd: 3,
          chartSize: 'medium',
          chartType: 'billboard',
          title: 'Source 4xx Errors',
          useSince: true,
        },
        {
          nrql: `SELECT sum(provider.error4xxErrors.Sum) as '4xx Errors' from DatastoreSample WHERE provider = 'S3BucketRequests' AND entityName like '%source%'`,
          columnStart: 4,
          columnEnd: 12,
          chartSize: 'medium',
          chartType: 'line',
          title: 'Source 4xx Errors',
          useSince: true,
        }
      ],
    },
    {
      id: 'Source-5xx-Detail',
      config: [
        {
          nrql: `SELECT sum(provider.error5xxErrors.Sum) as '5xx Errors' from DatastoreSample WHERE provider = 'S3BucketRequests' AND entityName like '%source%'`,
          columnStart: 1,
          columnEnd: 3,
          chartSize: 'medium',
          chartType: 'billboard',
          title: 'Source 5xx Errors',
          useSince: true,
        },
        {
          nrql: `SELECT sum(provider.error5xxErrors.Sum) as '5xx Errors' from DatastoreSample WHERE provider = 'S3BucketRequests' AND entityName like '%source%'`,
          columnStart: 4,
          columnEnd: 12,
          chartSize: 'medium',
          chartType: 'line',
          title: 'Source 5xx Errors',
          useSince: true,
        }
      ],
    },
    {
      id: 'Source-Request-Detail',
      config: [
        {
          nrql: `SELECT sum(provider.allRequests.Sum) as 'Requests' from DatastoreSample WHERE provider = 'S3BucketRequests' AND entityName like '%source%'`,
          columnStart: 1,
          columnEnd: 3,
          chartSize: 'medium',
          chartType: 'billboard',
          title: 'Source All Requests',
          useSince: true,
        },
        {
          nrql: `SELECT sum(provider.allRequests.Sum) as 'Requests' from DatastoreSample WHERE provider = 'S3BucketRequests' AND entityName like '%source%'`,
          columnStart: 4,
          columnEnd: 12,
          chartSize: 'medium',
          chartType: 'line',
          title: 'Source All Requests',
          useSince: true,
        }
      ],
    },
    {
      id: 'Source-Objects-Detail',
      config: [
        {
          nrql: `SELECT average(provider.numberOfObjects.Average) as 'Objects' from DatastoreSample WHERE provider.bucketName like '%source%'`,
          columnStart: 1,
          columnEnd: 3,
          chartSize: 'medium',
          chartType: 'billboard',
          title: 'Source # of Objects',
          useSince: true,
        },
        {
          nrql: `SELECT average(provider.numberOfObjects.Average) as 'Objects' from DatastoreSample WHERE provider.bucketName like '%source%'`,
          columnStart: 4,
          columnEnd: 12,
          chartSize: 'medium',
          chartType: 'line',
          title: 'Source # of Objects',
          useSince: true,
        }
      ],
    },
    {
      id: 'Source-FB-Detail',
      config: [
        {
          nrql: `SELECT average(provider.firstByteLatency.Average) as 'ms' from DatastoreSample WHERE provider = 'S3BucketRequests' AND entityName like '%source%'`,
          columnStart: 1,
          columnEnd: 3,
          chartSize: 'medium',
          chartType: 'billboard',
          title: 'Source First Byte Latency (Avg - ms)',
          useSince: true,
        },
        {
          nrql: `SELECT average(provider.firstByteLatency.Average) as 'ms' from DatastoreSample WHERE provider = 'S3BucketRequests' AND entityName like '%source%'`,
          columnStart: 4,
          columnEnd: 12,
          chartSize: 'medium',
          chartType: 'line',
          title: 'Source First Byte Latency (Avg - ms)',
          useSince: true,
        }
      ],
    },
    {
      id: 'Source-Request-Latency-Detail',
      config: [
        {
          nrql: `SELECT average(provider.totalRequestLatency.Average) as 'ms' from DatastoreSample where provider='S3BucketRequests' where entityName like '%source%'`,
          columnStart: 1,
          columnEnd: 3,
          chartSize: 'medium',
          chartType: 'billboard',
          title: 'Views Source Total Request Latency (Avg - ms)',
          useSince: true,
        },
        {
          nrql: `SELECT average(provider.totalRequestLatency.Average) as 'ms' from DatastoreSample where provider='S3BucketRequests' where entityName like '%source%'`,
          columnStart: 4,
          columnEnd: 12,
          chartSize: 'medium',
          chartType: 'line',
          title: 'Views Source Total Request Latency (Avg - ms)',
          useSince: true,
        }
      ],
    },
  ],
}
