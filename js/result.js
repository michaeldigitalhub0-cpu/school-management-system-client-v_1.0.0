import { getAssessmentRecord, getDetails, getRecordAdmin } from "./services/admin_services/grade.service.js";
import { getMyDetails } from "./services/student_service/dashboard.service.js";
import { getStudentDetails } from "./services/teacher_services/grade.service.js";
import { renderNavByRole } from "./utils.js";

const CURRENT_USER_ROLE = sessionStorage.getItem('role');
const CURRENT_USER_ID = sessionStorage.getItem('userId');
renderNavByRole(CURRENT_USER_ROLE);

const searchData = new URLSearchParams(window.location.search);
const studentAdmissionNo = searchData.get('admissionNo');
const term = searchData.get('term');
const session = searchData.get('session');

async function setDetails() {

  if (CURRENT_USER_ROLE === 'admin') {

    const studentRecord = await getDetails(studentAdmissionNo, (err => { throw err }));
    document.querySelector('#resultStudentName').textContent = `${studentRecord.student_lName} ${studentRecord.student_fName} ${studentRecord.student_mName === 'null' ? '' : studentRecord.student_mName}`;
    document.querySelector('#resultAdmissionNo').textContent = studentRecord.admission_no;
    document.querySelector('#resultClass').textContent = studentRecord.class_group + " " + studentRecord.class_arm;
    document.querySelector('#resultTermLabel').textContent = term.toUpperCase() + ' TERM';
    document.querySelector('#resultSessionLabel').textContent = session;
  }

  if (CURRENT_USER_ROLE === 'teacher') {

    const studentRecord = await getStudentDetails(studentAdmissionNo, (err => { throw err }));

    document.querySelector('#resultStudentName').textContent = `${studentRecord.student_lName} ${studentRecord.student_fName} ${studentRecord.student_mName === 'null' ? '' : studentRecord.student_mName}`;
    document.querySelector('#resultAdmissionNo').textContent = studentRecord.admission_no;
    document.querySelector('#resultClass').textContent = studentRecord.class_group + " " + studentRecord.class_arm;
    document.querySelector('#resultTermLabel').textContent = term.toUpperCase() + ' TERM';
    document.querySelector('#resultSessionLabel').textContent = session;
  }
  if (CURRENT_USER_ROLE === 'student') {

    const data = await getMyDetails(studentAdmissionNo, (err => { throw err }));

    document.querySelector('#resultStudentName').textContent = `${data.student_lName} ${data.student_fName} ${data.student_mName === 'null' ? '' : data.student_mName}`;
    document.querySelector('#resultAdmissionNo').textContent = data.admission_no;
    document.querySelector('#resultClass').textContent = data.class_group + " " + data.class_arm;
    document.querySelector('#resultTermLabel').textContent = term.toUpperCase() + ' TERM';
    document.querySelector('#resultSessionLabel').textContent = session;

  }
}

async function constructResultTable() {

  const studentRecord = await getAssessmentRecord(
    studentAdmissionNo,
    term,
    session,
    (err => { throw err })
  );

  const resultRowsBody = document.querySelector('#resultRowsBody');

  if (studentRecord.length === 0) {
    resultRowsBody.innerHTML =
      `
       <tr>
            <td colspan="8">
               <div class="empty-state">Result not uploaded </div>
            </td>
         </tr>
      `;
    return;
  }

  resultRowsBody.innerHTML = '';
  resultRowsBody.innerHTML = studentRecord.map(grade =>
    `
      <tr>
        <td>${grade.subject_name}</td>
        <td>${grade.firstCA}</td>
        <td>${grade.secondCA}</td>
        <td>${grade.exam}</td>
        <td>${Number(grade.firstCA) + Number(grade.secondCA) + Number(grade.exam)}</td>
        <td>${getGrade(Number(grade.firstCA) + Number(grade.secondCA) + Number(grade.exam))}</td>
      </tr>
    `
  ).join('');

  async function getPostion() {

    const data = await getRecordAdmin((err => { throw err }));
    console.log(data);
    const students = [];
    const averages = [];

    for (let d of data) {
      if (students.indexOf(d.student_id) < 0) {
        students.push(d.student_id);
      }
    }

    for (let s of students) {
      let avr = 0;
      let sum = 0;
      let totalSubject = 0;
      for (let d of data) {
        if (d.student_id === s) {
          sum += Number(d.firstCA) + Number(d.secondCA) + Number(d.exam);
          totalSubject += 1;
        }
      }

      avr = totalSubject === 0 ? 0 : sum / totalSubject;
      averages.push({ student_id: s, avr });
    }

    const rank = averages.sort((a, b) => b.avr - a.avr);
    const position = [];

    rank.forEach((r, i, arr) => {
      console.log(i);
      position.push({
        ...r, p: arr[i - 1]?.avr === arr[i].avr ? (i - 1) + 1 : i + 1
      })
    })

    return position;
  }

  const position = await getPostion();
  console.log(position);
  document.querySelector('#resultAverage').textContent = getAverage() + " %";
  document.querySelector('#printResultBtn').addEventListener('click', () => window.print());
  document.querySelector('#resultPosition').textContent = position.find(p => p.student_id === studentAdmissionNo).p;
}

function getGrade(totalScore) {
  let grade;

  if (totalScore < 30) grade = 'F';
  else if (totalScore < 45) grade = 'E';
  else if (totalScore < 50) grade = 'D';
  else if (totalScore < 60) grade = 'C';
  else if (totalScore < 70) grade = 'B';
  else grade = 'A'
  return grade;
}

function getAverage() {
  let totalSubjects = 0;
  let totalScore = 0;
  let average = 0;
  Array.from(resultRowsBody.children).forEach(cell => {
    totalSubjects += 1;
    totalScore += Number(cell.children[4].textContent);
  })
  average = (totalScore / totalSubjects).toFixed(2);

  return average;
}

setDetails();
constructResultTable();