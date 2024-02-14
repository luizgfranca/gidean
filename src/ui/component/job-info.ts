import { fromUnixDate } from '../../util/date';

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

export default function JobInfo(data: AWS.Batch.DescribeJobsResponse) {
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
