import { cache_data, get } from "../../database/db.js";
import { getMyDetails } from "./dashboard.js";

const getAllSubjectsClass = async (teacher_id, callback) => {

    const details = await getMyDetails(teacher_id, (err => { throw err }));

    return cache_data(`${details.domain_id}_subject:all`, async () => {

        const data = await get(`/subject/group/${details.group_id}`, (err, data) => {

            if (err) return callback(err, null);

            return data
        })

        return data.data;
    })
}

export { getAllSubjectsClass };