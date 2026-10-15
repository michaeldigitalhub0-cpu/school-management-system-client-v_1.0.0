import { cache_data, get } from "../../database/db.js"

const getMyDetails = async (teacher_id, callback) => {

    return cache_data(`${teacher_id}:details`, async () => {

        const data = await get('/dashboard/teacher/me', (err, data) => {

            if (err) return callback(err);

            return data;
        })

        return data.data
    })
}

const getClassWeeklyTimetable = async (arm_id, callback) => {

    return cache_data(`${arm_id}:timetable`, async () => {

        const data = await get(`/dashboard/teacher/timetable/${arm_id}`, (err, data) => {

            if (err) return callback(err);

            return data
        });

        return data.data;
    })
}

const getCurrentAttendance = async (teacher_id, callback) => {

    return cache_data(`${teacher_id}_class_attendance:current`, async () => {

        const data = await get(`/dashboard/teacher/attendance/today`, (err, data) => {

            if (err) return callback(err);

            return data
        });

        return data.data;
    })
}

const getPersonalTimeTable = async (teacher_id, callback) => {

    return cache_data(`${teacher_id}:timetable`, async () => {

        const data = await get(`/dashboard/teacher/timetable/me`, (err, data) => {

            if (err) return callback(err);

            return data
        });

        return data.data;
    })
}

const getClassStudents = async (arm_id, callback) => {

    return cache_data(`${arm_id}_student:all`, async () => {

        const data = await get('/dashboard/teacher/students', (err, data) => {

            if (err) return callback(err);
            console.log(data);
            return data
        });

        return data.data;
    })
}


export { getMyDetails, getClassStudents, getClassWeeklyTimetable, getCurrentAttendance, getPersonalTimeTable };