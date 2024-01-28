var params = {
    jobDefinition: 'STRING_VALUE', /* required */
    jobName: 'STRING_VALUE', /* required */
    jobQueue: 'STRING_VALUE', /* required */
    arrayProperties: {
      size: 'NUMBER_VALUE'
    },
    containerOverrides: {
      command: [
        'STRING_VALUE',
        /* more items */
      ],
      environment: [
        {
          name: 'STRING_VALUE',
          value: 'STRING_VALUE'
        },
        /* more items */
      ],
      instanceType: 'STRING_VALUE',
      memory: 'NUMBER_VALUE',
      resourceRequirements: [
        {
          type: GPU | VCPU | MEMORY, /* required */
          value: 'STRING_VALUE' /* required */
        },
        /* more items */
      ],
      vcpus: 'NUMBER_VALUE'
    },
    dependsOn: [
      {
        jobId: 'STRING_VALUE',
        type: N_TO_N | SEQUENTIAL
      },
      /* more items */
    ],
    eksPropertiesOverride: {
      podProperties: {
        containers: [
          {
            args: [
              'STRING_VALUE',
              /* more items */
            ],
            command: [
              'STRING_VALUE',
              /* more items */
            ],
            env: [
              {
                name: 'STRING_VALUE', /* required */
                value: 'STRING_VALUE'
              },
              /* more items */
            ],
            image: 'STRING_VALUE',
            resources: {
              limits: {
                '<String>': 'STRING_VALUE',
                /* '<String>': ... */
              },
              requests: {
                '<String>': 'STRING_VALUE',
                /* '<String>': ... */
              }
            }
          },
          /* more items */
        ],
        metadata: {
          labels: {
            '<String>': 'STRING_VALUE',
            /* '<String>': ... */
          }
        }
      }
    },
    nodeOverrides: {
      nodePropertyOverrides: [
        {
          targetNodes: 'STRING_VALUE', /* required */
          containerOverrides: {
            command: [
              'STRING_VALUE',
              /* more items */
            ],
            environment: [
              {
                name: 'STRING_VALUE',
                value: 'STRING_VALUE'
              },
              /* more items */
            ],
            instanceType: 'STRING_VALUE',
            memory: 'NUMBER_VALUE',
            resourceRequirements: [
              {
                type: GPU | VCPU | MEMORY, /* required */
                value: 'STRING_VALUE' /* required */
              },
              /* more items */
            ],
            vcpus: 'NUMBER_VALUE'
          }
        },
        /* more items */
      ],
      numNodes: 'NUMBER_VALUE'
    },
    parameters: {
      '<String>': 'STRING_VALUE',
      /* '<String>': ... */
    },
    propagateTags: true || false,
    retryStrategy: {
      attempts: 'NUMBER_VALUE',
      evaluateOnExit: [
        {
          action: RETRY | EXIT, /* required */
          onExitCode: 'STRING_VALUE',
          onReason: 'STRING_VALUE',
          onStatusReason: 'STRING_VALUE'
        },
        /* more items */
      ]
    },
    schedulingPriorityOverride: 'NUMBER_VALUE',
    shareIdentifier: 'STRING_VALUE',
    tags: {
      '<TagKey>': 'STRING_VALUE',
      /* '<TagKey>': ... */
    },
    timeout: {
      attemptDurationSeconds: 'NUMBER_VALUE'
    }
  };
  batch.submitJob(params, function(err, data) {
    if (err) console.log(err, err.stack); // an error occurred
    else     console.log(data);           // successful response
  });