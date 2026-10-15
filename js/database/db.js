
const _cache = new Map();
const production = 'https://school-management-backend-main-v-1-0-0.onrender.com';
const dev = 'http://127.0.0.1:5000';

const api_fetch = async (path, options = {}) => {
    const res = await fetch(`${production}/api${path}`, {
        ...options,
        credentials: 'include',
        headers: { 'Content-Type': 'application/json', ...options.headers }
    });

    if (res.status === 403) {
        const refreshed = await fetch(`${production}/api/auth/refresh`, {
            method: 'POST',
            credentials: 'include'
        });

        if (refreshed.ok) {
            return fetch(`${production}/api${path}`, {
                ...options,
                credentials: 'include',
                headers: { 'Content-Type': 'application/json', ...options.headers }
            });
        }

        sessionStorage.clear();
        window.location.href = '/login.html';
        return;
    }

    return res;
}

const clear_cache = () => {
    _cache.clear();
}

const get = async (path, callback) => {

    const response = await api_fetch(path, { method: 'GET' });

    if (!response.ok) {

        const err = await response.json();
        return callback(err, null);
    }

    const json = await response.json();

    return callback(null, json);
}

const create = async (path, data, callback) => {

    const response = await api_fetch(path, {
        method: 'POST',
        body: JSON.stringify(data)
    });

    if (!response.ok) {

        const err = await response.json();

        return callback(err, null);
    }

    const json = await response.json();

    clear_cache();

    return callback(null, json);

}

const update = async (path, data, callback) => {

    const response = await api_fetch(path, {
        method: 'PUT',
        body: JSON.stringify(data)
    });

    if (!response.ok) {

        const err = await response.json();
        return callback(err, null);
    }

    const json = await response.json();

    clear_cache();

    return callback(null, json);

}

const remove = async (path, callback) => {


    const response = await api_fetch(path, { method: 'DELETE' });

    if (!response.ok) {

        const err = await response.json();
        return callback(err, null);
    }

    const json = await response.json();

    clear_cache();

    return callback(null, json);
}

const cache_data = async (key, fn) => {

    if (!_cache.has(key)) {
        _cache.set(key, await fn());
    }

    return _cache.get(key) || [];
}

export { create, get, update, remove, cache_data, api_fetch };