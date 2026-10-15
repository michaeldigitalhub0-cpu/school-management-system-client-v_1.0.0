import { getAllAttendance, getAllAttendanceClass } from "./services/admin_services/attendance.service.js";
import { createRecord, getAllAttendanceTeacher, getClassAttendanceTeacher, getCurrentAttendance, updateStudentRecord } from "./services/teacher_services/attendance.service.js";
import { getClassStudents, getMyDetails } from "./services/teacher_services/dashboard.js";
import { createNotification, getCurrentDate, loadClass, renderNavByRole } from "./utils.js";

const CURRENT_USER_ROLE = sessionStorage.getItem('role');
const CURRENT_USER_ID = sessionStorage.getItem('userId');

let domain_id;
let group_id;
let arm_id;

renderNavByRole(CURRENT_USER_ROLE);

function renderHTML() {

  const dataCard = document.querySelectorAll('.card');
  const field = document.querySelectorAll('.field');
  if (CURRENT_USER_ROLE === 'admin') {
    dataCard[0].style.display = 'none';
    dataCard[1].style.display = 'none';
  } else if (CURRENT_USER_ROLE === 'teacher') {
    dataCard[0].style.display = 'block';
    dataCard[1].style.display = 'block';
    field[9].style.display = 'none';
  }
}

if (CURRENT_USER_ROLE === 'admin') {
  loadClass('lookupClassDomain', 'lookupClassGroup', 'lookupClassArm')
  document.querySelector('#lookupDayBtn').addEventListener('click', getAttendance);
}

async function loadClassData() {

  const data = await getMyDetails(CURRENT_USER_ID, (err) => {

    if (err) throw err;
  });

  const fields = document.querySelectorAll('.field');

  document.querySelector('#domain').textContent = data.domain_name.toUpperCase();
  document.querySelector('#group').textContent = data.group_name;
  document.querySelector('#arm').textContent = data.arm_name;
  document.querySelector('#date').textContent = getCurrentDate();

  domain_id = data.domain_id;
  group_id = data.group_id;
  arm_id = data.arm_id;

  const group = document.createElement('p');
  const domain = document.createElement('p');
  const arm = document.createElement('p');

  group.setAttribute('id', 'lookUpGroup')
  domain.setAttribute('id', 'lookUpDomain')
  arm.setAttribute('id', 'lookUpArm')

  domain.textContent = data.domain_name.toUpperCase();
  group.textContent = data.group_name;
  arm.textContent = data.arm_name;

  fields[4].children[1].remove();
  fields[4].appendChild(domain);
  fields[5].children[1].remove();
  fields[5].appendChild(group);
  fields[6].children[1].remove();
  fields[6].appendChild(arm);
}

async function getStudents() {

  const teacher = await getMyDetails(CURRENT_USER_ID, (err) => { if (err) throw err });

  const data = await getClassStudents(teacher.arm_id, (err) => { if (err) throw err });

  return data;
}

async function loadStudentList() {
  const attendanceRecordSheet = document.querySelector('#attendanceRosterBody');
  let studentCount = 1;
  const students = await getStudents();

  attendanceRecordSheet.innerHTML = '';
  if (students.length === 0) {
    attendanceRecordSheet.innerHTML =
      `
        <tr>
          <td colspan="4">
            <div class="empty-state">No available student/s</div>
          </td>
        </tr>
        `
    return;
  }

  students.forEach((student) => {
    const record = document.createElement('tr');
    const count = document.createElement('td');
    const admissionNo = document.createElement('td');
    const studentName = document.createElement('td');
    const attendanceStatus = document.createElement('td');

    const presentLabelElement = document.createElement('label');
    const absentLabelElement = document.createElement('label');
    const presentRadio = document.createElement('input');
    const absentRadio = document.createElement('input');

    count.textContent = studentCount;
    admissionNo.textContent = student.admission_no;
    studentName.textContent = `${student.student_lName} ${student.student_fName} ${student.student_mName || ''}`;

    presentLabelElement.textContent = 'present: ';
    presentLabelElement.setAttribute('for', 'present');
    absentLabelElement.textContent = 'absent: ';
    absentLabelElement.setAttribute('for', 'absent');

    presentRadio.setAttribute('type', 'radio');
    presentRadio.setAttribute('name', `status_row_${studentCount}`);
    presentRadio.setAttribute('id', 'present');
    absentRadio.setAttribute('type', 'radio');
    absentRadio.setAttribute('name', `status_row_${studentCount}`);
    presentRadio.setAttribute('id', 'absent');

    attendanceStatus.appendChild(presentLabelElement);
    attendanceStatus.appendChild(presentRadio);
    attendanceStatus.appendChild(absentLabelElement);
    attendanceStatus.appendChild(absentRadio);

    record.appendChild(count);
    record.appendChild(admissionNo);
    record.appendChild(studentName);
    record.appendChild(attendanceStatus);

    attendanceRecordSheet.appendChild(record);
    studentCount++;
  });
}

