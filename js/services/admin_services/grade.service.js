
import { cache_data, get } from "../../database/db.js";

const getRecordAdmin = async (callback) => {

    return cache_data(`grade_record:all`, async () => {

        const data = await get('/grade/all', (err, data) => {

            if (err) callback(err);

            return data;
        })

        return data.data;
    })
}

const getDetails = async (student_id, callback) => {

    return cache_data(`student_${student_id}:details`, async () => {

        const data = await get('/student/admin/all', (err, data) => {

            if (err) return callback(err);

            const matched = data.data.find(record => record.admission_no === student_id);
            return matched;
        })

        return data;
    })
}

const getAssessmentRecord = async (student_id, term, session) => {

    return cache_data(`${student_id}_record:grade`, async () => {

        const data = await getRecordAdmin((err => { throw err }));

        const matched = data.filter(
            record => record.student_id === student_id
                && record.school_session === session
                && record.term === term
        );

        return matched;
    })
}
export { getRecordAdmin, getDetails, getAssessmentRecord };