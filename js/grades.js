
'use strict';

import { getRecordAdmin } from "./services/admin_services/grade.service.js";
import { getAllStudents } from "./services/admin_services/student.service.js";
import { getClassStudents } from "./services/teacher_services/dashboard.js";
import { createRecord, deleteRecord, getRecord, updateRecord } from "./services/teacher_services/grade.service.js";
import { getAllSubjectsClass } from "./services/teacher_services/subject.service.js";
import { createNotification, renderNavByRole } from "./utils.js";

const CURRENT_USER_ROLE = sessionStorage.getItem('role');
const CURRENT_USER_ID = sessionStorage.getItem('userId');

const cards = document.querySelectorAll('.card');
renderNavByRole(CURRENT_USER_ROLE);

if (CURRENT_USER_ROLE === 'admin') {
  cards[0].style.display = 'none';
} else if (CURRENT_USER_ROLE === 'teacher') {
  cards[0].style.display = 'block';
}

async function loadStudents(element_id, list_id) {
  const studentSelectElement = document.querySelector(`#${list_id}`);
  const student_select_element = document.querySelector(`#${element_id}`);
  const schoolSessions = document.querySelector('#resultSession');

  function createList(sourceElement, list) {
    list.forEach(student => {
      const option = document.createElement('option');
      option.setAttribute('value', student.admission_no);
      option.textContent = `${student.student_lName} ${student.student_fName} ${student.student_mName || ''}`;
      sourceElement?.appendChild(option);
    });
  }

  async function loadSessions(sourceElement) {

    let records;

    if (CURRENT_USER_ROLE === 'admin') {

      const adminRecord = await getRecordAdmin((err) => { throw err });

      records = adminRecord;
    }

    if (CURRENT_USER_ROLE === 'teacher') {

      const teacherRecord = await getRecord(CURRENT_USER_ID, (err) => { throw err });

      records = teacherRecord;
    }

    const sessions = [];

    records.forEach(record => {
      let ver = sessions.indexOf(record.school_session) < 0;
      if (ver) {
        sessions.push(record.school_session);
      }
    })

    sessions.forEach(session => {
      const option = document.createElement('option');
      option.setAttribute('value', session);
      option.textContent = session;
      sourceElement.appendChild(option);
    });
  }

  if (CURRENT_USER_ROLE === 'admin') {

    const data = await getAllStudents((err) => { throw err })

    createList(studentSelectElement, data);
    createList(student_select_element, data);
    loadSessions(schoolSessions);

  }

  if (CURRENT_USER_ROLE === 'teacher') {

    const data = await getClassStudents(CURRENT_USER_ID, (err) => { throw err });

    createList(studentSelectElement, data);
    createList(student_select_element, data);
    loadSessions(schoolSessions);
  }
}

async function loadSubjects(subject_id) {
  const subjectSelectElement = document.querySelector(`#${subject_id}`);

  const data = await getAllSubjectsClass(CURRENT_USER_ID, (err) => { throw err });

  data.forEach(subject => {

    const option = document.createElement('option');
    option.setAttribute('value', subject.subject_id);
    option.textContent = subject.subject_name;
    subjectSelectElement.appendChild(option);
  })
}

function getStudentResult() {
  const studentData = document.querySelector('#gradeAdmissionNo');
  const subject = document.querySelector('#gradeSubject');
  const term = document.querySelector('#gradeTerm');
  const firstCA = document.querySelector('#gradeCA1');
  const secondCA = document.querySelector('#gradeCA2');
  const exam = document.querySelector('#gradeExam');

  function getData() {

    return {
      student_id: studentData.value,
      subject_id: subject.value,
      term: term.value,
      firstCA: firstCA.value,
      secondCA: secondCA.value,
      exam: exam.value
    }
  }

  function clearInputs() {
    studentData.value = '';
    subject.value = '';
    term.value = '';
    firstCA.value = 0;
    secondCA.value = 0;
    exam.value = 0;
  }

  return { getData, clearInputs };
}

async function saveStudentScore() {

  const studentRecord = getStudentResult();

  await createRecord(studentRecord.getData(), (err, data) => {

    if (err) return createNotification('gradesAlert', err.message, 'error');

    createNotification('gradesAlert', data.message, 'success');

    studentRecord.clearInputs();
    renderStudentGradeRecord();

  });
}

