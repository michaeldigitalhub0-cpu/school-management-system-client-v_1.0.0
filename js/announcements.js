
import { api_fetch } from "./database/db.js";
import { createNotification, renderNavByRole } from "./utils.js";

const CURRENT_USER_ROLE = sessionStorage.getItem('role');
renderNavByRole(sessionStorage.getItem('role'));

if (CURRENT_USER_ROLE === 'admin') {

  document.querySelector('#announcementAudience').children[2].remove();
}

if (CURRENT_USER_ROLE === 'teacher') {

  document.querySelector('#announcementAudience').children[1].remove();
  document.querySelector('#announcementAudience').children[2].remove();

}

async function saveAnnouncement(role) {

  const data = getData().data();

  const response = await api_fetch(`/announcement/${role}/new`, { method: 'POST', body: JSON.stringify(data) })

  if (!response.ok) {

    const err = await response.json();
    createNotification('announcementsAlert', err.message, 'error');

  }

  const { message } = await response.json();

  createNotification('announcementsAlert', message, 'success');

  renderAnnouncementList(role, 10);
}

async function renderAnnouncementList(role, limit) {

  const response = await api_fetch(`/announcement/${role}/all?limit=${limit}`, { method: 'GET' });

  if (!response.ok) {

    const err = await response.json();
    throw err;
  }

  const { data } = await response.json();
  console.log(data);
  const announcementList = document.querySelector('#announcementsList');

  if (data.length === 0) {
    announcementList.innerHTML =
      `
      <div class="empty-state">No announcements posted yet.</div>
      `;
    return;
  }

  if (role === 'admin') {
    announcementList.innerHTML = data.reverse().map(ann => {

      if (ann.user_role === 'teacher') {
        return `
            <div id='announcement-wrap'>
              <input type="hidden" id="${ann.announcement_id}">
              <div class="card">
                <div class="card__header">
                  <p><strong>Title</strong>: ${ann.title.toUpperCase()}</h3>
                  <p><strong>Date</strong>: ${ann.date_posted}</p>
                  <p><strong>Posted By</strong>: ${ann.lName} ${ann.fName} ${ann.mName || ''} - <strong>${ann.user_role.toUpperCase()}</strong></p>
                  <p><strong>Audience</strong>: TO ${ann.audience.toUpperCase()}</p>
                </div>
                <p>${ann.body}</p>
              </div>
              <div class="action_btn">
                <button class="btn btn-primary">Delete</button>
              </div>
            </div>
          `
      }

      return `
        <div id='announcement-wrap'>
          <input type="hidden" id="${ann.announcement_id}">
          <div class="card">
            <div class="card__header">
              <p><strong>Title</strong>: ${ann.title.toUpperCase()}</h3>
              <p><strong>Date</strong>: ${ann.date_posted}</p>
              <p><strong>Posted By</strong>: ${ann.lName} ${ann.fName} ${ann.mName || ''} - <strong>${ann.user_role.toUpperCase()}</strong></p>
              <p><strong>Audience</strong>: TO ${ann.audience.toUpperCase()}</p>
            </div>
            <p>${ann.body}</p>
          </div>
          <div class="action_btn">
            <button class="btn btn-primary">Delete</button>
            <button class="btn btn-primary">Edit</button>
          </div>
        </div>
      `
    }

    ).join('')
  } else if (role === 'teacher') {

    announcementList.innerHTML = data.reverse().map(ann => {

      if (ann.user_role === 'admin') {
        return `
              <div id='announcement-wrap'>
                <div class="card">
                  <div class="card__header">
                    <p><strong>Title</strong>: ${ann.title.toUpperCase()}</h3>
                    <p><strong>Date</strong>: ${ann.date_posted}</p>
                    <p><strong>Posted By</strong>: ${ann.lName} ${ann.fName} ${ann.mName || ''} - <strong>${ann.user_role.toUpperCase()}</strong></p>
                    <p><strong>Audience</strong>: TO ${ann.audience.toUpperCase()}</p>
                  </div>
                  <p>${ann.body}</p>
                </div>
              </div>
            `
      }
      return `
          <div id='announcement-wrap'>
            <input type="hidden" id="${ann.announcement_id}">
            <div class="card">
              <div class="card__header">
                <p><strong>Title</strong>: ${ann.title.toUpperCase()}</h3>
                <p><strong>Date</strong>: ${ann.date_posted}</p>
                <p><strong>Posted By</strong>: ${ann.lName} ${ann.fName} ${ann.mName || ''} - <strong>${ann.user_role.toUpperCase()}</strong></p>
                <p><strong>Audience</strong>: TO ${ann.audience.toUpperCase()}</p>
              </div>
              <p>${ann.body}</p>
            </div>
            <div class="action_btn">
              <button class="btn btn-primary">Delete</button>
              <button class="btn btn-primary">Edit</button>
            </div>
          </div>
        `
    }
    ).join('')
  } else if (role === 'student') {
    announcementList.innerHTML = data.reverse().map(ann =>
      `
        <div class="card">
          <div class="card__header">
            <p><strong>Title</strong>: ${ann.title.toUpperCase()}</h3>
            <p><strong>Date</strong>: ${ann.date_posted}</p>
            <p><strong>Posted By</strong>: ${ann.lName} ${ann.fName} ${ann.mName || ''} - <strong>${ann.user_role.toUpperCase()}</strong></p>
            <p><strong>Audience</strong>: TO ${ann.audience.toUpperCase()}</p>
          </div>
          <p>${ann.body}</p>
        </div>
      `
    ).join('')
  }
}