async function saveAttendance() {

  const newAttendance = {
    form_teacher: CURRENT_USER_ID,
    class_domain: domain_id,
    class_group: group_id,
    class_arm: arm_id,
    attendance_record: [],
  }

  const roster = document.querySelector('#attendanceRosterBody');
  const record = Array.from(roster.children);

  record.forEach(record => {

    newAttendance.attendance_record.push({
      student_id: record.children[1].textContent,
      status: getStatus(record.children[3].children)
    });
  })

  function getStatus(source) {
    if (source[1].checked) return 'present';
    if (source[3].checked) return 'absent';
    return 'absent';
  }

  await createRecord(newAttendance, (err, data) => {

    if (err) return createNotification('attendanceAlert', err.message, 'error');

    loadCurrentAttendance();

    loadAttendanceHistory();

    createNotification('attendanceAlert', data.message, 'success');

  })
}

async function updateAttendance(id, newRecord) {

  await updateStudentRecord(id, newRecord, (err, data) => {

    if (err) return createNotification('attendanceAlert', err.message, 'error');

    createNotification('attendanceAlert', data.message, 'success');

    loadCurrentAttendance();
  })
}

if (CURRENT_USER_ROLE === 'teacher') {

  loadClassData();

  document.body.addEventListener('click', async (event) => {

    if (event.target.tagName !== 'BUTTON') return;

    if (event.target.id === 'loadClassListBtn') await loadStudentList();

    if (event.target.id === 'saveAttendanceBtn') await saveAttendance();

    if (event.target.id === 'lookupDayBtn') getAttendance();

    if (event.target.id === 'updateCurrentAttendance') {

      await loadStudentList();

      const saveUpdateBtn = document.createElement('button');
      saveUpdateBtn.setAttribute('id', 'saveUpdate');
      saveUpdateBtn.textContent = 'Save update';
      saveUpdateBtn.setAttribute('class', 'btn btn-primary');

      document.querySelectorAll('.form-actions')[1].appendChild(saveUpdateBtn);
      document.querySelector('#updateCurrentAttendance').style.display = 'none';
    }

    if (event.target.id === 'saveUpdate') {

      const id = document.querySelectorAll('.table-wrap')[0].id;
      const update = await getUpdatedData();

      console.log(update, id);

      await updateAttendance(id, update);

      loadCurrentAttendance();

      loadAttendanceHistory();
    }
  })
}

async function getUpdatedData() {

  const newAttendance = {
    form_teacher: CURRENT_USER_ID,
    class_domain: domain_id,
    class_group: group_id,
    class_arm: arm_id,
    attendance_record: [],
  }

  const roster = document.querySelector('#attendanceRosterBody');
  const record = Array.from(roster.children);

  record.forEach(record => {

    newAttendance.attendance_record.push({
      student_id: record.children[1].textContent,
      status: getStatus(record.children[3].children)
    });
  })

  function getStatus(source) {
    if (source[1].checked) return 'present';
    if (source[3].checked) return 'absent';
    return 'absent';
  }

  return newAttendance;
}

function getLookUpData() {
  let classDomain, classGroup, classArm;
  if (CURRENT_USER_ROLE === 'admin') {
    classDomain = document.querySelector('#lookupClassDomain');
    classGroup = document.querySelector('#lookupClassGroup');
    classArm = document.querySelector('#lookupClassArm');
  }

  if (CURRENT_USER_ROLE === 'teacher') {
    classDomain = document.querySelector('#lookUpDomain');
    classGroup = document.querySelector('#lookUpGroup');
    classArm = document.querySelector('#lookUpArm');
  }
  const date = document.querySelector('#lookupDate');

  function getData() {

    if (CURRENT_USER_ROLE === 'admin') {
      return {
        classDomain: classDomain.value,
        classGroup: classGroup.value,
        classArm: classArm.value,
        date: date.value
      }
    }

    if (CURRENT_USER_ROLE === 'teacher') {
      return {
        classDomain: classDomain.textContent,
        classGroup: classGroup.textContent,
        classArm: classArm.textContent,
        date: date.value
      }
    }
  }

  function clearInput() {
    classDomain.value = '';
    classGroup.value = '';
    classArm.value = '';
    date.value = '';
  }

  return { getData, clearInput };
}

