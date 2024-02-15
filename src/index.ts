import AWSService from './provider/aws/aws.service';
import _ from 'lodash';
import dotenv from 'dotenv';
import express from 'express';
import { EventEmitter } from 'stream';
import JobData from './ui/component/job-data';
import JobMonitor from './ui/component/job-monitor';
import JobInfo from './ui/component/job-info';
import SecretStore from './service/secret-store';
import AWSBatchService from './provider/aws/aws.service';

dotenv.config();
const store = new SecretStore(process.env.secret_store_relative_path);
const { accessKeyId, secretAccessKey } = store.credentials;

const config = {
    port: process.env.port ? Number(process.env.port) : 8080,
    hostname: '127.0.0.1',
};

const app = express();
app.use(express.json());
app.use(express.urlencoded());
app.use(express.static('static'));

const batch = new AWSBatchService(accessKeyId, secretAccessKey);

const runningJobsMap: Record<string, AWS.Batch.DescribeJobsResponse> = {};

async function followJob(jobId: string) {
    const jobEventFollower = new EventEmitter();
    const queryJobTimer = setInterval(() => {
        console.log('should poll ' + jobId);
        batch.queryJob(jobId).then((data: AWS.Batch.DescribeJobsResponse) => {
            console.log('polled job', data);
            runningJobsMap[jobId] = data;
            if (data.jobs && data.jobs[0].stoppedAt) {
                jobEventFollower.emit('done');
            }
        });
    }, 10000);

    jobEventFollower.on('done', () => {
        console.log(`job ${jobId} ended, done polling`);
        clearInterval(queryJobTimer);
    });
}

app.post('/batch/job', async (req, res) => {
    console.log('/batch/job');
    const input = JSON.parse(req.body.jsonInput) as AWS.Batch.SubmitJobRequest;

    let responsestr: string = '';
    try {
        const jobId = await batch.launchJob(input);
        const description = await batch.queryJob(jobId);

        console.log(runningJobsMap);
        runningJobsMap[jobId] = description;
        followJob(jobId);

        responsestr = JobMonitor(jobId, () =>
            JobData(JSON.stringify(description, null, 4))
        );
        console.log(responsestr);
    } catch (e) {
        console.log(e);
        responsestr = JobData(`${e}`);
    }

    res.write(responsestr);
    res.end();
});

app.get('/batch/job/:id', (req, res) => {
    console.log(req.url.split('/')[3]);
    const jobId = req.url.split('/')[3];
    console.log(runningJobsMap);
    const responsestr = JobInfo(runningJobsMap[jobId]);
    res.write(responsestr);
    res.end();
});

app.listen(config.port, config.hostname, () => {
    console.log(`listening to 127.0.0.1:${config.port}`);
});
