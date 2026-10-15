
'use strict';

import { api_fetch, cache_data, get } from '../database/db.js';

const validateUser = async (data, callback) => {

    const response = await api_fetch('/auth/login', {
        method: 'POST',
        body: JSON.stringify(data)
    });

    if (!response.ok) {

        const err = await response.json();
        return callback(err, null);
    }

    return callback(null, data);
}

const getUserData = async (callback) => {
    return cache_data('current_user', async () => {
        const data = await get('/auth/me', (err, data) => {

            if (err) return callback(err);

            return data;
        });

        return data.data;
    })
}

const logout = async (callback) => {

    const response = await api_fetch('/auth/logout', { method: 'POST' });

    if (!response.ok) return callback(err);

}

export { validateUser, getUserData, logout };