const fetch = require('node-fetch');
global.fetch = fetch
global.Headers = fetch.Headers;

function request({ base = '', endpoint = '', qs, headers = {}, method = 'get' }) {

    function formQuerystring(qs = {}) {
        return Object.keys(qs)
            .map(key => `${key}=${qs[key]}`)
            .join('&');
    }

	let opts = {
			method,
			headers: new Headers(headers)
		};
	return fetch(base + endpoint + '?' + formQuerystring(qs), opts)
	.then(res => res.json());
};


module.exports = {
    request: request
};