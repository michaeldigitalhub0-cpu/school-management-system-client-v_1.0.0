
import { cache_data, get } from "../../database/db.js";

const getRecord = async (student_id, callback) => {

    return cache_data(`${student_id}_grade_record:all`, async () => {

        const data = await get('/grade/all', (err, data) => {

            if (err) callback(err);

            return data.data;
        })

        return data;
    })
}

export { getRecord };