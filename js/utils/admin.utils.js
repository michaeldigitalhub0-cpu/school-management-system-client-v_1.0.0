
import { getAllClasses } from "../services/admin_services/class.service.js";
import { cache_data } from "../database/db.js";

const getDomain = async () => {

    const data = await cache_data('classes:all', getAllClasses);

    const map = new Map();

    data.forEach(d => {
        if (!map.has(d.domain_id)) {
            map.set(d.domain_id, { domain_id: d.domain_id, domain_name: d.domain_name });
        }
    });

    return [...map.values()];
}

const getGroup = async (domain_id) => {

    const data = await cache_data('classes:all', getAllClasses);

    const map = new Map();

    data.forEach(g => {
        if (!map.has(g.group_id) && g.domain_id === domain_id) {
            map.set(g.group_id, { group_id: g.group_id, group_name: g.group_name });
        }
    });

    return [...map.values()];
}

const getArm = async (group_id) => {

    const data = await cache_data('classes:all', getAllClasses);

    const map = new Map();

    data.forEach(a => {
        if (!map.has(a.arm_id) && a.group_id === group_id) {
            map.set(a.arm_id, { arm_id: a.arm_id, arm_name: a.arm_name });
        }
    });

    return [...map.values()];
}

export { getDomain, getGroup, getArm };