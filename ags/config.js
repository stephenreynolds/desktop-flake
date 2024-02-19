const main = '/tmp/ags/main.js';
const outdir = `${App.configDir}/ts/main.ts`;

try {
    await Utils.execAsync([
        'bun', 'build', outdir,
        '--outfile', main,
        '--external', 'resource://*',
        '--external', 'gi://*',
        '--external', 'file://*',
    ]);
} catch (error) {
    console.error(error);
    App.quit();
}

export default (await import(`file://${main}`)).default;
