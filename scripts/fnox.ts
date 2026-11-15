import { runSet, runSetupWizard, runStatus } from './fnox/commands';
import { runShowProd } from './fnox/config';

// Main CLI dispatch
async function main() {
    const args = process.argv.slice(2);
    const command = args[0] || 'setup';

    switch (command) {
        case 'setup':
        case 'init':
            await runSetupWizard(args);
            break;
        case 'status':
        case 'info':
            await runStatus();
            break;
        case 'set':
            await runSet(args, false);
            break;
        case 'set-prod':
        case 'set:prod':
            await runSet(args, true);
            break;
        case 'prod':
        case 'show-prod':
            await runShowProd();
            break;
        default:
            if (command.startsWith('--')) {
                await runSetupWizard(args);
            } else {
                console.log(`Unknown command: ${command}`);
                console.log(
                    'Available commands: setup, status, set <KEY> <VAL> [--prod], set-prod <KEY> <VAL>',
                );
                process.exit(1);
            }
            break;
    }
}

main().catch((err) => {
    console.error('❌ Script failed:', err);
    process.exit(1);
});
