
import { createStudent, getAllStudents, removeStudent, updateStudent } from "./services/admin_services/student.service.js";
import { createNotification, loadClass } from "./utils.js";

async function saveStudent() {

    const newData = getStudentData();

    await createStudent(newData.getData(), (err, data) => {

        if (err) return createNotification('studentsAlert', err.message, 'error');

        console.log(data);
        createNotification('studentsAlert', data.message, 'success');

        newData.clearInput();

        loadClass('classDomain', 'classGroup', 'classArm');

        renderStudentList();
    });
}

async function updateData(id, update) {

    await updateStudent(id, update, (err, data) => {

        if (err) return createNotification('studentsAlert', err.message, 'error');

        createNotification('studentsAlert', data.message, 'success');

        loadClass('classDomain', 'classGroup', 'classArm');

        renderStudentList();
    })
}

async function deleteData(id) {

    await removeStudent(id, (err, data) => {

        if (err) return createNotification('studentsAlert', err.message, 'error');

        loadClass('classDomain', 'classGroup', 'classArm');

        renderStudentList();

        createNotification('studentsAlert', data.message, 'success');
    })
}

async function renderStudentList() {
    const studentTableBody = document.querySelector('#studentsTableBody');

    const data = await getAllStudents((err) => { throw err });

    if (data.length === 0) {
        studentTableBody.innerHTML = `
         <tr>
            <td colspan="8">
               <div class="empty-state">No students added yet.</div>
            </td>
         </tr>
      `;
        return;
    }

    studentTableBody.innerHTML = '';
    for (let record of data) {

        const row = document.createElement('tr');

        const admissionNo = document.createElement('td');
        const studentName = document.createElement('td');
        const studentClass = document.createElement('td');
        const studentContact = document.createElement('td');
        const studentGender = document.createElement('td');
        const guardianName = document.createElement('td');
        const guardianContact = document.createElement('td');
        const actions = document.createElement('td');

        admissionNo.textContent = record.admission_no;
        studentName.textContent = `${record.student_lName} ${record.student_fName} ${record.student_mName || ''}`;
        studentClass.textContent = `${record.class_group} ${record.class_arm}`;
        studentContact.textContent = record.student_contact;
        studentGender.textContent = record.gender;
        guardianName.textContent = `${record.guardian_lName} ${record.guardian_fName} ${record.guardian_mName || ''}`;
        guardianContact.textContent = record.guardian_contact;
        actions.innerHTML = `<td><button type="button" id="${record.admission_no}" class="btn btn-primary btn-sm">Edit</button><button type="button" id="${record.admission_no}"  class="btn btn-primary btn-sm">Delete</button></td>`;

        row.appendChild(admissionNo);
        row.appendChild(studentName);
        row.appendChild(studentClass);
        row.appendChild(studentGender);
        row.appendChild(studentContact);
        row.appendChild(guardianName);
        row.appendChild(guardianContact);
        row.appendChild(actions);

        studentTableBody.appendChild(row);
    }
}

function getStudentData() {

    const firstName = document.querySelector('#firstName');
    const lName = document.querySelector('#lastName');
    const middleName = document.querySelector('#middleName');
    const dob = document.querySelector('#dob');
    const studentContact = document.querySelector('#studentContact');
    const classDomain = document.querySelector('#classDomain');
    const classGroup = document.querySelector('#classGroup');
    const classArm = document.querySelector('#classArm');
    const gender = document.querySelector('#gender');
    const guardianFirstName = document.querySelector('#guardianFirstName');
    const guardianLastName = document.querySelector('#guardianLastName');
    const guardianMiddleName = document.querySelector('#guardianMiddleName');
    const guardianContact = document.querySelector('#guardianContact')

    function getData() {

        let data = {
            fName: firstName.value.trim(),
            lName: lName.value.trim(),
            dob: dob.value,
            gender: gender.value.charAt(0).toUpperCase(),
            contact: studentContact.value.trim(),
            class_domain: classDomain.value,
            class_group: classGroup.value,
            class_arm: classArm.value,
            guardian_fName: guardianFirstName.value.trim(),
            guardian_lName: guardianLastName.value.trim(),
            guardian_contact: guardianContact.value.trim()
        }

        if (middleName.value.trim() || guardianMiddleName.value.trim()) {
            middleName.value ? data = { ...data, mName: middleName.value.trim() } : data;
            guardianMiddleName.value ? data = { ...data, guardian_mName: guardianMiddleName.value.trim() } : data;
        }

        return data
    }

    function clearInput() {
        firstName.value = '';
        lName.value = '';
        middleName.value = '';
        dob.value = '';
        studentContact.value = '';
        gender.value = '';
        guardianContact.value = '';
        guardianFirstName.value = '';
        guardianLastName.value = '';
        guardianMiddleName.value = '';
        classGroup.value = '';
        classDomain.value = '';
        classArm.value = '';
    }

    return { getData, clearInput };
}

