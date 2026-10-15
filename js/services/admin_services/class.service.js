
import { cache_data, create, get, remove, update } from '../../database/db.js';

const createClass = async (data, callback) => {

    await create('/class/new', data, (err, data) => {

        if (err) return callback(err, null);

        return callback(null, data);
    })
}

const getAllClasses = async (callback) => {

    return cache_data('classes:all', async () => {

        const data = await get('/class/all', (err, { data }) => {

            if (err) return callback(err);

            return data;
        });

        return data;
    })
}

const updateClass = async (newData, callback) => {

    await update('/class/update', newData, (err, data) => {

        if (err) return callback(err, null);

        return callback(null, data);
    })
}

const removeClass = async ({ type, id }, callback) => {

    await remove(`/class/${type}/${id}`, (err, data) => {

        if (err) { return callback(err, null); }

        return callback(null, data);
    })
}

const fetchStudents = async (arm_id) => {

    return cache_data(`class_${arm_id}_student:all`, async () => {

        const data = await get(`/class/${arm_id}`, (err, { data }) => {

            if (err) return callback(err);

            return data;
        });

        return data;
    });
}

export { createClass, updateClass, removeClass, getAllClasses, fetchStudents }

