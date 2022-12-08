import args from 'args';
import { cleanPackage, restorePackage, getConfig } from './cleanPackage';

args.option('clean', 'Clean package.json').option('restore', 'Restore package.json');

const run = () => {
    const flags = args.parse(process.argv);

    if (flags.clean) {
        const config = getConfig();
        cleanPackage(config);
    } else if (flags.restore) {
        restorePackage();
    }
};

run();
