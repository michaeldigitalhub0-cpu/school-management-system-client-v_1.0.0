import { cache_data, get } from "../../database/db.js"

const getAllTeachers = async (callback) => {

    return cache_data('admin_dashboard:teachers', async () => {

        const data = await get('/dashboard/admin/teachers', (err, data) => {

            if (err) return callback(err);

            return data;
        })

        return data.data;
    })
}

const getAllStudents = async (callback) => {

    return cache_data('admin_dashboard:students', async () => {

        const data = await get('/dashboard/admin/students', (err, data) => {

            if (err) return callback(err);

            return data;
        })

        return data.data;
    })
}

const getAllClasses = async (callback) => {

    return cache_data('admin_dashboard:classes', async () => {

        const data = await get('/dashboard/admin/classes', (err, data) => {

            if (err) return callback(err);

            return data;
        })

        return data.data;
    })
}

const getCurrentAttendance = async (callback) => {

    return cache_data('admin_dashboard:attendance', async () => {

        const data = await get('/dashboard/admin/attendance', (err, data) => {

            if (err) return callback(err);

            return data;
        })

        return data.data.percentage_present;
    })
}

const getCurrentAnnouncement = async (callback) => {

    return cache_data('admin_dashboard:announcement', async () => {

        const data = await get('/dashboard/admin/announcement/recent', (err, data) => {

            if (err) return callback(err);

            return data;
        })

        return data.data;
    })
}

export { getAllTeachers, getAllStudents, getAllClasses, getCurrentAnnouncement, getCurrentAttendance, }