export const getPath = () => {
    const pairsToDict = (pairs) => {
        let res = {};
        for (var i = 0; i < pairs.length; i += 2) {
            const key = pairs[i];
            const val = i < pairs.length ? pairs[i + 1] : undefined;
            res = Object.assign(Object.assign({}, res), { [key]: val });
        }
        return res;
    };
    const parts = window.location.pathname.split('/');
    let path = {
        page: parts[2] || 'general',
        params: {},
    };
    if (parts.length > 3) {
        let extraArgs = parts.slice(3);
        if (parts.includes('filter')) {
            const n = extraArgs.findIndex(e => e == 'filter');
            const filterParts = extraArgs.slice(n + 1);
            extraArgs = extraArgs.slice(0, n);
            path = Object.assign(Object.assign({}, path), { filter: pairsToDict(filterParts) });
        }
        if (extraArgs.length) {
            if (extraArgs.length % 2)
                path = Object.assign(Object.assign({}, path), { subpage: extraArgs.shift() });
            if (extraArgs.length)
                path = Object.assign(Object.assign({}, path), { params: pairsToDict(extraArgs) });
        }
    }
    return path;
};
export const exportPath = (page, ...args) => {
    let path = {
        page: page,
        params: {},
    };
    args.forEach(e => {
        if (typeof e == 'string')
            path = Object.assign(Object.assign({}, path), { subpage: e });
        else if ('params' in e)
            path = Object.assign(Object.assign({}, path), { params: e.params });
        else if ('filter' in e)
            path = Object.assign(Object.assign({}, path), { filter: e.filter });
    });
    const dictToString = (dict) => {
        let keys = Object.keys(dict);
        keys = keys.filter(e => dict[e]);
        keys.sort();
        let string = '';
        keys.forEach(key => {
            let val = dict[key];
            string = string.length ? `${string}/${key}/${val}` : `${key}/${val}`;
        });
        return string;
    };
    let url = `/effortlesshome/${path.page}`;
    if (path.subpage)
        url = `${url}/${path.subpage}`;
    if (dictToString(path.params).length)
        url = `${url}/${dictToString(path.params)}`;
    if (path.filter)
        url = `${url}/filter/${dictToString(path.filter)}`;
    return url;
};
