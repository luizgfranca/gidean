import AWS from 'aws-sdk';

class AWSBatchService {
    awsBatchInstance: AWS.Batch;

    constructor(accessKeyId: string, secretAccessKey: string) {
        this.awsBatchInstance = new AWS.Batch({
            region: 'us-east-1',
            credentials: new AWS.Credentials({
                accessKeyId,
                secretAccessKey,
            }),
        });
    }

    listJobDefinitions() {
        this.awsBatchInstance.describeJobDefinitions((err, data) => {
            if (err) throw err;
            console.log('job definitions', data);
        });
    }

    queryJob(jobId: string): Promise<AWS.Batch.DescribeJobsResponse> {
        return new Promise((resolve, reject) => {
            this.awsBatchInstance.describeJobs(
                { jobs: [jobId] },
                (err, data) => {
                    if (err) return reject(err);
                    console.log('job info', JSON.stringify(data, null, 2));
                    resolve(data);
                }
            );
        });
    }

    launchJob(jobMetadata: AWS.Batch.SubmitJobRequest): Promise<string> {
        return new Promise((resolve, reject) => {
            this.awsBatchInstance.submitJob(jobMetadata, (err, data) => {
                if (err) return reject(err);
                console.log('job start response', data);
                resolve(data.jobId);
            });
        });
    }
}

export default AWSBatchService;
