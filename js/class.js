'use strict';

import { createClass, removeClass, updateClass, getAllClasses, fetchStudents } from "./services/admin_services/class.service.js";
import { getAllTeachers } from "./services/admin_services/teacher.service.js";
import { loadClass, createNotification } from "./utils.js";

async function saveNewClass() {

    const newData = getClassData();

    createClass(newData.getData(), (err, data) => {

        if (err) return createNotification('classesAlert', err.message, 'error');

        createNotification('classesAlert', data.message, 'success');

        newData.clearInput();

        renderClassData();
    });
}

async function renderClassData() {

    const classRecord = document.querySelector('#classesTableBody');

    const data = await getAllClasses(async (err) => {

        if (err) throw err;
    });

    if (data.length === 0) {
        classRecord.innerHTML = `
            <tr>
                <td colspan="6">
                  <div class="empty-state">No classes added yet.</div>
                </td>
            </tr>
        `;
        return;
    }

    classRecord.innerHTML = '';
    for (let record of data) {

        const row = document.createElement('tr');
        const classType = document.createElement('td');
        const classGroup = document.createElement('td');
        const className = document.createElement('td');
        const formTeacher = document.createElement('td');
        const students = document.createElement('td');
        const action = document.createElement('td');

        classType.textContent = record.domain_name.toUpperCase();
        classGroup.textContent = record.group_name;
        className.textContent = record.arm_name;

        const form_teacher_name = `${record.teacher_fName || ''} ${record.teacher_mName || ''} ${record.teacher_lName || ''}`;

        formTeacher.textContent = form_teacher_name.trim() || 'unassigned';

        students.textContent = (await getTotalStudents(record.arm_id));

        action.innerHTML = `<button type="button" class="edit-class btn btn-primary btn-sm" >Edit</button><button type="button" class="delete-class btn btn-primary btn-sm" id="${record.arm_id}">Delete</button>`;

        row.appendChild(classType);
        row.appendChild(classGroup);
        row.appendChild(className);
        row.appendChild(formTeacher);
        row.appendChild(students);
        row.appendChild(action);

        classRecord.appendChild(row);
    }

    async function getTotalStudents(arm_id) {

        const data = await fetchStudents(arm_id);

        return data.length;
    }
}

async function loadTeachers(element_id) {

    const data = await getAllTeachers((err => {

        createNotification('classesAlert', err.message, 'success');
        throw err;
    }));

    const selectElement = document.querySelector(`#${element_id}`);
    selectElement.innerHTML = '';
    selectElement.innerHTML = '<option value="" selected disabled>Select teacher</option>';

    data.forEach(record => {
        const option = document.createElement('option');
        option.setAttribute('value', record.staff_id);
        option.textContent = `${record.fName} ${record.mName || ''} ${record.lName}`;
        selectElement.appendChild(option);
    })
}

async function deleteClass(arm_id) {

    await removeClass({ type: 'arm', id: arm_id }, (err, data) => {

        if (err) {

            createNotification('classesAlert', err.message, 'error');
            throw err;
        }

        createNotification('classesAlert', data.message, 'success');

        // loadTeachers('formTeacher');

        renderClassData();
    });

}

async function updateClassData(domain_name, group_name, arm_name, form_teacher) {

    const data = { domain_name, group_name, arm_name, form_teacher };
    await updateClass(data, (err, data) => {

        if (err) {

            return createNotification('classesAlert', err.message, 'error');
        }


        createNotification('classesAlert', data.message, 'success');

        // loadTeachers('formTeacher');

        renderClassData();
    });

}

function getClassData() {
    const classType = document.querySelector('#classDomain');
    const classGroup = document.querySelector('#classGroup');
    const className = document.querySelector('#classArm');
    const formTeacher = document.querySelector('#formTeacher');

    function getData() {
        let data = {
            domain_name: classType.value.toLowerCase().trim(),
            group_name: classGroup.value.toUpperCase().trim(),
            arm_name: className.value.toUpperCase().trim(),
        }

        if (formTeacher.value) {
            data = { ...data, form_teacher: formTeacher.value, }
        }

        return data;
    }

    function clearInput() {
        classType.value = '';
        classGroup.value = '';
        className.value = '';
        formTeacher.value = '';
    }

    return { getData, clearInput };
}

