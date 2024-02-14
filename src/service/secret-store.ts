import path, { relative } from 'path';
import fs from 'fs';

type StoreCredentials = {
    accessKeyId: string;
    secretAccessKey: string;
};

class SecretStore {
    credentials: StoreCredentials;

    constructor(relativePath?: string) {
        if (!relativePath) {
            throw new Error('store path required!');
        }

        const fullPath = path.resolve(__dirname, '..', '..', relativePath);
        console.log(`loading secrets from ${fullPath}`);

        try {
            const raw = fs.readFileSync(fullPath).toString();
            this.credentials = JSON.parse(raw) as StoreCredentials;
        } catch (e) {
            console.error(e);
            process.exit(1);
        }
    }
}

export default SecretStore;
