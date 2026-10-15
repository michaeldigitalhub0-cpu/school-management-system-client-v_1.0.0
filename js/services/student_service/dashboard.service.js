import { cache_data, get } from "../../database/db.js"

const getMyDetails = async (student_id, callback) => {

    return cache_data(`${student_id}:details`, async () => {

        const data = await get('/dashboard/student/me', (err, data) => {

            if (err) return callback(err);

            return data;
        })

        return data.data;
    })
}

const getCurrentTimetable = async (arm_id, callback) => {

    return cache_data(`${arm_id}_timetable:current`, async () => {

        const data = await get(`/dashboard/student/timetable/${arm_id}`, (err, data) => {

            if (err) return callback(err);
            console.log(data);
            return data;
        })

        return data.data;
    })
}

const getCurrentAttendance = async (student_id, arm_id, callback) => {

    return cache_data(`${student_id}_${arm_id}_attendance:current`, async () => {

        const data = await get(`/dashboard/student/today/${arm_id}`, (err, data) => {

            if (err) return callback(err);

            return data;
        })

        return data.data;
    })
}

const getOverallAttendance = async (student_id, arm_id, callback) => {

    return cache_data(`${student_id}_${arm_id}_attendance:overall`, async () => {

        const data = await get(`/dashboard/student/overall/${arm_id}`, (err, data) => {

            if (err) return callback(err);

            return data;
        })

        return data.data;
    })
}

export { getMyDetails, getCurrentTimetable, getCurrentAttendance, getOverallAttendance };