function updateDialogueBox() {
    const overlay = document.createElement('div');
    overlay.className = 'box_overlay';
    const box = document.createElement('div');
    box.id = 'update_box';
    const html = `
        <div class="field">
            <label for="n_class_domain">Class domain</label>
            <select name="n_class_domain" id="n_class_domain">
                <option value="" selected disabled>Select class domain</option>
                <!-- loaded from server -->
            </select>
        </div>
        <div class="field">
            <label for="n_class_group">Class group</label>
            <select name="class_group" id="n_class_group">
                <option value="" selected disabled>Select class group</option>
                <!-- loaded from server -->
            </select>
        </div>
        <div class="field">
            <label for="n_class_arm">Class arm</label>
            <select name="n_class_arm" id="n_class_arm">
                <option value="" selected disabled>Select class arm</option>
                <!-- loaded from server -->
            </select>
        </div>
        <div class="field">
            <label for="n_formTeacher">Form teacher</label>
            <select name="n_formTeacher" id="n_formTeacher" required>
              <option value="" disabled selected>Select form teacher</option>
            </select>
        </div>
        <div class="form-actions">
            <button type="submit" class="btn btn-primary" id="update">
              Update class data
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

function getUpdatedClassData() {

    const class_domain = document.querySelector('#n_class_domain');
    const class_group = document.querySelector('#n_class_group');
    const class_arm = document.querySelector('#n_class_arm');
    const formTeacher = document.querySelector('#n_formTeacher');

    const domain_name = Array.from(class_domain.children).filter(o => o.value === class_domain.value)[0].textContent
    const group_name = Array.from(class_group.children).filter(o => o.value === class_group.value)[0].textContent
    const arm_name = Array.from(class_arm.children).filter(o => o.value === class_arm.value)[0].textContent


    return {
        domain_name,
        group_name,
        arm_name,
        form_teacher: formTeacher.value
    }
}

function setEventListener() {

    document.body.addEventListener('click', async (event) => {

        const box = document.querySelector('.box_overlay');

        if (event.target.tagName !== 'BUTTON') return;

        if (event.target.textContent.toLowerCase() === 'save class') {
            event.preventDefault();
            await saveNewClass();
        }

        if (Array.from(event.target.classList).includes('edit-class')) {

            updateDialogueBox();
            await loadClass('n_class_domain', 'n_class_group', 'n_class_arm');
            await loadTeachers('n_formTeacher');
        }

        if (event.target.id.toLowerCase() === 'update') {

            const update = getUpdatedClassData()

            await updateClassData(
                update.domain_name.toLowerCase(),
                update.group_name,
                update.arm_name,
                update.form_teacher
            );
            document.body.removeChild(box);
        }

        if (event.target.id.toLowerCase() === 'abort') {

            document.body.removeChild(box)
        }

        if (Array.from(event.target.classList).includes('delete-class')) {

            await deleteClass(event.target.id);
        }
    })
}

function initClassSearch() {
    const searchInput = document.querySelector('#classSearch');

    searchInput.addEventListener('input', () => {
        const query = searchInput.value.toLowerCase().trim();
        const rows = document.querySelectorAll('#classesTableBody tr');

        rows.forEach(row => {
            const cells = row.children;
            if (cells.length < 2) return;

            const classType = cells[0].textContent.toLowerCase();
            const classGroup = cells[1].textContent.toLowerCase();

            row.style.display = (classType.includes(query) || classGroup.includes(query)) ? '' : 'none';
        });
    });
}

loadTeachers('formTeacher');
renderClassData();
setEventListener();
initClassSearch();