
'use strict';

import { createSubject, getAllSubjects, removeSubject, updateSubject } from "./services/admin_services/subject.service.js";
import { createNotification, loadClass } from "./utils.js";

async function saveSubject() {

    const newData = getSubjectData();
    await createSubject(newData.getData(), (err, data) => {

        if (err) {

            createNotification('classesAlert', err.message, 'error');
            throw err;
        }

        createNotification('classesAlert', data.message, 'success');

        newData.clearInput();

        loadClass('subject_classDomain', 'subject_classGroup');

        renderSubjectRecord();
    });

}

async function deleteSubject(id) {

    removeSubject(id, (err, data) => {

        if (err) {

            createNotification('classesAlert', err.message, 'error');
            throw err;
        }

        createNotification('classesAlert', data.message, 'success');

        loadClass('subject_classDomain', 'subject_classGroup');

        renderSubjectRecord();
    })
}

async function updateSubjectData(id, update) {

    await updateSubject(id, update, (err, data) => {

        if (err) {
            createNotification('classesAlert', err.message, 'error');
            throw err;
        }

        createNotification('classesAlert', data.message, 'success');

        loadClass('subject_classDomain', 'subject_classGroup');

        renderSubjectRecord();
    })
}

async function renderSubjectRecord() {
    const subjectRecord = document.querySelector('#subjectsTableBody');

    const data = await getAllSubjects();

    if (data.length === 0) {
        subjectRecord.innerHTML = `
            <tr>
                <td colspan="3">
                  <div class="empty-state">No subjects added yet.</div>
                </td>
            </tr>
        `;
        return;
    }

    subjectRecord.innerHTML = '';
    data.forEach(record => {

        const row = document.createElement('tr');
        const subjectName = document.createElement('td');
        const classGroup = document.createElement('td');
        const action = document.createElement('td');

        record.id = record.group_id;
        classGroup.textContent = record.group_name;
        subjectName.textContent = record.subject_name;
        action.innerHTML = `<button type="button" id="${record.subject_id}" class="edit-subject">Edit</button><button type="button" id="${record.subject_id}"class="delete-subject">Delete</button>`;

        row.appendChild(subjectName);
        row.appendChild(classGroup);
        row.appendChild(action);

        subjectRecord.appendChild(row);
    })
}

function getSubjectData() {
    const subjectName = document.querySelector('#subjectName');
    const classDomain = document.querySelector('#subject_classDomain');
    const classGroup = document.querySelector('#subject_classGroup');

    function getData() {
        return {
            subject_name: subjectName.value.toUpperCase().trim(),
            group_id: classGroup.value
        }
    }

    function clearInput() {
        classDomain.value = '';
        classGroup.value = '';
        subjectName.value = '';
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
            <label for="n_subject_name">Subject name</label>
            <input type="text" name="n_subject_name" id="n_subject_name" />
        </div>
        <div class="form-actions">
            <button type="submit" class="btn btn-primary" id="update">
              Update subject data
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

function getUpdateData() {
    const subjectName = document.querySelector('#n_subject_name').value.trim();
    return { subject_name: subjectName };
}

function setEventListener() {
    document.body.addEventListener('click', async (event) => {

        const box = document.querySelector('.box_overlay');

        if (event.target.textContent.toLowerCase() === 'save subject') {

            event.preventDefault();
            await saveSubject()
        }

        if (event.target.className === 'delete-subject') {

            const subject_id = event.target.id
            await deleteSubject(subject_id);

        }

        if (event.target.className === 'edit-subject') {

            const groupID = event.target.parentElement.parentElement.id;
            updateDialogueBox();
            document.querySelector('#update_box').className = event.target.id;
            document.querySelector('#n_subject_name').className = groupID;
            document.querySelector('#n_subject_name').value = event.target.parentElement.parentElement.children[0].textContent;
        }

        if (event.target.id === 'update') {

            const group_id = document.querySelector('#n_subject_name').className;
            await updateSubjectData(
                event.target.parentElement.parentElement.className,
                { ...getUpdateData(), group_id: group_id }
            );
            document.body.removeChild(box);
            return;
        }

        if (event.target.id === 'abort') {

            document.body.removeChild(box)
        }
    })
}


loadClass('subject_classDomain', 'subject_classGroup');
document.querySelector('#subjectName').oninput = loadClass('subject_classDomain', 'subject_classGroup');
renderSubjectRecord();
setEventListener();