function showEmptyLookup(message) {
  const attendanceBody = document.querySelector('#dailyLookupBody');
  attendanceBody.innerHTML = `
    <tr>
      <td colspan="3">
        <div class="empty-state">${message}</div>
      </td>
    </tr>
  `;
}

function getAttendance() {
  const lookUpData = getLookUpData();

  const attendanceBody = document.querySelector('#dailyLookupBody');

  attendanceBody.innerHTML = '';
  loadLookUp(CURRENT_USER_ROLE);

  let teacherAttendance = [];
  let adminAttendance = [];

  async function loadLookUp(role) {
    if (role === 'admin') {
      const requestData = lookUpData.getData();

      const data = await getAllAttendanceClass(requestData.classArm, (err) => {

        if (err) throw err;
      });

      console.log(data);
      const attendance = data.filter(att => att.date_taken === requestData.date);
      let students = [];
      attendance.forEach(data => {
        students = students.concat(data.student_record);
      })

      if (students.length === 0) {
        showEmptyLookup('No attendance recorded for this class on this date.');
        clearSummary();
        return;
      }

      adminAttendance = attendance;

      displayValues()
      students.forEach(student => {
        const record = document.createElement('tr');
        const admissionNo = document.createElement('td');
        const studentName = document.createElement('td');
        const attendanceStatus = document.createElement('td');

        admissionNo.textContent = student.student_id;
        studentName.textContent = `${student.lName} ${student.fName} ${student.mName || ''}`;
        attendanceStatus.textContent = student.status;

        record.appendChild(admissionNo);
        record.appendChild(studentName);
        record.appendChild(attendanceStatus);
        attendanceBody.appendChild(record)
      });
    }

    if (role === 'teacher') {

      const attendance = await getClassAttendanceTeacher(lookUpData.getData().date);

      if (attendance.length === 0) {
        showEmptyLookup('You have not recorded attendance for this date.');
        clearSummary();
        return;
      }

      teacherAttendance = attendance;
      displayValues()
      attendance[0].student_record.forEach(student => {
        const record = document.createElement('tr');
        const admissionNo = document.createElement('td');
        const studentName = document.createElement('td');
        const attendanceStatus = document.createElement('td');

        admissionNo.textContent = student.student_id;
        studentName.textContent = `${student.lName} ${student.fName} ${student.mName || ''}`;
        attendanceStatus.textContent = student.status;

        record.appendChild(admissionNo);
        record.appendChild(studentName);
        record.appendChild(attendanceStatus);
        attendanceBody.appendChild(record)
      })
    }
  }

  function clearSummary() {
    document.querySelector('#summaryTotal').textContent = '—';
    document.querySelector('#summaryPresent').textContent = '—';
    document.querySelector('#summaryAbsent').textContent = '—';
    document.querySelector('#summaryPercent').textContent = '—';
  }

  function displayValues() {
    const totalStudentsPlaceholder = document.querySelector('#summaryTotal');
    const totalPresentPlaceholder = document.querySelector('#summaryPresent');
    const totalAbsentPlaceholder = document.querySelector('#summaryAbsent');
    const percentageOfPresentPlaceholder = document.querySelector('#summaryPercent');

    let totalStudents = 0;
    let totalPresent = 0;
    let totalAbsent = 0;
    let percentage = 0;

    if (CURRENT_USER_ROLE === 'teacher') {

      if (teacherAttendance.length === 0) {
        clearSummary();
        return;
      }

      totalStudents = teacherAttendance[0].student_record.length;
      teacherAttendance[0].student_record.forEach(student => {
        student.status === 'present' ? totalPresent++ : totalAbsent++;
      })

      percentage = totalStudents === 0 ? 0 : Math.round((totalPresent / totalStudents) * 100);

      totalStudentsPlaceholder.textContent = totalStudents;
      totalPresentPlaceholder.textContent = totalPresent;
      totalAbsentPlaceholder.textContent = totalAbsent;
      percentageOfPresentPlaceholder.textContent = percentage + '%';
    }

    if (CURRENT_USER_ROLE === 'admin') {

      if (adminAttendance.length === 0) {
        clearSummary();
        return;
      }

      adminAttendance.forEach(record => {
        totalStudents += record.student_record.length;
        record.student_record.forEach(student => {
          student.status === 'present' ? totalPresent++ : totalAbsent++;
        })
      })
      percentage = totalStudents === 0 ? 0 : Math.round((totalPresent / totalStudents) * 100);

      totalStudentsPlaceholder.textContent = totalStudents;
      totalPresentPlaceholder.textContent = totalPresent;
      totalAbsentPlaceholder.textContent = totalAbsent;
      percentageOfPresentPlaceholder.textContent = percentage + '%';
    }
  }

}

