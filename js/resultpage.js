import { api_fetch } from "./database/db.js";
import { getMyDetails } from "./services/student_service/dashboard.service.js";
import { renderNavByRole } from "./utils.js";

const admissionNo = sessionStorage.getItem('userId');

async function constructResultNavCard() {

    const data = await getMyDetails(admissionNo, (err) => { throw err });

    const yearAdmitted = data.year_admitted;

    const currentYearSpent = new Date().getFullYear() - yearAdmitted

    const resultHistory = document.querySelector('.form-grid');

    resultHistory.innerHTML = '';
    for (let i = 0; i <= currentYearSpent; i++) {

        let prevYear = (yearAdmitted - currentYearSpent) + i - 1;
        let baseYear = (yearAdmitted - currentYearSpent) + i;

        resultHistory.innerHTML +=
            `
            <div>
              <div id="schoolSession" class="card">
                <h2 class="card__header">${prevYear}/${baseYear} session
                </h2>
                <ul>
                  <li><a href="">First Term</a></li>
                  <li><a href="">Second Term</a></li>
                  <li><a href="">Third Term</a></li>
                </ul>
              </div>
            </div>  
            `
    }
}

function displayResult() {
    document.body.addEventListener('click', (event) => {
        let urlString = '';
        let session = event.target.parentElement.parentElement.parentElement.children[0].textContent;
        if (event.target.tagName === 'A') {

            event.preventDefault();

            if (event.target.textContent.toLowerCase() === 'first term') {

                const url = new URL(location.origin + "/pages/result.html");
                url.searchParams.append("admissionNo", admissionNo);
                url.searchParams.append("session", session.substring(0, 9).trim());
                url.searchParams.append("term", "first");
                urlString = url.href;
            } else if (event.target.textContent.toLowerCase() === 'second term') {

                const url = new URL(location.origin + "/pages/result.html");
                url.searchParams.append("admissionNo", admissionNo);
                url.searchParams.append("session", session.substring(0, 9).trim());
                url.searchParams.append("term", "second")
                urlString = url.href;
            } else if (event.target.textContent.toLowerCase() === 'third term') {

                const url = new URL(location.origin + "/pages/result.html");
                url.searchParams.append("admissionNo", admissionNo);
                url.searchParams.append("session", session.substring(0, 9).trim());
                url.searchParams.append("term", "third")
                urlString = url.href;
            }
            window.location.href = urlString;
        }
    })
}

renderNavByRole('student');
constructResultNavCard();
displayResult();