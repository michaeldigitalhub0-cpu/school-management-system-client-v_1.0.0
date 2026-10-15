import { getClassStudents, getClassWeeklyTimetable, getCurrentAttendance, getMyDetails, getPersonalTimeTable } from "./services/teacher_services/dashboard.js";
import { createNotification } from "./utils.js";

const TEACHER_ID = sessionStorage.getItem('userId');
async function getDetails() {

    const data = await getMyDetails(TEACHER_ID, (err => { throw err }));
    return data;
}

async function getClassTimeTable() {

    return await getClassWeeklyTimetable((await getDetails()).arm_id, (err) => {

        createNotification('dashboardAlert', err.message, 'success');
    });
}

async function getMyTimeTable() {

    return await getPersonalTimeTable(TEACHER_ID, (err) => {

        createNotification('dashboardAlert', err.message, 'success');

    })
}

async function setDetails() {

    const fullName = document.querySelector('#teacherFullName');
    const staffID = document.querySelector('#teacherStaffID');
    const classTaught = document.querySelector('#teacherClass');
    const contact = document.querySelector('#teacherContact');
    const subjectsTaught = document.querySelector('#teacherSubjects');

    const classSize = document.querySelector('#statClassSize');
    const todayAttendance = document.querySelector('#statTodayAttendance');
    const todayPercentage = document.querySelector('#statTodayPercent');

    const studentLength = (await getClassStudents((await getDetails()).arm_id, (err => { throw err }))).length;

    const details = await getDetails()
    fullName.textContent = `${details.lName} ${details.fName} ${details.mName ?? ''}`
    staffID.textContent = details.staff_id;
    classTaught.textContent = `${details.domain_name.toUpperCase()} - ${details.group_name} ${details.arm_name} `;
    contact.textContent = details.contact;
    subjectsTaught.textContent = details.subject_name;

    classSize.textContent = studentLength ? studentLength : 0;

    const att = await getCurrentAttendance(TEACHER_ID, (err) => {
        createNotification('dashboardAlert', err.message, 'success');
        todayAttendance.textContent = 0;
        todayPercentage.textContent = 0;
        throw err;
    })

    todayAttendance.textContent = att.total_present;
    todayPercentage.textContent = att.percentage;
}


async function renderMyTimeTable() {

    const timeTableBody = document.querySelector('#todayTimetableBody');

    const timetable = await getMyTimeTable();

    if (timetable.length === 0) {
        timeTableBody.innerHTML = `
            <tr>
                <td colspan="3">
                  <div class="empty-state">
                    No classes today
                  </div>
                </td>
            </tr>
        `;
        return;
    }

    const time = timetable.map(record => record.time_allocated);
    const subject = timetable.map(record => record.subject_name);
    const c = timetable.map(record => `${record.group_name} ${record.arm_name}`);

    timeTableBody.innerHTML = '';
    for (let i = 0; i < time.length; i++) {

        const row = document.createElement('tr');

        for (let j = 0; j < subject.length + 1; j++) {

            const cell = document.createElement('td');

            if (j === 0) {
                cell.textContent = time[i];
                row.appendChild(cell);
            }

            if (j === 1) {

                cell.textContent = subject[i];
                row.appendChild(cell);
            }

            if (j === 2) {
                cell.textContent = c[i];
                row.appendChild(cell);
            }
            row.appendChild(cell);
        }

        timeTableBody.appendChild(row)
    }
}


async function renderClassTimeTable() {

    const timeTableBody = document.querySelector('#classWeekTimetableBody');

    const timeTable = await getClassTimeTable();

    if (timeTable.length === 0) {
        timeTableBody.innerHTML =
            `
            <tr>
                <td colspan="6">
                  <div class="empty-state">No time table set for your class yet</div>
                </td>
              </tr>
            `;
        return;
    }

    const times = [...new Set(timeTable.map(record => record.time_allocated))];

    const days = [...new Set(timeTable.map(record => record.day_of_week))];

    const breakTimes = new Set(
        timeTable.filter(r => r.subject_name === 'Break').map(r => r.time_allocated)
    );

    const lookups = new Map(
        timeTable.map(r => [`${r.day_of_week} | ${r.time_allocated}`, r])
    );

    for (let time of times) {

        const row = document.createElement('tr');

        const timeCell = document.createElement('td');
        const timeInput = document.createElement('div');
        timeInput.classList.add('period-time');
        timeInput.textContent = time;
        if (breakTimes.has(time)) timeInput.disabled = true;
        timeCell.appendChild(timeInput);
        row.appendChild(timeCell);

        for (let day of days) {

            const cell = document.createElement('td');
            const slot = lookups.get(`${day} | ${time}`);

            if (!slot) {
                cell.textContent = 'FREE_PERIOD';
            } else if (slot.subject_name === 'Break') {
                cell.textContent = 'Break'
            } else {
                cell.innerHTML = `
                    <div class="slot">
                        <div><strong>${slot.subject_name}</strong></div>
                        <small>${slot.teacher_lName} ${slot.teacher_fName} ${slot.teacher_mName ?? ''}</small>
                    </div>
                `;
            }

            row.appendChild(cell);
        }
        timeTableBody.appendChild(row);
    }
}

// document.querySelector('#printTimetable').addEventListener('click', async () => {

//     const details = await getMyDetails();
//     console.log(details.group_name + " " + details.arm_name);
//     // const url = new URL();
//     // window.location = url.origin + ''

// })
setDetails();
renderMyTimeTable();
renderClassTimeTable()