
import { cache_data, create, get, remove, update } from "../../database/db.js";

const createSubject = async (data, callback) => {

    await create('/subject/new', data, (err, data) => {

        if (err) {

            return callback(err, null)
        }

        return callback(null, data);
    })
}

const getAllSubjects = async () => {

    return cache_data('subject:all', async () => {

        const data = await get('/subject/all', (err, { data }) => {

            if (err) throw err;

            return data;
        });

        return data;
    })
}

const updateSubject = async (id, newData, callback) => {

    await update(`/subject/${id}`, newData, (err, data) => {

        if (err) return callback(err, null);

        return callback(null, data);
    })
}

const removeSubject = async (id, callback) => {

    await remove(`/subject/${id}`, (err, data) => {

        if (err) return callback(err, null);

        return callback(null, data);
    })
}

export { createSubject, updateSubject, removeSubject, getAllSubjects };