async function loadCurrentAttendance() {

  const attendanceRecordSheet = document.querySelector('#attendanceRosterBody');

  let studentCount = 1;

  if (CURRENT_USER_ROLE === 'teacher') {

    const teacher = await getMyDetails(CURRENT_USER_ID, (err) => { if (err) throw err });

    const data = await getCurrentAttendance(teacher.arm_id);

    if (data.length === 0) {
      attendanceRecordSheet.innerHTML =
        `
        <tr>
          <td colspan="4">
            <div class="empty-state">Attendance not taken yet.</div>
          </td>
        </tr>
        `
      return;
    }

    if (data.length === 0) {    // the latest attendance (last recordt)
      attendanceRecordSheet.innerHTML =
        `
        <tr>
          <td colspan="4">
            <div class="empty-state">Attendance not taken today.</div>
          </td>
        </tr>
        `
      return;
    }

    document.querySelector('.table-wrap').setAttribute('id', data[0].attendance_id);
    attendanceRecordSheet.innerHTML = '';
    data[0].student_record.forEach(student => {
      const record = document.createElement('tr');
      const count = document.createElement('td');
      const admissionNo = document.createElement('td');
      const studentName = document.createElement('td');
      const attendanceStatus = document.createElement('td');

      const presentLabelElement = document.createElement('label');
      const absentLabelElement = document.createElement('label');
      const presentRadio = document.createElement('input');
      const absentRadio = document.createElement('input');

      count.textContent = studentCount;
      admissionNo.textContent = student.student_id;
      studentName.textContent = `${student.lName} ${student.fName} ${student.mName || null}`;

      presentLabelElement.textContent = 'present: ';
      presentLabelElement.setAttribute('for', 'present');
      absentLabelElement.textContent = 'absent: ';
      absentLabelElement.setAttribute('for', 'absent');

      presentRadio.setAttribute('type', 'radio');
      presentRadio.setAttribute('name', `status_row_${studentCount}`);
      presentRadio.setAttribute('id', 'present');
      absentRadio.setAttribute('type', 'radio');
      absentRadio.setAttribute('name', `status_row_${studentCount}`);
      presentRadio.setAttribute('id', 'absent');

      presentRadio.checked = student.status === 'present' ? true : false;
      absentRadio.checked = student.status === 'absent' ? true : false;
      presentRadio.disabled = true;
      absentRadio.disabled = true;

      attendanceStatus.appendChild(presentLabelElement);
      attendanceStatus.appendChild(presentRadio);
      attendanceStatus.appendChild(absentLabelElement);
      attendanceStatus.appendChild(absentRadio);

      record.appendChild(count);
      record.appendChild(admissionNo);
      record.appendChild(studentName);
      record.appendChild(attendanceStatus);

      attendanceRecordSheet.appendChild(record);
      studentCount++;
    })
  }
}

