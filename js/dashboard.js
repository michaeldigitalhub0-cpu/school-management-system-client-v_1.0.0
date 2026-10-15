import { getAllClasses, getAllStudents, getAllTeachers, getCurrentAnnouncement, getCurrentAttendance } from "./services/admin_services/dashboard.service.js";
import { createNotification } from "./utils.js";

async function setDetails() {
    const statStudents = document.querySelector('#statStudents');
    const statTeachers = document.querySelector('#statTeachers');
    const statClasses = document.querySelector('#statClasses');
    const statAttendance = document.querySelector('#statAttendanceToday');

    const st = await getAllTeachers((err => { throw err }));
    const sc = await getAllClasses((err => { throw err }));
    statStudents.textContent = (await getAllStudents((err => { throw err }))).student_total;
    statTeachers.textContent = Array.isArray(st) ? 0 : st;
    statClasses.textContent = Array.isArray(sc) ? 0 : sc
    statAttendance.textContent = (await getCurrentAttendance((err => {
        createNotification('dashboardAlert', err.message, 'success');
        throw err;
    }))) + '%';
}

async function getRecentAnnouncement() {

    let announcement = await getCurrentAnnouncement((err) => { throw err });

    for (let i = announcement.length - 1; i >= 0; i--) {
        announcement.push(announcement[i]);
        announcement.shift();
    }

    const attendanceBoard = document.querySelector('#announcementsList');
    announcement.forEach(ann => {
        attendanceBoard.innerHTML =
            `
        <div class="card">
          <div class="card__header">
            <h3>Title: ${ann.title}</h3>
            <p> Date: ${ann.date_posted}</p>
            <p>Audience: ${ann.audience}</p>
          </div>
          <p>${ann.body}</p>
        </div>
        `;
    })
}
setDetails();
getRecentAnnouncement()