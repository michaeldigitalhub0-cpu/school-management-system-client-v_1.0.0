
'use strict';

import { getAllSubjects } from "./services/admin_services/subject.service.js";
import { getDomain, getGroup, getArm } from "./utils/admin.utils.js";

async function loadClass(class_domain_id, class_group_id, class_arm_id) {

    const class_domain_placeholder = document.querySelector(`#${class_domain_id}`);
    const class_group_placeholder = document.querySelector(`#${class_group_id}`);
    const class_arm_placeholder = document.querySelector(`#${class_arm_id}`);
    const class_domain = await getDomain();

    class_domain_placeholder.querySelectorAll('option:not(:first-child)').forEach(o => o.remove());
    for (let domain of class_domain) {
        const option = document.createElement('option');
        option.setAttribute('value', domain.domain_id);
        option.textContent = domain.domain_name.toUpperCase();
        class_domain_placeholder.appendChild(option);
    }

    class_group_placeholder.querySelectorAll('option:not(:first-child)').forEach(o => o.remove());
    class_domain_placeholder.oninput = async () => {

        const class_group = await getGroup(class_domain_placeholder.value);

        class_group_placeholder.querySelectorAll('option:not(:first-child)').forEach(o => o.remove());
        for (let group of class_group) {
            const option = document.createElement('option');
            option.setAttribute('value', group.group_id);
            option.textContent = group.group_name.toUpperCase();
            class_group_placeholder.appendChild(option);
        }

        class_arm_placeholder?.querySelectorAll('option:not(:first-child)').forEach(o => o.remove());
    };

    class_group_placeholder.oninput = async () => {

        if (class_arm_placeholder) {
            const class_arm = await getArm(class_group_placeholder.value);

            class_arm_placeholder.querySelectorAll('option:not(:first-child)').forEach(o => o.remove());
            for (let arm of class_arm) {
                const option = document.createElement('option');
                option.setAttribute('value', arm.arm_id);
                option.textContent = arm.arm_name.toUpperCase();
                class_arm_placeholder.appendChild(option);
            }
        }

    };
}

async function loadSubject(subject_division, subject_placholder) {

    const subjectDivision = document.querySelector(`#${subject_division}`);
    const subject_placeHolder = document.querySelector(`#${subject_placholder}`);

    const class_domain = await getDomain();

    subjectDivision.querySelectorAll('option:not(:first-child)').forEach(o => o.remove())
    for (let d of class_domain) {

        const option = document.createElement('option');
        option.setAttribute('value', d.domain_id);
        option.textContent = d.domain_name.toUpperCase();
        subjectDivision.appendChild(option);
    }

    subjectDivision.oninput = async () => {

        subject_placeHolder.querySelectorAll('option:not(:first-child)').forEach(o => o.remove());
        const subjects = await getAllSubjects();

        const matchedSubject = subjects.filter(s => s.domain_id === subjectDivision.value);
        for (let s of matchedSubject) {
            const option = document.createElement('option');
            option.setAttribute('value', s.subject_id);
            option.textContent = s.subject_name;
            subject_placeHolder.appendChild(option);
        }
    }
}

function getCurrentDate() {

    const date = new Date();
    return `${date.getFullYear()}-${(date.getMonth() + 1).toString().padStart(2, '0')}-${date.getDate().toString().padStart(2, '0')}`;
}

function createNotification(element_id, info, type) {

    const notification = document.querySelector(`#${element_id}`);
    const msg = document.createElement('p');

    notification.innerHTML = '';
    notification.style.display = 'block';

    notification.setAttribute('class', `alert alert--${type}`);

    msg.setAttribute('class', 'alert--info');
    msg.textContent = info;

    notification.appendChild(msg);

    setTimeout(() => {
        notification.style.display = 'none';
    }, 1500);

}

function renderNavByRole(role) {

    const navMap = {
        admin: [
            {
                section: "Overview",
                links: [{ label: "Dashboard", href: "admin-pages/dashboard.html" }]
            },
            {
                section: "Records",
                links: [
                    { label: "Students", href: "admin-pages/students.html" },
                    { label: "Teachers", href: "admin-pages/teachers.html" },
                    { label: "Classes & Subjects", href: "admin-pages/classes.html" }
                ]
            },
            {
                section: "Academics",
                links: [
                    { label: "Attendance", href: "attendance.html" },
                    { label: "Grades", href: "grades.html" },
                    { label: "Timetable", href: "admin-pages/timetable.html" }
                ]
            },
            {
                section: "Communication",
                links: [{ label: "Announcements", href: "admin-pages/announcements.html" }]
            }
        ],
        teacher: [
            {
                section: "Overview",
                links: [{ label: "My Dashboard", href: "teacher-pages/dashboard.html" }]
            },
            {
                section: "Academics",
                links: [
                    { label: "Attendance", href: "attendance.html" },
                    { label: "Student Grades", href: "grades.html" },
                ]
            },
            {
                section: "Communication",
                links: [
                    { label: "Announcements", href: "admin-pages/announcements.html" },
                ]
            },
        ],
        student: [
            {
                section: "Overview",
                links: [{ label: "My Dashboard", href: "student-pages/dashboard.html" }]
            },
            {
                section: "Academics",
                links: [
                    { label: "End of Term Result", href: "student-pages/resultpage.html" },
                ]
            },
            {
                section: "Communication",
                links: [
                    { label: "Announcements", href: "admin-pages/announcements.html" },
                ]
            },
        ]
    };

    function getPagesRelativePrefix() {
        const path = window.location.pathname;
        const marker = "/pages/";
        const idx = path.indexOf(marker);
        if (idx === -1) return "";
        const afterPages = path.slice(idx + marker.length);
        const depth = afterPages.split("/").length - 1;
        return "../".repeat(depth);
    }

    const sidebar = document.querySelector(".sidebar");
    if (!sidebar) return;

    sidebar.querySelectorAll(".sidebar__section-label, .sidebar__nav").forEach(el => el.remove());

    const sections = navMap[role] || [];
    const prefix = getPagesRelativePrefix();
    const currentFile = window.location.pathname.split("/").pop();

    sections.forEach(({ section, links }) => {
        const label = document.createElement("p");
        label.className = "sidebar__section-label";
        label.textContent = section;
        sidebar.appendChild(label);

        const ul = document.createElement("ul");
        ul.className = "sidebar__nav";

        links.forEach(({ label: linkLabel, href }) => {
            const li = document.createElement("li");
            const a = document.createElement("a");
            const resolvedHref = prefix + href;
            const hrefFile = href.split("/").pop();

            a.href = resolvedHref;
            a.className = "sidebar__link" + (hrefFile === currentFile ? " is-active" : "");
            a.textContent = linkLabel;
            li.appendChild(a);
            ul.appendChild(li);
        });

        sidebar.appendChild(ul);
    });
}

document.querySelector('form')?.addEventListener('submit', (e) => e.preventDefault());

export { loadClass, createNotification, loadSubject, renderNavByRole, getCurrentDate }

/** */
// export default { loadClass, loadSubject, renderNavByRole };