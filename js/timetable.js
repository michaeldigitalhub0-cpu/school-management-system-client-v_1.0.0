
'use strict';

import { api_fetch } from "./database/db.js";
import { createNotification, loadClass } from "./utils.js";

const TIMETABLE_KEY = 'sms__timetable';
const PERIOD_TIMES = Object.freeze(['08:00-09:00', '09:00-10:00', '10:00-11:00', '11:00-11:15', '11:15-12:15', '12:15-01:15', '01:15-02:15']);
const DAYS = Object.freeze(['monday', 'tuesday', 'wednesday', 'thursday', 'friday']);
const BREAK_SUBJECT = 'Break';
const BREAK_ROW_INDEX = 3;

/* ---------------------------------------------------------------
   Data helpers
--------------------------------------------------------------- */

async function buildSubjectSelect(class_domain, class_group, savedValue) {

  const response = await api_fetch('/subject/all', { method: 'GET' });

  if (!response.ok) {
    const err = await response.json();
    throw err.message;
  }

  const { data } = await response.json();

  const matched = data.filter(subject =>
    subject.domain_id === class_domain && subject.group_id === class_group
  );

  const selectElement = document.createElement('select');
  selectElement.classList.add('period-subject');

  const blank = document.createElement('option');
  blank.setAttribute('value', '');
  blank.textContent = matched.length === 0 ? 'No subjects for this class yet' : 'Select subject';
  selectElement.appendChild(blank);

  matched.forEach(subject => {
    const option = document.createElement('option');
    option.setAttribute('value', subject.subject_id);
    option.textContent = subject.subject_name;
    if (subject.subject_name === savedValue) option.selected = true;
    selectElement.appendChild(option);
  });

  return selectElement;
}

async function findExistingTimetable(class_arm) {

  const response = await api_fetch(`/timetable/${class_arm}`, { method: 'GET' });

  if (!response.ok) {
    const err = await response.json();
    throw err.message;
  }

  const { data } = await response.json();
  return data;
}

// Read the three dropdowns once — every action needs them.
function readSelection() {
  const class_domain = document.querySelector('#ttClassDomain').value;
  const class_group = document.querySelector('#ttClassGroup').value;
  const class_arm = document.querySelector('#ttClassArm').value;

  if (!class_domain || !class_group || !class_arm) {
    createNotification('timetableAlert', 'Select a class type, group, and class first.', 'error');
    return null;
  }
  return { class_domain, class_group, class_arm };
}

// Turn the flat records into the pieces every grid render needs.
function organiseRecords(existing) {
  const timeSlots = [...new Set(existing.map(r => r.time_allocated))];
  const days = [...new Set(existing.map(r => r.day_of_week))];

  const lookup = new Map(
    existing.map(r => [`${r.day_of_week}|${r.time_allocated}`, r])
  );

  const breakTimes = new Set(
    existing.filter(r => r.subject_name === BREAK_SUBJECT).map(r => r.time_allocated)
  );

  return { timeSlots, days, lookup, breakTimes };
}

/* ---------------------------------------------------------------
   Shared grid renderer
   mode = 'view'   → read-only cells
   mode = 'edit'   → subject <select> per cell
--------------------------------------------------------------- */
async function renderGrid(existing, mode) {
  const class_domain = document.querySelector('#ttClassDomain').value;
  const class_group = document.querySelector('#ttClassGroup').value;

  const timeTableGridBody = document.querySelector('#timetableGridBody');
  timeTableGridBody.innerHTML = '';

  const { timeSlots, days, lookup, breakTimes } = organiseRecords(existing);

  for (const time of timeSlots) {
    const row = document.createElement('tr');

    // -- Time column
    const timeCell = document.createElement('td');
    const timeInput = document.createElement('div');
    timeInput.classList.add('period-time');
    timeInput.textContent = time;
    if (breakTimes.has(time)) timeInput.disabled = true;
    timeCell.appendChild(timeInput);
    row.appendChild(timeCell);

    // -- Day columns
    for (const day of days) {
      const cell = document.createElement('td');
      const slot = lookup.get(`${day}|${time}`);

      if (!slot) {
        cell.textContent = '—';
      } else if (slot.subject_name === BREAK_SUBJECT) {
        cell.textContent = 'Break';
      } else if (mode === 'edit') {
        const selectElement = await buildSubjectSelect(class_domain, class_group, slot.subject_name);
        cell.appendChild(selectElement);
      } else {
        cell.innerHTML = `
          <div class="slot">
            <div><strong>${slot.subject_name}</strong></div>
            <small>${slot.teacher_lName} ${slot.teacher_fName} ${slot.teacher_mName ?? ''}</small>
          </div>`;
      }

      row.appendChild(cell);
    }

    timeTableGridBody.appendChild(row);
  }
}

