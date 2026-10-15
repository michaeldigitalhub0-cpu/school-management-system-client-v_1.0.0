import { cache_data, get } from "../../database/db.js"

const getAllAttendance = async (callback) => {

    return cache_data(`attendance:all`, async () => {

        const data = await get(`/attendance/all`, (err, data) => {

            if (err) return callback(err, null);

            return data;
        })

        return data.data;
    })
}

const getAllAttendanceClass = async (arm_id, callback) => {

    return cache_data(`attendance_${arm_id}:all`, async () => {

        const data = await get(`/attendance/${arm_id}`, (err, data) => {

            if (err) return callback(err);

            return data;
        })

        return data.data
    })
}

export { getAllAttendance, getAllAttendanceClass };