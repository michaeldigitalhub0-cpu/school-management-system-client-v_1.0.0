import { cache_data, create, get, remove, update } from "../../database/db.js"
import { getMyDetails } from "./dashboard.js";

const createRecord = async (newRecord, callback) => {

    await create('/grade/new', newRecord, (err, data) => {

        if (err) return callback(err, null);

        return callback(null, data);
    })
}

const getRecord = async (teacher_id, callback) => {

    const details = await getMyDetails(teacher_id, (err => { throw err }));

    return cache_data(`${details.arm_id}_grade_record:all`, async () => {

        const data = await get('/grade/all', (err, data) => {

            if (err) callback(err);

            return data.data;
        })

        return data;
    })
}

const updateRecord = async (grade_id, newRecord, callback) => {

    await update(`/grade/${grade_id}`, newRecord, (err, data) => {

        if (err) return callback(err, null);

        return callback(null, data);
    })
}

const deleteRecord = async (grade_id, callback) => {

    await remove(`/grade/${grade_id}`, (err, data) => {

        if (err) return callback(err, null);

        return callback(null, data);
    })
};

const getStudentDetails = async (student_id, callback) => {

    return cache_data(`student_${student_id}:details`, async () => {

        const data = await get('/dashboard/teacher/students', (err, data) => {

            if (err) return callback(err);

            const matched = data.data.find(record => record.admission_no === student_id);

            return matched;
        })

        return data;
    })
}

export { createRecord, getRecord, updateRecord, deleteRecord, getStudentDetails };