import { createTeacher, getAllTeachers, removeTeacher, updateTeacher } from "./services/admin_services/teacher.service.js";
import { createNotification, loadClass, loadSubject } from "./utils.js";

async function saveTeacher() {
   const newData = getTeacherData();

   await createTeacher(newData.getData(), (err, data) => {

      if (err) return createNotification('teachersAlert', err.message, 'error');

      console.log(data);
      newData.clearInput();

      loadClass('class_domain', 'class_group', 'class_arm');

      loadSubject('subjectDivision', 'availableSubjects');

      renderTeacherRecord();

      createNotification('teachersAlert', data.message, 'success');
   })

}

async function renderTeacherRecord() {
   const teacherTable = document.querySelector('#teachersTableBody');

   const data = await getAllTeachers((err) => {

      createNotification('teachersAlert', err.message, 'success');
      throw err
   });

   if (data.length === 0) {
      teacherTable.innerHTML = `
         <tr>
            <td colspan="7">
               <div class="empty-state">No teachers added yet.</div>
            </td>
         </tr>
      `;
      return;
   }

   teacherTable.innerHTML = '';
   for (let record of data) {

      const row = document.createElement('tr');

      const staffID = document.createElement('td');
      const teacherName = document.createElement('td');
      const teacherGender = document.createElement('td');
      const subjectTaught = document.createElement('td');
      const teacherClass = document.createElement('td');
      const teacherContact = document.createElement('td');
      const actions = document.createElement('td');

      staffID.textContent = record.staff_id;
      teacherName.textContent = `${record.lName} ${record.fName} ${record.mName || ''}`;
      teacherGender.textContent = record.gender;
      subjectTaught.textContent = record.subject_name;
      teacherClass.textContent = `${record.group_name || ''} ${record.arm_name || ''}`.trim() || 'unassigned';
      teacherContact.textContent = record.contact;
      actions.innerHTML = `<td><button type="button" id="${record.staff_id}" class="btn btn-primary btn-sm">Edit</button><button type="button" id="${record.staff_id}" class="btn btn-primary btn-sm">Delete</button></td>`;

      row.appendChild(staffID);
      row.appendChild(teacherName);
      row.appendChild(teacherGender);
      row.appendChild(subjectTaught);
      row.appendChild(teacherClass);
      row.appendChild(teacherContact);
      row.appendChild(actions);

      teacherTable.appendChild(row);
   }
}

async function updateData(id, update) {

   await updateTeacher(id, update, (err, data) => {

      if (err) return createNotification('teachersAlert', err.message, 'error');

      loadSubject('subjectDivision', 'availableSubjects');

      loadClass('class_domain', 'class_group', 'class_arm');

      renderTeacherRecord();

      createNotification('teachersAlert', data.message, 'success');
   })
}

async function deleteData(id) {

   await removeTeacher(id, (err, data) => {

      if (err) return createNotification('teachersAlert', err.message, 'error');

      loadClass('class_domain', 'class_group', 'class_arm');

      loadSubject('subjectDivision', 'availableSubjects');

      renderTeacherRecord();

      createNotification('teachersAlert', data.message, 'success');
   })

}

