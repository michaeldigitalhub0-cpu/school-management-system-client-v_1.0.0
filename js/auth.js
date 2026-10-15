
import { getUserData, logout, validateUser } from "./services/auth.service.js";
import { createNotification } from "./utils.js";

const documentSection = document.querySelector('.login-card__subtitle');
if (document.querySelector('form') && documentSection) {
    document.querySelector('form').addEventListener('submit', (e) => {
        e.preventDefault();
        authtenticateUser();
    });

    function getLoginData() {
        const userID = document.querySelector('#user-id');
        const userPassword = document.querySelector('#password');
        const userRole = document.querySelector('#role');

        return {
            user_id: userID.value.trim(),
            user_password: userPassword.value,
            user_role: userRole.value.toLowerCase()
        };
    }

    async function authtenticateUser() {
        const loginData = getLoginData();

        await validateUser(loginData, async (err) => {

            if (err) return createNotification('loginAlert', err.message, 'error');


            const data = await getUserData((err) => {

                if (err) throw err;
            });

            showWelcomePopup(data.user_name, data.user_role, () => {
                const destinations = {
                    admin: './pages/admin-pages/dashboard.html',
                    teacher: './pages/teacher-pages/dashboard.html',
                    student: './pages/student-pages/dashboard.html'
                };
                window.location.href = destinations[data.user_role] || '../login.html';
            });

            sessionStorage.setItem('loggedIn', data.user_name);
            sessionStorage.setItem('userId', data.user_id);
            sessionStorage.setItem('role', data.user_role);
        })
    }

    function showWelcomePopup(name, role, onDone) {
        const modal = document.querySelector('#welcomeModal');
        const title = document.querySelector('#welcomeModalTitle');
        const subtitle = document.querySelector('#welcomeModalSubtitle');

        title.textContent = 'Welcome, ' + name;
        subtitle.textContent = 'Signed in as ' + role;
        modal.classList.remove('is-hidden');

        setTimeout(() => {
            modal.classList.add('is-hidden');
            onDone();
        }, 1200);
    }

}

if (!document.querySelector('form') || !documentSection) {

    async function authGuard() {

        const data = await getUserData((err) => {

            if (err) {
                window.location.href = '/login.html';
                return;
            }

        });

        sessionStorage.setItem('loggedIn', data.user_name);
        sessionStorage.setItem('role', data.user_role);
        sessionStorage.setItem('userId', data.user_id);

        document.querySelector('#userRole').textContent = data.user_role;
        document.querySelector('#userName').textContent = data.user_name;

        document.querySelector('#logoutBtn').addEventListener('click', async () => {

            await logout((err) => {

                if (err) throw err;
            });

            window.location.href = '../../login.html';
        })
    }

    authGuard()
}
