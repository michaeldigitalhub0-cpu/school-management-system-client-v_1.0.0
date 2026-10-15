
import { get, create, update, remove, cache_data } from "../../database/db.js";

const createStudent = async (data, callback) => {

    await create('/student/new', data, (err, data) => {

        if (err) return callback(err, null);

        return callback(null, data);
    })
}

const getAllStudents = async (callback) => {

    return cache_data('student:all', async () => {

        const data = await get('/student/admin/all', (err, data) => {

            if (err) return callback(err);

            return data.data
        })

        return data;
    })
}

const updateStudent = async (id, newData, callback) => {

    await update(`/student/${id}`, newData, (err, message) => {

        if (err) callback(err, null);

        return callback(null, message);
    })
}

const removeStudent = async (id, callback) => {

    await remove(`/student/${id}`, (err, message) => {

        if (err) callback(err, null);

        return callback(null, message);
    })
}

export { createStudent, getAllStudents, updateStudent, removeStudent };