// Read the grid back into the `period` array the API expects.
function collectPeriods() {
  const timeTableGridBody = document.querySelector('#timetableGridBody');
  const rows = Array.from(timeTableGridBody.children);

  if (rows.length === 0) {
    createNotification('timetableAlert', 'Load the timetable grid first before saving.', 'error');
    return null;
  }

  return rows.map((row, i) => {
    const timeInput = row.children[0].querySelector('input');
    const period = { time: timeInput ? timeInput.value : PERIOD_TIMES[i] };

    if (i === BREAK_ROW_INDEX) return period;

    DAYS.forEach((dayKey, dayIndex) => {
      const cell = row.children[dayIndex + 1];
      const subjectSelect = cell.querySelector('.period-subject');
      period[dayKey] = { subject_id: subjectSelect ? subjectSelect.value : '' };
    });

    return period;
  });
}

/* ---------------------------------------------------------------
   Buttons/UI helpers
--------------------------------------------------------------- */

function makeActionButton(id, label) {
  const btn = document.createElement('button');
  btn.setAttribute('class', 'btn btn-primary');
  btn.setAttribute('id', id);
  btn.textContent = label;
  return btn;
}

function getActionBar() {
  return document.querySelectorAll('.form-actions')[1];
}

// Hide Save-new, show Update + Delete, wire them up.
function attachViewModeActions() {
  document.querySelector('#saveTimetableBtn').style.display = 'none';

  const update_btn = makeActionButton('updateTimetableBtn', 'Update');
  const delete_btn = makeActionButton('deleteTimetableBtn', 'Delete');
  const save_update = makeActionButton('saveUpdateBtn', 'Save update');

  const bar = getActionBar();
  document.querySelector('#saveTimetableBtn').style.display = 'none';
  bar.appendChild(update_btn);
  bar.appendChild(delete_btn);

  update_btn.addEventListener('click', async () => {
    const selection = readSelection();
    if (!selection) return;

    await constructUpdateTimetable();
    update_btn.style.display = 'none';
    update_btn.disabled = true;

    bar.appendChild(save_update);
    save_update.addEventListener('click', async () => {
      await saveUpdate();
    });
  });

  delete_btn.addEventListener('click', async () => {
    const class_arm = document.querySelector('#ttClassArm').value;
    await deleteData(class_arm);
    delete_btn.disabled = true;
  });
}

/* ---------------------------------------------------------------
   Public actions
--------------------------------------------------------------- */

async function constructTimeTable() {

  const selection = readSelection();
  if (!selection) return;
  const { class_domain, class_group, class_arm } = selection;

  const existing = await findExistingTimetable(class_arm);

  // ---------- EXISTING TIMETABLE → read-only grid + Update/Delete ----------
  if (existing.length > 0) {
    await renderGrid(existing, 'view');
    attachViewModeActions();
    return;
  }

  // ---------- NO EXISTING → blank editable grid ----------
  const timeTableGridBody = document.querySelector('#timetableGridBody');
  timeTableGridBody.innerHTML = '';

  for (let i = 0; i < PERIOD_TIMES.length; i++) {
    const row = document.createElement('tr');

    for (let j = 0; j < DAYS.length + 1; j++) {
      const cell = document.createElement('td');

      if (j === 0) {
        const inputElement = document.createElement('input');
        inputElement.classList.add('period-time');
        inputElement.value = PERIOD_TIMES[i];
        if (i === BREAK_ROW_INDEX) inputElement.disabled = true;
        cell.appendChild(inputElement);
      } else if (i === BREAK_ROW_INDEX) {
        cell.textContent = 'Break';
      } else {
        const wrap = document.createElement('div');
        wrap.appendChild(await buildSubjectSelect(class_domain, class_group));
        cell.appendChild(wrap);
      }

      row.appendChild(cell);
    }
    timeTableGridBody.appendChild(row);

  }

}

async function constructUpdateTimetable() {
  const selection = readSelection();
  if (!selection) return;
  const { class_arm } = selection;

  const existing = await findExistingTimetable(class_arm);
  if (existing.length === 0) return;

  await renderGrid(existing, 'edit');
}

async function saveTimeTable() {
  const selection = readSelection();
  if (!selection) return;

  const period = collectPeriods();
  if (!period) return;

  await save(null, { ...selection, period });
}

async function saveUpdate() {
  const selection = readSelection();
  if (!selection) return;

  const period = collectPeriods();
  if (!period) return;

  await save({ ...selection, period }, null);
}

async function save(updateData, newData) {
  const url = updateData ? '/timetable/update' : '/timetable/new';
  const method = updateData ? 'PUT' : 'POST';
  const body = JSON.stringify(updateData ?? newData);

  const response = await api_fetch(url, { method, body });

  if (!response.ok) {
    const err = await response.json();
    createNotification('timetableAlert', err.message, 'error');
    throw err.message;
  }

  const { message } = await response.json();
  createNotification('timetableAlert', message, 'success');
}

async function deleteData(id) {
  const response = await api_fetch(`/timetable/${id}`, { method: 'DELETE' });

  if (!response.ok) {
    const err = await response.json();
    createNotification('timetableAlert', err.message, 'error');
    throw err.message;
  }

  const { message } = await response.json();
  createNotification('timetableAlert', message, 'success');
}


document.querySelector('#loadTimetableBtn').addEventListener('click', async () => {

  await constructTimeTable()
});
document.querySelector('#saveTimetableBtn').addEventListener('click', saveTimeTable);

loadClass('ttClassDomain', 'ttClassGroup', 'ttClassArm');