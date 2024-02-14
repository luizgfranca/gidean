export default function JobMonitor(jobId: string, bodyComponent: () => string) {
    return `
        <div hx-get="/batch/job/${jobId}" hx-trigger="every 1s" hx-swap="innerHTML">
            ${bodyComponent()}
        </div>
    `;
}