function setEventListeners() {

    document.body.addEventListener('click', async (event) => {

        const box = document.querySelector('.box_overlay');

        if (event.target.tagName !== 'BUTTON') return;

        if (event.target.textContent.trim().toLowerCase() === 'save student') {

            await saveStudent();
        }

        if (event.target.textContent.toLowerCase() === 'delete') {

            await deleteData(event.target.id);
        }

        if (event.target.textContent.toLowerCase() === 'edit') {

            updateDialogueBox();
            document.querySelector('#update_box').className = event.target.id;
            loadClass('n_class_domain', 'n_class_group', 'n_class_arm');

            const names = event.target.parentElement.parentElement.children[1].textContent.split(' ');
            document.querySelector('#n_fName').value = names[1];
            document.querySelector('#n_lName').value = names[0];
            document.querySelector('#n_mName').value = names[2];
            document.querySelector('#n_contact').value = event.target.parentElement.parentElement.children[4].textContent;

            const guardian = event.target.parentElement.parentElement.children[5].textContent.split(' ');
            document.querySelector('#n_guardian_fName').value = guardian[1];
            document.querySelector('#n_guardian_lName').value = guardian[0];
            document.querySelector('#n_guardian_mName').value = guardian[2];

            document.querySelector('#n_guardian_contact').value = event.target.parentElement.parentElement.children[6].textContent;
            event.target.parentElement.parentElement.children[3].textContent === 'M'
                ? (document.querySelector('#n_gender').children[1].selected = true)
                : document.querySelector('#n_gender').children[2].selected = true

        }

        if (event.target.id.toLowerCase() === 'update') {

            const updates = getUpdates();
            await updateData(event.target.parentElement.parentElement.className, updates)
            document.body.removeChild(box)
        }

        if (event.target.id.toLowerCase() === 'abort') {

            document.body.removeChild(box)
        }
    })
}

