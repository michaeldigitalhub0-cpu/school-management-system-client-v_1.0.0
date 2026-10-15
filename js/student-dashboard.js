import { getCurrentAttendance, getCurrentTimetable, getMyDetails, getOverallAttendance } from "./services/student_service/dashboard.service.js";
import { createNotification } from "./utils.js";


const ADMISSION_NO = sessionStorage.getItem('userId');

async function getDetails() {
    return await await getMyDetails(ADMISSION_NO, (err => { throw err }));
}

async function displayDetails() {
    const fullName = document.querySelector('#studentFullName');
    const admissionNo = document.querySelector('#studentAdmissionNo');
    const studentClass = document.querySelector('#studentClass');
    const studentGender = document.querySelector('#studentGender');

    const details = await getDetails();

    fullName.textContent = `${details.student_lName} ${details.student_fName} ${details.student_mName}`;
    admissionNo.textContent = details.admission_no;
    studentClass.textContent = `${details.class_domain.toUpperCase()} - ${details.class_group} ${details.class_arm}`;
    studentGender.textContent = details.gender === 'M' ? 'MALE' : 'FEMALE';
}

async function updateStatsRecord() {
    const todayAtt = document.querySelector('#statTodayStatus');
    const overallAtt = document.querySelector('#statTermPercent');
    const totalStudents = document.querySelector('#statClassmateCount');

    const details = await getDetails();

    totalStudents.textContent = details.class_total;

    const currentAtt = await getCurrentAttendance(ADMISSION_NO, details.arm_id, () => {
        createNotification('dashboardAlert', 'Attendance has not been taken yet', 'success');
        todayAtt.textContent = 'NIL';
        overallAtt.textContent = 'NIL';
    });

    const overall = await getOverallAttendance(ADMISSION_NO, details.arm_id, (err => { throw err }));

    todayAtt.textContent = currentAtt.attendance_status.toUpperCase();
    overallAtt.textContent = overall.percentage_present + '%';

}

async function getClassTimeTable() {

    const timeTable = await getCurrentTimetable((await getDetails()).arm_id, (err) => { throw err });

    const timeTableBody = document.querySelector('#todayTimetableBody');

    if (timeTable.length === 0) {
        timeTableBody.innerHTML =
            `
            <tr>
                <td colspan="3">
                <div class="empty-state">
                    No timetable set for your class yet.
                </div>
                </td>
            </tr>
            `;
        return;
    }

    timeTableBody.innerHTML = '';
    console.log(timeTable);
    const times = [...new Set(timeTable.map(record => record.time_allocated))];
    const subjects = timeTable.map(record => record.subject_name);
    const teachers = timeTable.map(record => `${record.teacher_lName ?? ''} ${record.teacher_fName ?? ''} ${record.teacher_mName ?? ''}`);

    for (let i = 0; i < times.length; i++) {

        const row = document.createElement('tr');

        for (let j = 0; j < 3; j++) {

            const cell = document.createElement('td');

            if (j === 0) {
                cell.textContent = times[i];
            }
            if (j == 1) {
                cell.textContent = subjects[i];
            }
            if (j === 2) {
                cell.textContent = teachers[i].trim() || 'Break';
            }
            row.appendChild(cell);
        }

        timeTableBody.appendChild(row);
    }

}

function getTeacherName(id) {
    return getAll('sms__teachers').filter(teacher => teacher.teacherID === id)[0].fullName;
}

displayDetails();
updateStatsRecord();
getClassTimeTable()