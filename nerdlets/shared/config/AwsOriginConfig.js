export default {
  title: 'Deliver - Origin',
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
  overviewConfig: [
    {
      nrql: `SELECT average(provider.bucketSizeBytes.Average/1000000) as 'MB' from DatastoreSample WHERE provider.bucketName like '%destination%' and provider = 'S3Bucket'`,
      columnStart: 1,
      columnEnd: 3,
      chartSize: 'small',
      chartType: 'billboard',
      title: 'Origin Bucket Size (MB)',
      useSince: true,
    },
    {
      nrql: `SELECT average(provider.bucketSizeBytes.Average/1000000) as 'MB' from DatastoreSample WHERE provider.bucketName like '%destination%' and provider = 'S3Bucket'`,
      columnStart: 4,
      columnEnd: 12,
      chartSize: 'small',
      chartType: 'line',
      title: 'Origin Bucket Size (MB)',
      useSince: true,
    },
    {
      nrql: `SELECT sum(provider.error4xxErrors.Sum) as '4xx Errors' from DatastoreSample WHERE provider = 'S3BucketRequests' AND entityName like '%destination%'`,
      columnStart: 1,
      columnEnd: 3,
      chartSize: 'small',
      chartType: 'billboard',
      title: 'Origin 4xx Errors',
      useSince: true,
    },
    {
      nrql: `SELECT sum(provider.error4xxErrors.Sum) as '4xx Errors' from DatastoreSample WHERE provider = 'S3BucketRequests' AND entityName like '%destination%'`,
      columnStart: 4,
      columnEnd: 12,
    chartSize: 'small',
      chartType: 'line',
      title: 'Origin 4xx Errors',
      useSince: true,
    },
    {
      nrql: `SELECT sum(provider.error5xxErrors.Sum) as '5xx Errors' from DatastoreSample WHERE provider = 'S3BucketRequests' AND entityName like '%destination%'`,
      columnStart: 1,
      columnEnd: 3,
      chartSize: 'small',
      chartType: 'billboard',
      title: 'Origin 5xx Errors',
      useSince: true,
    },
    {
      nrql: `SELECT sum(provider.error5xxErrors.Sum) as '5xx Errors' from DatastoreSample WHERE provider = 'S3BucketRequests' AND entityName like '%destination%'`,
      columnStart: 4,
      columnEnd: 12,
      chartSize: 'small',
      chartType: 'line',
      title: 'Origin 5xx Errors',
      useSince: true,
    },
    {
      nrql: `SELECT sum(provider.allRequests.Sum) as 'Requests' from DatastoreSample WHERE provider = 'S3BucketRequests' AND entityName like '%destination%'`,
      columnStart: 1,
      columnEnd: 3,
      chartSize: 'small',
      chartType: 'billboard',
      title: 'Origin All Requests',
      useSince: true,
    },
    {
      nrql: `SELECT sum(provider.allRequests.Sum) as 'Requests' from DatastoreSample WHERE provider = 'S3BucketRequests' AND entityName like '%destination%'`,
      columnStart: 4,
      columnEnd: 12,
      chartSize: 'small',
      chartType: 'line',
      title: 'Origin All Requests',
      useSince: true,
    },
    {
      nrql: `SELECT average(provider.firstByteLatency.Average) as 'ms' from DatastoreSample WHERE provider = 'S3BucketRequests' AND entityName like '%destination%'`,
      columnStart: 1,
      columnEnd: 3,
      chartSize: 'small',
      chartType: 'billboard',
      title: 'Origin First Byte Latency (Avg - ms)',
      useSince: true,
    },
    {
      nrql: `SELECT average(provider.firstByteLatency.Average) as 'ms' from DatastoreSample WHERE provider = 'S3BucketRequests' AND entityName like '%destination%'`,
      columnStart: 4,
      columnEnd: 12,
      chartSize: 'small',
      chartType: 'line',
      title: 'Origin First Byte Latency (Avg - ms)',
      useSince: true,
    },
    {
      nrql: `SELECT average(provider.totalRequestLatency.Average) as 'ms' from DatastoreSample where provider='S3BucketRequests' where entityName like '%destination%'`,
      columnStart: 1,
      columnEnd: 3,
      chartSize: 'small',
      chartType: 'billboard',
      title: 'Views destination Total Request Latency (Avg - ms)',
      useSince: true,
    },
    {
      nrql: `SELECT average(provider.totalRequestLatency.Average) as 'ms' from DatastoreSample where provider='S3BucketRequests' where entityName like '%destination%'`,
      columnStart: 4,
      columnEnd: 12,
      chartSize: 'small',
      chartType: 'line',
      title: 'Views destination Total Request Latency (Avg - ms)',
      useSince: true,
    }
  ],
  metrics: [
    {
      title: 'Origin Bucket Size (Avg MB)',
      threshold: {
        critical: 500,
        warning: 300,
      },
      query: {
        nrql: `SELECT average(provider.bucketSizeBytes.Average/1000000) as 'result' from DatastoreSample WHERE provider.bucketName like '%destination%' and provider = 'S3Bucket'`,
        lookup: 'result',
      },
      detailConfig: [
        {
          nrql: `SELECT average(provider.bucketSizeBytes.Average/1000000) as 'MB' from DatastoreSample WHERE provider.bucketName like '%destination%' and provider = 'S3Bucket'`,
          columnStart: 1,
          columnEnd: 3,
          chartSize: 'medium',
          chartType: 'billboard',
          title: 'Origin Bucket Size (MB)',
          useSince: true,
        },
        {
          nrql: `SELECT average(provider.bucketSizeBytes.Average/1000000) as 'MB' from DatastoreSample WHERE provider.bucketName like '%destination%' and provider = 'S3Bucket'`,
          columnStart: 4,
          columnEnd: 12,
          chartSize: 'medium',
          chartType: 'line',
          title: 'Origin Bucket Size (MB)',
          useSince: true,
        }
      ],
    },
    {
      title: 'Origin 4xx Errors (Count)',
      threshold: {
        critical: 10,
        warning: 5,
      },
      query: {
        nrql: `SELECT sum(provider.error4xxErrors.Sum) as 'result' from DatastoreSample WHERE provider = 'S3BucketRequests' AND entityName like '%destination%'`,
        lookup: 'result',
      },
      detailConfig: [
        {
          nrql: `SELECT sum(provider.error4xxErrors.Sum) as '4xx Errors' from DatastoreSample WHERE provider = 'S3BucketRequests' AND entityName like '%destination%'`,
          columnStart: 1,
          columnEnd: 3,
          chartSize: 'medium',
          chartType: 'billboard',
          title: 'Origin 4xx Errors',
          useSince: true,
        },
        {
          nrql: `SELECT sum(provider.error4xxErrors.Sum) as '4xx Errors' from DatastoreSample WHERE provider = 'S3BucketRequests' AND entityName like '%destination%'`,
          columnStart: 4,
          columnEnd: 12,
          chartSize: 'medium',
          chartType: 'line',
          title: 'Origin 4xx Errors',
          useSince: true,
        }
      ],
    },
    {
      title: 'Origin 5xx Errors (Count)',
      threshold: {
        critical: 5,
        warning: 2,
      },
      query: {
        nrql: `SELECT sum(provider.error5xxErrors.Sum) as 'result' from DatastoreSample WHERE provider = 'S3BucketRequests' AND entityName like '%destination%'`,
        lookup: 'result',
      },
      detailConfig: [
        {
          nrql: `SELECT sum(provider.error5xxErrors.Sum) as '5xx Errors' from DatastoreSample WHERE provider = 'S3BucketRequests' AND entityName like '%destination%'`,
          columnStart: 1,
          columnEnd: 3,
          chartSize: 'medium',
          chartType: 'billboard',
          title: 'Origin 5xx Errors',
          useSince: true,
        },
        {
          nrql: `SELECT sum(provider.error5xxErrors.Sum) as '5xx Errors' from DatastoreSample WHERE provider = 'S3BucketRequests' AND entityName like '%destination%'`,
          columnStart: 4,
          columnEnd: 12,
          chartSize: 'medium',
          chartType: 'line',
          title: 'Origin 5xx Errors',
          useSince: true,
        }
      ],
    },
    {
      title: 'Origin All Requests',
      threshold: {
        critical: 400,
        warning: 300,
      },
      query: {
        nrql: `SELECT sum(provider.allRequests.Sum) as 'result' from DatastoreSample WHERE provider = 'S3BucketRequests' AND entityName like '%destination%'`,
        lookup: 'result',
      },
      detailConfig: [
        {
          nrql: `SELECT sum(provider.allRequests.Sum) as 'Requests' from DatastoreSample WHERE provider = 'S3BucketRequests' AND entityName like '%destination%'`,
          columnStart: 1,
          columnEnd: 3,
          chartSize: 'medium',
          chartType: 'billboard',
          title: 'Origin All Requests',
          useSince: true,
        },
        {
          nrql: `SELECT sum(provider.allRequests.Sum) as 'Requests' from DatastoreSample WHERE provider = 'S3BucketRequests' AND entityName like '%destination%'`,
          columnStart: 4,
          columnEnd: 12,
          chartSize: 'medium',
          chartType: 'line',
          title: 'Origin All Requests',
          useSince: true,
        }
      ],
    },
    {
      title: 'Origin # of Objects (Avg)',
      threshold: {
        critical: 10,
        warning: 8,
      },
      query: {
        nrql: `SELECT average(provider.numberOfObjects.Average) as 'result' from DatastoreSample WHERE provider.bucketName like '%destination%'`,
        lookup: 'result',
      },
      detailConfig: [
        {
          nrql: `SELECT average(provider.numberOfObjects.Average) as 'Objects' from DatastoreSample WHERE provider.bucketName like '%destination%'`,
          columnStart: 1,
          columnEnd: 3,
          chartSize: 'medium',
          chartType: 'billboard',
          title: 'Origin # of Objects',
          useSince: true,
        },
        {
          nrql: `SELECT average(provider.numberOfObjects.Average) as 'Objects' from DatastoreSample WHERE provider.bucketName like '%destination%'`,
          columnStart: 4,
          columnEnd: 12,
          chartSize: 'medium',
          chartType: 'line',
          title: 'Origin # of Objects',
          useSince: true,
        }
      ],
    },
    {
      title: 'Origin First Byte Latency - Avg (ms)',
      threshold: {
        critical: 150,
        warning: 100,
      },
      query: {
        nrql: `SELECT average(provider.firstByteLatency.Average) as 'result' from DatastoreSample WHERE provider = 'S3BucketRequests' AND entityName like '%destination%'`,
        lookup: 'result',
      },
      detailConfig: [
        {
          nrql: `SELECT average(provider.firstByteLatency.Average) as 'ms' from DatastoreSample WHERE provider = 'S3BucketRequests' AND entityName like '%destination%'`,
          columnStart: 1,
          columnEnd: 3,
          chartSize: 'medium',
          chartType: 'billboard',
          title: 'Origin First Byte Latency (Avg - ms)',
          useSince: true,
        },
        {
          nrql: `SELECT average(provider.firstByteLatency.Average) as 'ms' from DatastoreSample WHERE provider = 'S3BucketRequests' AND entityName like '%destination%'`,
          columnStart: 4,
          columnEnd: 12,
          chartSize: 'medium',
          chartType: 'line',
          title: 'Origin First Byte Latency (Avg - ms)',
          useSince: true,
        }
      ],
    },
    {
      title: 'Origin Total Request Latency - Avg (ms)',
      threshold: {
        critical: 200,
        warning: 180,
      },
      query: {
        nrql: `SELECT average(provider.totalRequestLatency.Average) as 'result' from DatastoreSample where provider='S3BucketRequests' where entityName like '%destination%'`,
        lookup: 'result',
      },
      detailConfig: [
        {
          nrql: `SELECT average(provider.totalRequestLatency.Average) as 'ms' from DatastoreSample where provider='S3BucketRequests' where entityName like '%destination%'`,
          columnStart: 1,
          columnEnd: 3,
          chartSize: 'medium',
          chartType: 'billboard',
          title: 'Views destination Total Request Latency (Avg - ms)',
          useSince: true,
        },
        {
          nrql: `SELECT average(provider.totalRequestLatency.Average) as 'ms' from DatastoreSample where provider='S3BucketRequests' where entityName like '%destination%'`,
          columnStart: 4,
          columnEnd: 12,
          chartSize: 'medium',
          chartType: 'line',
          title: 'Views destination Total Request Latency (Avg - ms)',
          useSince: true,
        }
      ],
    },
  ],
}