function updateDialogueBox() {
    const overlay = document.createElement('div');
    overlay.className = 'box_overlay';
    const box = document.createElement('div');
    box.id = 'update_box';
    const html = `
        <div class="field">
            <label for="n_fName">First name</label>
            <input type="text" name="n_fName" id="n_fName">
        </div>
        <div class="field">
            <label for="n_lName">Last name</label>
            <input type="text" name="n_lName" id="n_lName">
        </div>
        <div class="field">
            <label for="n_mName">Middle name</label>
            <input type="text" name="n_mName" id="n_mName">
        </div>
        <div class="field">
            <select name="n_class_domain" id="n_class_domain">
                <option value="" selected disabled>Select class domain</option>
                <!-- loaded from server -->
            </select>
        </div>
        <div class="field">
            <select name="class_group" id="n_class_group">
                <option value="" selected disabled>Select class group</option>
                <!-- loaded from server -->
            </select>
        </div>
        <div class="field">
            <select name="n_class_arm" id="n_class_arm">
                <option value="" selected disabled>Select class arm</option>
                <!-- loaded from server -->
            </select>
        </div>
        <div class="field">
            <label for="n_contact">Contact</label>
            <input type="text" name="n_contact" id="n_contact">
        </div>
        <div class="field">
            <label for="n_dob">Date of birth</label>
            <input type="date" name="n_dob" id="n_dob">
        </div>
        <div class="field">
            <select name="n_gender" id="n_gender">
                <option value="" selected disabled>Select gender</option>
                <option value="M">Male</option>
                <option value="F">Female</option>
            </select>
        </div>
        <div class="field">
            <label for="n_guardian_fName">Guardian first name</label>
            <input type="text" name="n_guardian_fName" id="n_guardian_fName">
        </div>
        <div class="field">
            <label for="n_guardian_lName">Guardian last name</label>
            <input type="text" name="n_guardian_lName" id="n_guardian_lName">
        </div>
        <div class="field">
            <label for="n_guardian_mName">Guardian middle name</label>
            <input type="text" name="n_guardian_mName" id="n_guardian_mName">
        </div>
        <div class="field">
            <label for="n_guardian_contact">Guardian contact</label>
            <input type="text" name="n_guardian_contact" id="n_guardian_contact">
        </div>
        <div class="form-actions">
            <button type="submit" class="btn btn-primary" id="update">
              Update student data
            </button>
            <button type="submit" class="btn btn-secondary" id="abort">
              Cancle
            </button>
        </div>
    `;
    box.innerHTML = html;
    overlay.appendChild(box);
    document.body.appendChild(overlay);
}

function getUpdates() {

    const fName = document.querySelector('#n_fName');
    const lName = document.querySelector('#n_lName');
    const mName = document.querySelector('#n_mName');
    const class_domain = document.querySelector('#n_class_domain');
    const class_group = document.querySelector('#n_class_group');
    const class_arm = document.querySelector('#n_class_arm');
    const contact = document.querySelector('#n_contact');
    const dob = document.querySelector('#n_dob');
    const gender = document.querySelector('#n_gender');
    const n_guardian_fName = document.querySelector('#n_guardian_fName');
    const n_guardian_lName = document.querySelector('#n_guardian_lName');
    const n_guardian_mName = document.querySelector('#n_guardian_mName');
    const n_guardian_contact = document.querySelector('#n_guardian_contact');

    const newData = {
        fName: fName.value.trim(),
        lName: lName.value.trim(),
        class_domain: class_domain.value,
        class_group: class_group.value,
        class_arm: class_arm.value,
        contact: contact.value.trim(),
        dob: dob.value,
        gender: gender.value.charAt(0).toUpperCase(),
        guardian_fName: n_guardian_fName.value.trim(),
        guardian_lName: n_guardian_lName.value.trim(),
        guardian_contact: n_guardian_contact.value.trim()
    }

    if (mName.value.trim() && n_guardian_mName.value.trim()) {
        return {
            ...newData,
            mName: mName.value.trim(),
            guardian_mName: n_guardian_mName.value.trim()
        }
    }
    if (mName.value.trim()) {
        return {
            ...newData,
            mName: mName.value.trim(),
        }
    }
    if (n_guardian_mName.value.trim()) {
        return {
            ...newData,
            guardian_mName: n_guardian_mName.value.trim()
        }
    }

    return newData;
}

function initStudentSearch() {
    const searchInput = document.querySelector('#studentSearch');

    searchInput.addEventListener('input', () => {
        const query = searchInput.value.toLowerCase().trim();
        const rows = document.querySelectorAll('#studentsTableBody tr');

        rows.forEach(row => {
            const cells = row.children;
            if (cells.length < 2) return;

            const admissionNo = cells[0].textContent.toLowerCase();
            const studentName = cells[1].textContent.toLowerCase();

            row.style.display = (admissionNo.includes(query) || studentName.includes(query)) ? '' : 'none';
        });
    });
}

loadClass('classDomain', 'classGroup', 'classArm');
renderStudentList();
setEventListeners();
initStudentSearch();