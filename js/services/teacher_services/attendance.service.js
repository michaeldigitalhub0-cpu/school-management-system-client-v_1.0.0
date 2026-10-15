import { cache_data, create, get, remove, update } from "../../database/db.js";
import { getCurrentDate } from "../../utils.js";

const createRecord = async (newData, callback) => {

    await create('/attendance/new', newData, (err, data) => {

        if (err) return callback(err, null);

        return callback(null, data);
    })
}

const getAllAttendanceTeacher = async (arm_id, callback) => {

    return cache_data(`teacher_${arm_id}_attendance:all`, async () => {

        const data = await get('/attendance/teacher', (err, data) => {

            if (err) return callback(err);

            return data;
        })

        return data.data;
    })
}

const updateStudentRecord = async (id, newData, callback) => {

    await update(`/attendance/update/${id}`, newData, (err, data) => {

        if (err) return callback(err, null);

        return callback(null, data);
    });
}

const deleteRecord = async (id, callback) => {

    await remove(`/attendance/${id}`, (err, data) => {

        if (err) return callback(err, null);

        return callback(null, data);
    })
}

const getCurrentAttendance = async (arm_id) => {

    return cache_data(`${arm_id}_attendance:current`, async () => {

        const data = await getAllAttendanceTeacher(arm_id, (err) => { if (err) throw err });
        return data.filter(att => att.date_taken === getCurrentDate());
    })
}

const getClassAttendanceTeacher = async (date, arm_id) => {

    return cache_data(`${arm_id}_${date}:attendance`, async () => {

        const data = await getAllAttendanceTeacher(arm_id, (err) => { if (err) throw err });

        return data.filter(att => att.date_taken === date);
    })
}

export {
    createRecord,
    getAllAttendanceTeacher,
    updateStudentRecord,
    deleteRecord,
    getCurrentAttendance,
    getClassAttendanceTeacher
};