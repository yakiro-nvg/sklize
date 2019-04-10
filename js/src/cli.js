const program = require('commander')
const transform = require('./transform')

program
    .version('0.1.0')
    .usage('<sketchFile> [outDir]')
    .arguments('<sketchFile> [outDir]')
    .action(function(sketchFile, outDir) {
        sketchFileValue = sketchFile
        outDirValue = outDir
    })
    .parse(process.argv)

if (typeof sketchFileValue === 'undefined') {
    program.help()
}

if (typeof outDirValue === 'undefined') {
    outDirValue = process.cwd()
}

// TODO: warning if target path isn't empty
transform(sketchFileValue, outDirValue)