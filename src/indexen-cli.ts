import * as path from 'path';
import * as fs from 'fs';
import {indexen} from './indexen';
import {parseCLIArguments} from './parseCLIArguments';
import {generateHelp} from './generateHelp';
import {getVersion} from './getVersion';

export const indexenCLI = async (
    props: {
        input: string,
        output: string,
    },
): Promise<void> => {
    const params = {
        directory: path.resolve(props.input),
        output: path.resolve(props.output),
        include: (file: string) => !/index\.[jt]s/.test(file),
    };
    const output = fs.createWriteStream(params.output);
    output.write('// Generated by @nlib/nodetool indexen\n');
    for await (const line of indexen(params)) {
        output.write(line);
    }
    output.close();
};

if (!module.parent) {
    const result = parseCLIArguments({
        input: {
            type: 'string',
            alias: 'i',
            description: 'A directory indexen reads from',
        },
        output: {
            type: 'string',
            alias: 'o',
            description: 'A file path indexen writes to',
        },
        help: {
            type: 'boolean',
            alias: 'h',
            description: 'Show help',
        },
        version: {
            type: 'boolean',
            alias: 'v',
            description: 'Output the version number',
        },
    }, process.argv.slice(2));
    if (result.args.help) {
        for (const help of generateHelp(result.definition)) {
            process.stdout.write(help);
        }
    } else if (result.args.version) {
        process.stdout.write(`${getVersion(path.join(__dirname, '../package.json'))}\n`);
    } else {
        indexenCLI(result.args)
        .catch((error) => {
            console.error(error);
            process.exit(1);
        });
    }
}
