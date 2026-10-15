

import { get, create, update, remove, cache_data } from "../../database/db.js";

const createTeacher = async (newData, callback) => {

    await create('/teacher/new', newData, (err, data) => {
        if (err) return callback(err, null);

        return callback(null, data);
    })
}

const getAllTeachers = async (callback) => {

    return cache_data('teacher:all', async () => {

        const data = await get('/teacher/all', (err, data) => {

            if (err) return callback(err);

            return data.data;
        })

        return data;
    })
}

const updateTeacher = async (id, newData, callback) => {

    await update(`/teacher/${id}`, newData, (err, data) => {

        if (err) callback(err, null);

        return callback(null, data);
    })
}

const removeTeacher = async (id, callback) => {

    await remove(`/teacher/${id}`, (err, data) => {

        if (err) callback(err, null);

        return callback(null, data);
    })
}

export { createTeacher, getAllTeachers, updateTeacher, removeTeacher };