function getTeacherData() {
   const firstName = document.querySelector('#firstName');
   const lastName = document.querySelector('#lastName');
   const middleName = document.querySelector('#middleName');
   const gender = document.querySelector('#gender');
   const dob = document.querySelector('#dob');
   const contact = document.querySelector('#contact');
   const classDomain = document.querySelector('#class_domain');
   const classGroup = document.querySelector('#class_group');
   const classArm = document.querySelector('#class_arm');
   const subject = document.querySelector('#availableSubjects');

   function getData() {

      let data = {
         fName: firstName.value.trim(),
         lName: lastName.value.trim(),
         dob: dob.value,
         gender: gender.value,
         contact: contact.value,
         class_domain: classDomain.value,
         class_group: classGroup.value,
         class_arm: classArm.value,
         subject_id: subject.value
      }

      if (middleName.value.trim()) {
         data = { ...data, mName: middleName.value.trim() };
      }

      return data;
   }

   function clearInput() {
      firstName.value = '';
      lastName.value = '';
      middleName.value = '';
      dob.value = '';
      gender.value = '';
      contact.value = '';
      subject.value = '';
      classGroup.value = '';
      classDomain.value = '';
      classArm.value = '';
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
            <label for="subjectDivision">Subject Division</label>
            <select name="n_subjectDivision" id="n_subjectDivision" required>
              <option value="" disabled selected>Select subject division</option>
            </select>
            <label for="n_availableSubjects">Active subjects</label>
            <select name="n_availableSubjects" id="n_availableSubjects" required>
              <option value="" disabled selected>Select subject</option>
            </select>
        </div>
        <div class="form-actions">
            <button type="submit" class="btn btn-primary" id="update">
              Update teacher data
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
   const fName = document.querySelector('#n_fName');
   const lName = document.querySelector('#n_lName');
   const mName = document.querySelector('#n_mName');
   const class_domain = document.querySelector('#n_class_domain');
   const class_group = document.querySelector('#n_class_group');
   const class_arm = document.querySelector('#n_class_arm');
   const contact = document.querySelector('#n_contact');
   const dob = document.querySelector('#n_dob');
   const gender = document.querySelector('#n_gender');
   const n_subject = document.querySelector('#n_availableSubjects');

   return {
      fName: fName.value.trim(),
      lName: lName.value.trim(),
      mName: mName.value.trim(),
      class_domain: class_domain.value,
      class_group: class_group.value,
      class_arm: class_arm.value,
      contact: contact.value.trim(),
      dob: dob.value,
      gender: gender.value.charAt(0).toUpperCase(),
      subject_id: n_subject.value
   }
}

function setEventListener() {

   document.querySelector('body').addEventListener('click', async (event) => {

      const box = document.querySelector('.box_overlay');

      if (event.target.tagName !== 'BUTTON') return;

      if (event.target.textContent === 'Delete') {

         await deleteData(event.target.id);
      }
      if (event.target.textContent === 'Edit') {

         const row = event.target.parentElement.parentElement;

         updateDialogueBox();

         document.querySelector('#update_box').className = event.target.id;
         loadClass('n_class_domain', 'n_class_group', 'n_class_arm');
         await loadSubject('n_subjectDivision', 'n_availableSubjects');

         const names = row.children[1].textContent.split(' ');
         document.querySelector('#n_fName').value = names[1];
         document.querySelector('#n_lName').value = names[0];
         document.querySelector('#n_mName').value = names[2];
         document.querySelector('#n_contact').value = row.children[5].textContent;

         row.children[2].textContent === 'M'
            ? (document.querySelector('#n_gender').children[1].selected = true)
            : document.querySelector('#n_gender').children[2].selected = true;

      }

      if (event.target.id.toLowerCase() === 'update') {

         const update = getUpdateData();

         await updateData(event.target.parentElement.parentElement.className, update);

         document.body.removeChild(box);
      }

      if (event.target.id.toLowerCase() === 'abort') {

         document.body.removeChild(box)
      }
   });
}

function initTeacherSearch() {
   const searchInput = document.querySelector('#teacherSearch');

   searchInput.addEventListener('input', () => {
      const query = searchInput.value.toLowerCase().trim();
      const rows = document.querySelectorAll('#teachersTableBody tr');

      rows.forEach(row => {
         const cells = row.children;
         if (cells.length < 2) return;

         const staffID = cells[0].textContent.toLowerCase();
         const fullName = cells[1].textContent.toLowerCase();

         row.style.display = (staffID.includes(query) || fullName.includes(query)) ? '' : 'none';
      });
   });
}

document.querySelector('#teacherForm').addEventListener('submit', async (event) => {
   event.preventDefault();
   await saveTeacher()
   renderTeacherRecord();
});

loadClass('class_domain', 'class_group', 'class_arm');
loadSubject('subjectDivision', 'availableSubjects');
renderTeacherRecord();
setEventListener();
initTeacherSearch();

