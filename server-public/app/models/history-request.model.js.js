modelGroupsOfParams = {
    startToEnd: ['source', 'start', 'end'],
    newestOfSize: ['source', 'diff', 'endString'],
    single: ['source', 'single'],
    newestTimestamps: ['diff', 'endString'],
    startToEndTimestamps: ['start', 'end']
}

function getCorrespondingGroupModelName(requestedQueryParams) {
    let sortedParams = requestedQueryParams.sort()
    let groupName, group, sortedGroup;
    for (let [groupName, group] of Object.entries(modelGroupsOfParams)){ 
        sortedGroup = group.sort()
        if (sortedParams.join(',') === sortedGroup.join(',')){
            return groupName;
        }
    }
    return null;
}

module.exports = {
    getCorrespondingGroupModelName
}