function loadAttendanceHistory() {

  const tableBody = document.querySelector('#attendanceHistoryBody');

  function buildRow(data) {
    const record = document.createElement('tr');

    const date = document.createElement('td');
    const studentClass = document.createElement('td');
    const admissionData = document.createElement('td');
    const studentNameData = document.createElement('td');
    const statusData = document.createElement('td');

    date.textContent = data.date_taken;
    studentClass.textContent = data.group_name + " " + data.arm_name;

    record.appendChild(date);
    record.appendChild(studentClass);

    data.student_record.forEach(student => {
      const admissionRecord = document.createElement('table');
      const studentNameRecord = document.createElement('table');
      const statusRecord = document.createElement('table');

      const adRecord = document.createElement('tr');
      const stnRecord = document.createElement('tr');
      const stRecord = document.createElement('tr');

      const admissionNo = document.createElement('td');
      const studentName = document.createElement('td');
      const status = document.createElement('td');

      admissionNo.textContent = student.student_id;
      studentName.textContent = `${student.lName} ${student.lName} ${student.mName || null}`;
      status.textContent = student.status;

      adRecord.appendChild(admissionNo);
      stnRecord.appendChild(studentName);
      stRecord.appendChild(status);

      admissionRecord.appendChild(adRecord);
      studentNameRecord.appendChild(stnRecord);
      statusRecord.appendChild(stRecord);

      admissionData.appendChild(admissionRecord);
      studentNameData.appendChild(studentNameRecord);
      statusData.appendChild(statusRecord);
    })

    record.appendChild(admissionData);
    record.appendChild(studentNameData);
    record.appendChild(statusData);

    tableBody.appendChild(record);
  }

  async function loadHistory(role) {

    tableBody.innerHTML = '';

    if (role === 'teacher') {

      const teacher = await getMyDetails(CURRENT_USER_ID, (err) => { if (err) throw err });

      const data = await getAllAttendanceTeacher(teacher.arm_id, (err) => {

        if (err) createNotification('attendanceAlert', err.message, 'success');
        throw err;
      })

      if (data.length === 0) {
        tableBody.innerHTML = `
        <tr>
          <td colspan="5">
            <div class="empty-state">No attendance recorded yet.</div>
          </td>
        </tr>
      `;
        return;
      }

      data.forEach(attData => {
        buildRow(attData);
      })
    }

    if (role === 'admin') {

      const data = await getAllAttendance((err) => {

        createNotification('attendanceAlert', err.message, 'success')
        if (err) throw err;
      });

      if (data.length === 0) {
        tableBody.innerHTML = `
        <tr>
          <td colspan="5">
            <div class="empty-state">No attendance recorded yet.</div>
          </td>
        </tr>
      `;
        return;
      }

      data?.forEach(attData => buildRow(attData))
    }
  }
  loadHistory(CURRENT_USER_ROLE);
}

function searchRecord() {
  const searchInput = document.querySelector('#attendanceHistorySearch');

  searchInput.addEventListener('input', () => {

    const query = searchInput.value.toLowerCase().trim();
    const rows = document.querySelectorAll('#attendanceHistoryBody tr');

    rows.forEach(row => {
      const cells = row.children;
      if (cells.length < 5) return;

      const admissionCells = Array.from(cells[2].querySelectorAll('td'));
      const nameCells = Array.from(cells[3].querySelectorAll('td'));

      const matches = admissionCells.some(c => c.textContent.toLowerCase().includes(query))
        || nameCells.some(c => c.textContent.toLowerCase().includes(query));

      row.style.display = matches ? '' : 'none';
    })
  });
}

function filterRecord() {
  const historyDateFilter = document.querySelector('#historyDateFilter');
  const historyClassFilter = document.querySelector('#historyClassFilter');

  if (CURRENT_USER_ROLE === 'teacher') {

    historyDateFilter.addEventListener('input', () => {

      const query = historyDateFilter.value;
      const rows = document.querySelectorAll('#attendanceHistoryBody tr');

      rows.forEach(row => {
        const cells = row.children;
        if (cells.length < 5) return;

        const dateCells = cells[0].textContent;
        const matches = dateCells.includes(query);
        row.style.display = matches ? '' : 'none';
      })
    });
  }

  if (CURRENT_USER_ROLE === 'admin') {

    historyDateFilter.addEventListener('input', () => {

      const query = historyDateFilter.value;
      const rows = document.querySelectorAll('#attendanceHistoryBody tr');

      rows.forEach(row => {
        const cells = row.children;
        if (cells.length < 5) return;

        const dateCells = cells[0].textContent;
        const matches = dateCells.includes(query);
        row.style.display = matches ? '' : 'none';
      })
    });

    //   historyClassFilter.addEventListener('input', (event) => {
    //     const classQuery = event.target.value.toLowerCase().trim();
    //     const rows = document.querySelectorAll('#attendanceHistoryBody tr');

    //     rows.forEach(row => {
    //       const cells = row.children;
    //       if (cells.length < 2) return;
    //       row.style.display = cells[1].textContent.toLowerCase().includes(classQuery) ? '' : 'none';
    //     })
    //   })
    // }

  }

}
renderHTML();
loadCurrentAttendance();
loadAttendanceHistory();
searchRecord();
filterRecord();