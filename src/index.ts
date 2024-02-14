import AWSService from './provider/aws/aws.service';
import credentials from './test-credentials';
import _ from 'lodash';

const { accessKeyId, secretAccessKey } = credentials;

const runningJobsMap: Record<string, AWS.Batch.DescribeJobsResponse> = {};

import express from 'express';
import { EventEmitter } from 'stream';

const config = {
    port: 8080,
    hostname: '127.0.0.1',
};

const app = express();
app.use(express.json());
app.use(express.urlencoded());
app.use(express.static('static'));

function followJob(
    batchInstance: AWS.Batch,
    jobId: string,
    initialInfoCallback?: (info: AWS.Batch.DescribeJobsResponse) => void
) {
    AWSService.queryJob(
        batchInstance,
        jobId,
        (data: AWS.Batch.DescribeJobsResponse) => {
            runningJobsMap[jobId] = data;
            console.log(runningJobsMap);
            initialInfoCallback?.(data);

            const jobEventFollower = new EventEmitter();
            const queryJobTimer = setInterval(() => {
                console.log('should poll ' + jobId);
                AWSService.queryJob(
                    batchInstance,
                    jobId,
                    (data: AWS.Batch.DescribeJobsResponse) => {
                        console.log('polled job', data);
                        runningJobsMap[jobId] = data;
                        if (data.jobs && data.jobs[0].stoppedAt) {
                            jobEventFollower.emit('done');
                        }
                    }
                );
            }, 10000);

            jobEventFollower.on('done', () => {
                console.log(`job ${jobId} ended, done polling`);
                clearInterval(queryJobTimer);
            });
        }
    );
}

function getBGColorClass(status?: string) {
    if (status === 'success') {
        return 'bg-green-900';
    } else if (status === 'FAILED') {
        return 'bg-red-900';
    } else if (status === 'STARTING') {
        return 'bg-gray-700';
    } else {
        return '';
    }
}

function jobDataComponent(data: string, status?: 'success' | 'fail') {
    return `<pre class="overflow-x-scroll bg-gray-900 p-4 ${getBGColorClass(status)}">${data}</pre>`;
}

function jobPollComponent(jobId: string, bodyComponent: () => string) {
    return `
        <div hx-get="/batch/job/${jobId}" hx-trigger="every 1s" hx-swap="innerHTML">
            ${bodyComponent()}
        </div>
    `;
}

function fromUnixDate(timestamp: number) {
    return new Date(timestamp * 1000);
}

function jobInfoComponent(data: AWS.Batch.DescribeJobsResponse) {
    if (!data.jobs) return '';
    const job = data.jobs[0];

    const propmap: Record<string, string> = {
        Name: job.jobName,
        ID: job.jobId,
        Queue: job.jobQueue,
        Status: job.status,
        'Dispatch Time': job.createdAt
            ? fromUnixDate(job.createdAt).toUTCString()
            : 'not dispatched yet',
        'End Time': job.stoppedAt
            ? fromUnixDate(job.stoppedAt).toUTCString()
            : '',
        Message: job.statusReason || '',
    };

    return `
        <table class="min-w-full bg-gray-800 divide-y divide-gray-200 table-fixed dark:divide-gray-700"><tbody>
            ${Object.keys(propmap)
                .map(
                    (k) => `
                    <tr class="${k === 'Status' ? getBGColorClass(propmap[k]) : ''} divide-gray-700">
                        <td class="py-4 px-6 text-sm font-semibold whitespace-nowrap">${k}</td>
                        <td class="py-4 px-6 text-sm font-medium whitespace-nowrap">${propmap[k]}</td>
                    </tr>
                `
                )
                .reduce(
                    (previousValue, currentValue) =>
                        (previousValue += currentValue),
                    ''
                )}
        </table></table>
    `;
}

app.post('/batch/job', (req, res) => {
    const input = JSON.parse(req.body.jsonInput) as AWS.Batch.SubmitJobRequest;

    const batchInstance = AWSService.getAwsBatchInstance(
        accessKeyId,
        secretAccessKey
    );

    AWSService.launchJob(batchInstance, input, (jobId) => {
        followJob(
            batchInstance,
            jobId,
            (data: AWS.Batch.DescribeJobsResponse) => {
                const responsestr = jobPollComponent(jobId, () =>
                    jobDataComponent(JSON.stringify(data, null, 4))
                );
                console.log(responsestr);
                res.write(responsestr);
                res.send();
            }
        );
    });
});

app.get('/batch/job/:id', (req, res) => {
    console.log(req.url.split('/')[3]);
    const jobId = req.url.split('/')[3];
    console.log(runningJobsMap);
    const responsestr = jobInfoComponent(runningJobsMap[jobId]);
    res.write(responsestr);
    res.end();
});

app.listen(config.port, config.hostname, () => {
    console.log(`listening to ${config.hostname}:${config.port}`);
});