async function deleteAnnouncement(id) {

  const response = await api_fetch(`/announcement/${id}`, { method: 'DELETE' });

  if (!response.ok) {

    const err = await response.json();
    createNotification('announcementsAlert', err.message, 'error');
  }

  const { message } = await response.json();

  createNotification('announcementsAlert', message, 'success');

  renderAnnouncementList(CURRENT_USER_ROLE, 10);
}

async function updateAnnouncement(id, update, role) {

  const response = await api_fetch(`/announcement/${role}/${id}`, { method: 'PUT', body: JSON.stringify(update) });

  if (!response.ok) {

    const err = await response.json();
    createNotification('announcementsAlert', err.message, 'error');

  }

  const { message } = await response.json();
  createNotification('announcementsAlert', message, 'success');
  renderAnnouncementList(CURRENT_USER_ROLE, 10)
}

function getData() {
  const announcementTitle = document.querySelector('#announcementTitle');
  const announcementBody = document.querySelector('#announcementBody');
  const announcementAudience = document.querySelector('#announcementAudience');

  function data() {
    return {
      title: announcementTitle.value,
      body: announcementBody.value,
      audience: announcementAudience.value
    }
  }
  function clearInput() {
    announcementTitle.value = '';
    announcementBody.value = '';
    announcementAudience.value = '';
  }
  return {
    data, clearInput
  }
}

function updateDialogueBox(id, title, date, fName, lName, mName, role, audience) {
  const overlay = document.createElement('div');
  overlay.className = 'ann_box_overlay';
  const box = document.createElement('div');
  box.id = 'ann_update_box';
  const html = `
          <input type="hidden" id="${id}">
          <div class="header">
            <p><strong>Date</strong>: ${date}</p>
            <p><strong>Posted By</strong>: ${fName} ${lName} ${mName || ''} - <strong>${role.toUpperCase()}</strong></p>
            <div class="field">
              <label for="n_announcementAudience">Audience</label>
              <select id="n_announcementAudience" required>
                <option value="" disabled selected>Select audience</option>
                <option value="all">Everyone</option>
                <option value="students">Students only</option>
                <option value="teachers">Teachers only</option>
              </select>
            </div>
          </div>
          <input type="text" id="n_title" placeholder="Title" value="${title.toUpperCase()}" />
          <div id="n_body" contenteditable=true>Body</div>
        
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

  const title = document.querySelector('#n_title');
  const body = document.querySelector('#n_body');
  const audience = document.querySelector('#n_announcementAudience');

  return {
    title: title.value.trim(),
    body: body.textContent.trim(),
    audience: audience.value
  }
}

function setEventListener() {
  document.body.addEventListener('click', async (event) => {

    if (event.target.tagName !== 'BUTTON') return;

    if (event.target.textContent.toLowerCase() === 'delete') {
      const annoncement_id = event.target.parentElement.parentElement.children[0].id;
      await deleteAnnouncement(annoncement_id);
    }

    if (event.target.textContent.toLowerCase() === 'edit') {

      const annoncement_id = event.target.parentElement.parentElement.children[0].id;
      const [title_position, date_position, posted_by_position, audience_position] = event.target.parentElement.parentElement.children[1].children[0].children

      const identity = posted_by_position.textContent.split(' ');

      const lName = identity[2];
      const fName = identity[3];
      const mName = identity[4];
      const role = identity[6];

      const date = date_position.textContent.split(' ')[1];
      const title = title_position.textContent.substring(6);
      const audience = audience_position.textContent.split(' ')[2].toLowerCase();

      updateDialogueBox(annoncement_id, title, date, fName, lName, mName, role, audience);

      console.log(audience);
      document.querySelector('#n_body').textContent = event.target.parentElement.parentElement.children[1].children[1].textContent;
      audience === 'all' ? document.querySelector('#n_announcementAudience').children[1].selected = true
        : audience === 'teachers' ? document.querySelector('#n_announcementAudience').children[3].selected = true
          : audience === 'students' ? document.querySelector('#n_announcementAudience').children[2].selected = true : null;
    }

    if (event.target.id === 'update') {
      const box = document.querySelector('.ann_box_overlay');
      const annoncement_id = event.target.parentElement.parentElement.children[0].id
      const update = getUpdate();
      await updateAnnouncement(annoncement_id, update, CURRENT_USER_ROLE);
      document.body.removeChild(box)
    }

    if (event.target.id === 'abort') {
      const box = document.querySelector('.ann_box_overlay');
      console.log(box);
      document.body.removeChild(box)

    }
  });
}

if (CURRENT_USER_ROLE === 'student') {
  document.querySelectorAll('.card')[0].style.display = 'none';
}

document.querySelector('#announcementForm').addEventListener('submit', async (event) => {
  event.preventDefault();
  await saveAnnouncement(CURRENT_USER_ROLE);
});

renderAnnouncementList(CURRENT_USER_ROLE, 10)
setEventListener();

//  things to add later : auto notification on who posted and if an admin performs an operation on
// a teacher announcement the teacher will only receive it (version 1.0.1)