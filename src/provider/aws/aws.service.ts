import AWS from 'aws-sdk';

async function authenticate(accessKeyId: string, secretAccessKey: string) {
    const credentials = new AWS.Credentials({
        accessKeyId,
        secretAccessKey,
    });

    const chain = new AWS.CredentialProviderChain();
    chain.providers.push(credentials);
    return await chain.resolvePromise();
}

function listJobDefinitions(awsBatchInstance: AWS.Batch) {
    awsBatchInstance.describeJobDefinitions((err, data) => {
        if (err) throw err;
        console.log('job definitions', data);
    });
}

function getAwsBatchInstance(accessKeyId: string, secretAccessKey: string) {
    return new AWS.Batch({
        region: 'us-east-1',
        credentials: new AWS.Credentials({
            accessKeyId,
            secretAccessKey,
        }),
    });
}

function queryJob(
    awsBatchInstance: AWS.Batch,
    jobId: string,
    cb?: (data: AWS.Batch.DescribeJobsResponse) => void
) {
    awsBatchInstance.describeJobs({ jobs: [jobId] }, (err, data) => {
        if (err) throw err;
        console.log('job info', JSON.stringify(data, null, 2));
        cb?.(data);
    });
}

async function launchJob(
    awsBatchInstance: AWS.Batch,
    jobMetadata: AWS.Batch.SubmitJobRequest,
    cb: (jobId: string) => void
) {
    awsBatchInstance.submitJob(jobMetadata, (err, data) => {
        if (err) throw err;
        console.log('job start response', data);
        cb(data.jobId);
    });
}

const AWSService = {
    authenticate,
    listJobDefinitions,
    getAwsBatchInstance,
    queryJob,
    launchJob,
};

export default AWSService;
