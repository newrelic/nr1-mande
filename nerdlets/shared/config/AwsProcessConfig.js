export default {
  title: 'Process Workflow',
  eventTypes: [
    {
      event: 'DatastoreSample',
      attributes: [
        ['awsAccountId', 'AWS'],
        ['awsRegion', 'AWS'],
        ['label.Name', 'Tags'],
        ['label.Workflow', 'Tags'],
      ],
    },
  ],
  metrics: [
    {
      title: 'Processes Initiated (Count)',
      threshold: {
        critical: 3,
        warning: 5,
        type: 'below',
      },
      invertCompareTo: 'true',
      query: {
        nrql: `SELECT sum(provider.executionsStarted.Sum) as 'result' FROM AwsStatesStateMachineSample WHERE \`label.aws:cloudformation:logical-id\` = 'ProcessWorkflow'`,
        lookup: 'result',
      },
      detailDashboardId: 'Process-Initiated-Detail',
    },
    {
      title: 'Processes Succeeded (Count)',
      threshold: {
        critical: 3,
        warning: 5,
        type: 'below',
      },
      invertCompareTo: 'true',
      query: {
        nrql: `SELECT sum(provider.executionsSucceeded.Sum) as 'result' FROM AwsStatesStateMachineSample WHERE \`label.aws:cloudformation:logical-id\` = 'ProcessWorkflow'`,
        lookup: 'result',
      },
      detailDashboardId: 'Process-Success-Detail',
    },
    {
      title: 'Processes Failed (Count)',
      threshold: {
        critical: 1,
        warning: .5,
      },
      query: {
        nrql: `SELECT sum(provider.executionsFailed.Sum) as 'result' FROM AwsStatesStateMachineSample WHERE \`label.aws:cloudformation:logical-id\` = 'ProcessWorkflow'`,
        lookup: 'result',
      },
      detailDashboardId: 'Process-Fail-Detail',
    },
    {
      title: 'Process Time (s)',
      threshold: {
        critical: 20,
        warning: 10,
      },
      query: {
        nrql: `SELECT average(provider.executionTime.Average/1000) as 'result' FROM AwsStatesStateMachineSample WHERE \`label.aws:cloudformation:logical-id\` ='ProcessWorkflow'`,
        lookup: 'result',
      },
      detailDashboardId: 'Process-Time-Detail',
    },
    {
      title: 'Process Failure Ratio (%)',
      threshold: {
        critical: 10,
        warning: 5,
      },
      query: {
        nrql: `FROM AwsStatesStateMachineSample SELECT sum(provider.executionsFailed.Sum) / sum(provider.executionsStarted.Sum) * 100 as 'result' WHERE \`label.aws:cloudformation:logical-id\` = 'ProcessWorkflow'`,
        lookup: 'result',
      },
      detailDashboardId: 'Process-Fail-Ratio-Detail',
    },
  ],
  overviewDashboard: [
    {
      nrql: `SELECT sum(provider.executionsStarted.Sum) as 'Starts' FROM AwsStatesStateMachineSample WHERE \`label.aws:cloudformation:logical-id\` = 'ProcessWorkflow'`,
      columnStart: 1,
      columnEnd: 3,
      chartSize: 'small',
      chartType: 'billboard',
      title: 'Processes Initiated',
      useSince: true,
    },
    {
      nrql: `SELECT sum(provider.executionsStarted.Sum) as 'Starts' FROM AwsStatesStateMachineSample WHERE \`label.aws:cloudformation:logical-id\` = 'ProcessWorkflow'`,
      columnStart: 4,
      columnEnd: 12,
      chartSize: 'small',
      chartType: 'line',
      title: 'Processes Initiated',
      useSince: true,
    },
    {
      nrql: `SELECT sum(provider.executionsSucceeded.Sum) as 'Succeeded' FROM AwsStatesStateMachineSample WHERE \`label.aws:cloudformation:logical-id\` = 'ProcessWorkflow'`,
      columnStart: 1,
      columnEnd: 3,
      chartSize: 'small',
      chartType: 'billboard',
      title: 'Processes Succeeded',
      useSince: true,
    },
    {
      nrql: `SELECT sum(provider.executionsStarted.Sum) as 'Succeeded' FROM AwsStatesStateMachineSample WHERE \`label.aws:cloudformation:logical-id\` = 'ProcessWorkflow'`,
      columnStart: 4,
      columnEnd: 12,
      chartSize: 'small',
      chartType: 'line',
      title: 'Processes Succeeded',
      useSince: true,
    },
    {
      nrql: `SELECT sum(provider.executionsFailed.Sum) as 'result' FROM AwsStatesStateMachineSample WHERE \`label.aws:cloudformation:logical-id\` = 'ProcessWorkflow'`,
      columnStart: 1,
      columnEnd: 3,
      chartSize: 'small',
      chartType: 'billboard',
      title: 'Processes Failed',
      useSince: true,
    },
    {
      nrql: `SELECT sum(provider.executionsFailed.Sum) as 'result' FROM AwsStatesStateMachineSample WHERE \`label.aws:cloudformation:logical-id\` = 'ProcessWorkflow'`,
      columnStart: 4,
      columnEnd: 12,
      chartSize: 'small',
      chartType: 'line',
      title: 'Processes Failed',
      useSince: true,
    },
    {
      nrql: `SELECT average(provider.executionTime.Average/1000) as 'Process Time (s)' FROM AwsStatesStateMachineSample WHERE \`label.aws:cloudformation:logical-id\` ='ProcessWorkflow'`,
      columnStart: 1,
      columnEnd: 3,
      chartSize: 'small',
      chartType: 'billboard',
      title: 'Process Time (s)',
      useSince: true,
    },
    {
      nrql: `SELECT average(provider.executionTime.Average/1000) as 'Process Time (s)' FROM AwsStatesStateMachineSample WHERE \`label.aws:cloudformation:logical-id\` ='ProcessWorkflow'`,
      columnStart: 4,
      columnEnd: 12,
      chartSize: 'small',
      chartType: 'line',
      title: 'Processes Time (s)',
      useSince: true,
    },
    {
      nrql: `FROM AwsStatesStateMachineSample SELECT sum(provider.executionsFailed.Sum) / sum(provider.executionsStarted.Sum) * 100 as 'Process Failure Ratio' WHERE \`label.aws:cloudformation:logical-id\` = 'ProcessWorkflow'`,
      columnStart: 1,
      columnEnd: 3,
      chartSize: 'small',
      chartType: 'billboard',
      title: 'Process Failure Ratio (%)',
      useSince: true,
    },
    {
      nrql: `FROM AwsStatesStateMachineSample SELECT sum(provider.executionsFailed.Sum) / sum(provider.executionsStarted.Sum) * 100 as 'Process Failure Ratio' WHERE \`label.aws:cloudformation:logical-id\` = 'ProcessWorkflow'`,
      columnStart: 4,
      columnEnd: 12,
      chartSize: 'small',
      chartType: 'line',
      title: 'Process Failure Ratio (%)',
      useSince: true,
    },
  ],
  detailDashboards: [
    {
      id: 'Process-Initiated-Detail',
      config: [
        {
          nrql: `SELECT sum(provider.executionsStarted.Sum) as 'Executions' FROM AwsStatesStateMachineSample WHERE \`label.aws:cloudformation:logical-id\` = 'ProcessWorkflow'`,
          columnStart: 1,
          columnEnd: 3,
          chartSize: 'medium',
          chartType: 'billboard',
          title: 'Processes Initiated',
          useSince: true,
        },
        {
          nrql: `SELECT sum(provider.executionsStarted.Sum) as 'Executions' FROM AwsStatesStateMachineSample WHERE \`label.aws:cloudformation:logical-id\` = 'ProcessWorkflow'`,
          columnStart: 4,
          columnEnd: 12,
          chartSize: 'medium',
          chartType: 'line',
          title: 'Processes Initiated',
          useSince: true,
        }
      ],
    },
    {
      id: 'Process-Success-Detail',
      config: [
        {
          nrql: `SELECT sum(provider.executionsSucceeded.Sum) as 'Succeeded' FROM AwsStatesStateMachineSample WHERE \`label.aws:cloudformation:logical-id\` = 'ProcessWorkflow'`,
          columnStart: 1,
          columnEnd: 3,
          chartSize: 'medium',
          chartType: 'billboard',
          title: 'Processes Succeeded',
          useSince: true,
        },
        {
          nrql: `SELECT sum(provider.executionsStarted.Sum) as 'Succeeded' FROM AwsStatesStateMachineSample WHERE \`label.aws:cloudformation:logical-id\` = 'ProcessWorkflow'`,
          columnStart: 4,
          columnEnd: 12,
          chartSize: 'medium',
          chartType: 'line',
          title: 'Processes Succeeded',
          useSince: true,
        },
      ],
    },
    {
      id: 'Process-Fail-Detail',
      config: [
        {
          nrql: `SELECT sum(provider.executionsFailed.Sum) as 'result' FROM AwsStatesStateMachineSample WHERE \`label.aws:cloudformation:logical-id\` = 'ProcessWorkflow'`,
          columnStart: 1,
          columnEnd: 3,
          chartSize: 'small',
          chartType: 'billboard',
          title: 'Processes Failed',
          useSince: true,
        },
        {
          nrql: `SELECT sum(provider.executionsFailed.Sum) as 'result' FROM AwsStatesStateMachineSample WHERE \`label.aws:cloudformation:logical-id\` = 'ProcessWorkflow'`,
          columnStart: 4,
          columnEnd: 12,
          chartSize: 'small',
          chartType: 'line',
          title: 'Processes Failed',
          useSince: true,
        },
        {
          nrql: `FROM AwsLambdaInvocationError SELECT count(*) as 'Count'`,
          facets: 'entityName, entityGuid',
          columnStart: 1,
          columnEnd: 4,
          chartSize: 'medium',
          chartType: 'bar',
          title: 'Entities with Failures',
          useSince: true,
        },
        {
          nrql: `FROM Log SELECT count(*) as 'Total' WHERE message like '%[ERROR]%' and aws.logGroup is not null`,
          facets: 'message',
          columnStart: 5,
          columnEnd: 12,
          chartSize: 'medium',
          chartType: 'table',
          title: 'Log Messages',
          useSince: true,
        },
      ],
    },
    {
      id: 'Process-Time-Detail',
      config: [
        {
          nrql: `SELECT average(provider.executionTime.Average/1000) as 'Process Time (s)' FROM AwsStatesStateMachineSample WHERE \`label.aws:cloudformation:logical-id\` ='ProcessWorkflow'`,
          columnStart: 1,
          columnEnd: 3,
          chartSize: 'medium',
          chartType: 'billboard',
          title: 'Process Time (s)',
          useSince: true,
        },
        {
          nrql: `SELECT average(provider.executionTime.Average/1000) as 'Process Time (s)' FROM AwsStatesStateMachineSample WHERE \`label.aws:cloudformation:logical-id\` ='ProcessWorkflow'`,
          columnStart: 4,
          columnEnd: 12,
          chartSize: 'medium',
          chartType: 'line',
          title: 'Processes Time (s)',
          useSince: true,
        },
      ],
    },
    {
      id: 'Process-Fail-Ratio-Detail',
      config: [
        {
          nrql: `FROM AwsStatesStateMachineSample SELECT sum(provider.executionsFailed.Sum) / sum(provider.executionsStarted.Sum) * 100 as 'Process Failure Ratio' WHERE \`label.aws:cloudformation:logical-id\` = 'ProcessWorkflow'`,
          columnStart: 1,
          columnEnd: 3,
          chartSize: 'medium',
          chartType: 'billboard',
          title: 'Process Failure Ratio (%)',
          useSince: true,
        },
        {
          nrql: `FROM AwsStatesStateMachineSample SELECT sum(provider.executionsFailed.Sum) / sum(provider.executionsStarted.Sum) * 100 as 'Process Failure Ratio' WHERE \`label.aws:cloudformation:logical-id\` = 'ProcessWorkflow'`,
          columnStart: 4,
          columnEnd: 12,
          chartSize: 'medium',
          chartType: 'line',
          title: 'Process Failure Ratio (%)',
          useSince: true,
        },
      ],
    },
  ],
}