async function renderStudentGradeRecord() {

  const studentGradeRecord = document.querySelector('#gradesTableBody');

  if (CURRENT_USER_ROLE === 'teacher') {
    const classRecord = await getRecord(CURRENT_USER_ID, (err) => { throw err });

    if (classRecord.length === 0) {
      studentGradeRecord.innerHTML =
        `
      <tr>
        <td colspan="10">
          <div class="empty-state">No scores entered yet.</div>
        </td>
      </tr>
      `;
      return;
    }

    studentGradeRecord.innerHTML = '';
    classRecord.forEach(record => {
      studentGradeRecord.innerHTML +=
        `
        <tr">
          <td>${record.student_id}</td>
          <td>${record.lName} ${record.fName} ${record.mName === 'null' ? '' : record.mName}</td>
          <td>${record.subject_name}</td>
          <td>${record.term}</td>
          <td>${record.school_session}</td>
          <td>${record.firstCA}</td>
          <td>${record.secondCA}</td>
          <td>${record.exam}</td>
          <td>${Number(record.firstCA) + Number(record.secondCA) + Number(record.exam)}</td>
          <td>${getGrade(Number(record.firstCA) + Number(record.secondCA) + Number(record.exam))}</td>
          <td><button id="${record.grade_id}" class="btn btn-primary btn-sm" >Edit</button><button id="${record.grade_id}" class="btn btn-primary btn-sm">Delete</button></td>
        </tr>
    `;
    });
  }

  if (CURRENT_USER_ROLE === 'admin') {

    const schoolRecord = await getRecordAdmin((err) => { throw err });

    if (schoolRecord.length === 0) {
      studentGradeRecord.innerHTML =
        `
      <tr>
        <td colspan="10">
          <div class="empty-state">No scores entered yet.</div>
        </td>
      </tr>
      `;
      return;
    }

    studentGradeRecord.innerHTML = '';
    schoolRecord.forEach(record => {
      studentGradeRecord.innerHTML +=
        `
        <tr">
          <td>${record.student_id}</td>
          <td>${record.lName} ${record.fName} ${record.mName === 'null' ? '' : record.mName}</td>
          <td>${record.subject_name}</td>
          <td>${record.term}</td>
          <td>${record.school_session}</td>
          <td>${record.firstCA}</td>
          <td>${record.secondCA}</td>
          <td>${record.exam}</td>
          <td>${Number(record.firstCA) + Number(record.secondCA) + Number(record.exam)}</td>
          <td>${getGrade(Number(record.firstCA) + Number(record.secondCA) + Number(record.exam))}</td>
          <td><button disabled >Edit</button><button disabled>Delete</button></td>
        </tr>
    `;
    });

  }
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

async function updateGradeRecord(id, update) {

  await updateRecord(id, update, (err, data) => {

    if (err) return createNotification('gradesAlert', err.message, 'error');

    createNotification('gradesAlert', data.message, 'success');

    renderStudentGradeRecord();
  })
}

async function deleteGradeRecord(id) {

  await deleteRecord(id, (err, data) => {

    if (err) return createNotification('gradesAlert', err.message, 'error');

    createNotification('gradesAlert', data.message, 'success');

    renderStudentGradeRecord();
  })
}

function updateDialogueBox() {
  const overlay = document.createElement('div');
  overlay.className = 'box_overlay';
  const box = document.createElement('div');
  box.id = 'update_box';
  const html = `
        <div class="field">
            <label for="n_student">Student</label>
            <select name="n_student" id="n_student">
                <option value="" selected disabled>Select Student</option>
                <!-- loaded from server -->
            </select>
        </div>
        <div class="field">
            <label for="n_subject">Subject</label>
            <select name="n_subject" id="n_subject">
                <option value="" selected disabled>Select subject</option>
                <!-- loaded from server -->
            </select>
        </div>
        <div class="field">
            <label for="n_term">Term</label>
            <select name="n_term" id="n_term">
                <option value="" selected disabled>Select term</option>
                <option value="first">Frist term</option>
                <option value="second">Second term</option>
                <option value="third">Third term</option>
            </select>
        </div>
        <div class="field">
            <label for="n_firstCA">First CA</label>
            <input type="text" name="n_firstCA" id="n_firstCA" />
        </div>
        <div class="field">
            <label for="n_secondCA">Second CA</label>
            <input type="text" name="n_secondCA" id="n_secondCA" />
        </div>
        <div class="field">
            <label for="n_exam">Exam</label>
            <input type="text" name="n_exam" id="n_exam" />
        </div>
        <div class="form-actions">
            <button type="submit" class="btn btn-primary" id="update">
              Update data
            </button>
            <button type="submit" class="btn btn-secondary" id="abort">
              Abort
            </button>
        </div>
    `;
  box.innerHTML = html;
  overlay.appendChild(box);
  document.body.appendChild(overlay);
}

function getUpdate() {

  const subject = document.querySelector('#n_subject');
  const student = document.querySelector('#n_student');
  const term = document.querySelector('#n_term');
  const firstCA = document.querySelector('#n_firstCA');
  const secondCA = document.querySelector('#n_secondCA');
  const exam = document.querySelector('#n_exam');

  return {
    subject_id: subject.value,
    student_id: student.value,
    term: term.value,
    firstCA: firstCA.value,
    secondCA: secondCA.value,
    exam: exam.value
  }
}

function setEventListener() {

  document.body.addEventListener('click', async (event) => {

    if (event.target.tagName !== 'BUTTON') return;

    const row = event.target.parentElement.parentElement;

    if (event.target.textContent.toLowerCase() === 'edit') {

      updateDialogueBox();
      loadStudents('n_student');
      loadSubjects('n_subject');

      document.querySelector('#update_box').className = event.target.id;

      document.querySelector('#n_firstCA').value = row.children[5].textContent;
      document.querySelector('#n_secondCA').value = row.children[6].textContent;
      document.querySelector('#n_exam').value = row.children[7].textContent;

      row.children[3].textContent.toLowerCase() === 'first'
        ? document.querySelector('#n_term').children[1].selected = true
        : row.children[3].textContent.toLowerCase() === 'second'
          ? document.querySelector('#n_term').children[2].selected = true
          : row.children[3].textContent.toLowerCase() === 'third'
            ? document.querySelector('#n_term').children[3].selected = true
            : null;
    }

    if (event.target.id === 'update') {

      const box = document.querySelector('.box_overlay');

      const update = getUpdate();
      await updateGradeRecord(event.target.parentElement.parentElement.className, update);
      document.body.removeChild(box);
    }

    if (event.target.id === 'abort') {

      const box = document.querySelector('.box_overlay');
      document.body.removeChild(box);
    }

    if (event.target.textContent.toLowerCase() === 'delete') {

      await deleteGradeRecord(event.target.id);
    }
  })
}

function initRecordSearch() {
  const searchInputElement = document.querySelector('#gradeSearch');
  const gradeRecord = document.querySelectorAll('#gradesTableBody tr');

  searchInputElement.addEventListener('input', () => {
    const query = searchInputElement.value.toLowerCase().trim();

    gradeRecord.forEach(row => {
      const admissionNo = row.children[0].textContent.toLowerCase();
      const studentName = row.children[1].textContent.toLowerCase();

      row.style.display = admissionNo.includes(query) || studentName.includes(query) ? '' : 'none';
    })
  })
}

function printResult() {
  const student = document.querySelector('#resultAdmissionNo');
  const term = document.querySelector('#resultTerm');
  const session = document.querySelector('#resultSession');

  document.querySelector('#openStudentResult').addEventListener('submit', (event) => {
    event.preventDefault();
    const urlString = new URL(location.origin + '/pages/result.html');

    urlString.searchParams.append('admissionNo', student.value);
    urlString.searchParams.append('term', term.value);
    urlString.searchParams.append('session', session.value);
    window.location.href = urlString.href;
  })
}

document.querySelector('#gradeForm').addEventListener('submit', (event) => {
  event.preventDefault();
  saveStudentScore();
})

loadStudents('resultAdmissionNo', 'gradeAdmissionNo');
CURRENT_USER_ROLE === 'teacher' ? loadSubjects('gradeSubject') : null;
renderStudentGradeRecord();
setEventListener();
initRecordSearch();
printResult()