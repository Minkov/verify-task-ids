const fs = require('fs');
const path = require('path');
const _ = require('lodash');

const dirName = "/home/doncho/repos/interactive-content";

const getAllFiles = (dirName) => {
    const paths = fs.readdirSync(dirName)
        .map(x => path.join(dirName, x))
        .map(path => ({
            path,
            stats: fs.lstatSync(path)
        }));

    return _.flatten([
        ...paths.filter(x => x.stats.isFile())
            .filter(x => x.path.endsWith('.md'))
            .map(x => x.path),
        ...paths.filter(x => x.stats.isDirectory())
            .map(x => x.path)
            .map(x => getAllFiles(x)),
    ]);
};

const extractTaskIds = (content) => content.match(/taskId="(.*?)"/g);

const groups = _.flattenDeep(getAllFiles(dirName)
    .map(x => fs.readFileSync(x, 'utf-8'))
    .map(x => extractTaskIds(x))
    .filter(x => x)
)
.sort()
.reduce((groups, taskId) => {
    if(!groups[taskId]) {
        groups[taskId] = 0;
    }
    groups[taskId] += 1;
    return groups;
}, {});

Object.keys(groups)
    .map(taskId => ({
        taskId,
        count: groups[taskId],
    }))
    .sort((x, y) => x.count - y.count)
    .forEach(x => console.log(x));