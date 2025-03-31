// Define program structure
const collegePrograms = {
    "CEA": [
        "Civil Engineering",
        "Electrical Engineering",
        "Mechanical Engineering",
        "Computer Engineering"
    ],
    "CAS": [
        "Physics",
        "Chemistry",
        "Mathematics",
        "English Literature"
    ],
    "CBEA": [
        "Accountancy",
        "Business Administration",
        "Economics",
        "Marketing"
    ]
};

const daysOfWeek = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday"];
const timeOptionVacant = "Vacant Time";
const timeOptionEnter = "Enter Time...";
const DB_URL = "https://amaz-4e4ef-default-rtdb.firebaseio.com";

// Database operations
const db = {
    async getStudents() {
        try {
            const response = await fetch(`${DB_URL}/students.json`);
            const data = await response.json();
            return data || {};
        } catch (error) {
            console.error('Error fetching students:', error);
            return {};
        }
    },

    async saveStudent(studentNumber, studentData) {
        try {
            const response = await fetch(`${DB_URL}/students/${studentNumber}.json`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(studentData)
            });
            return response.ok;
        } catch (error) {
            console.error('Error saving student:', error);
            return false;
        }
    },

    async getAttendance() {
        try {
            const response = await fetch(`${DB_URL}/attendance.json`);
            const data = await response.json();
            return data || [];
        } catch (error) {
            console.error('Error fetching attendance:', error);
            return [];
        }
    },

    async saveAttendance(attendanceData) {
        try {
            const response = await fetch(`${DB_URL}/attendance.json`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(attendanceData)
            });
            return response.ok;
        } catch (error) {
            console.error('Error saving attendance:', error);
            return false;
        }
    }
};

// Function to add a new subject/time entry row for a specific day
function addScheduleEntry(day) {
    const entryList = document.getElementById(`schedule-entry-list-${day}`);
    if (!entryList) return;

    const entryDiv = document.createElement('div');
    entryDiv.classList.add('schedule-entry');

    // Subject Input Wrapper
    const subjectWrapper = document.createElement('div');
    subjectWrapper.classList.add('input-wrapper');
    const subjectInput = document.createElement('input');
    subjectInput.type = 'text';
    subjectInput.placeholder = 'Subject';
    subjectInput.classList.add('schedule-subject-input');
    subjectWrapper.appendChild(subjectInput);

    // Time Selection Wrapper
    const timeWrapper = document.createElement('div');
    timeWrapper.classList.add('input-wrapper');

    const timeSelect = document.createElement('select');
    timeSelect.classList.add('schedule-time-select');
    timeSelect.innerHTML = `
        <option value="${timeOptionEnter}">${timeOptionEnter}</option>
        <option value="${timeOptionVacant}">${timeOptionVacant}</option>
    `;

    const timeInputCustom = document.createElement('input');
    timeInputCustom.type = 'text';
    timeInputCustom.placeholder = 'e.g., 9-11AM';
    timeInputCustom.classList.add('schedule-time-input-custom');
    timeInputCustom.style.display = 'block';

    timeWrapper.appendChild(timeSelect);
    timeWrapper.appendChild(timeInputCustom);

    timeSelect.addEventListener('change', function() {
        if (this.value === timeOptionVacant) {
            timeInputCustom.style.display = 'none';
            timeInputCustom.value = '';
        } else {
            timeInputCustom.style.display = 'block';
        }
    });

    const deleteButton = document.createElement('button');
    deleteButton.type = 'button';
    deleteButton.textContent = 'Delete';
    deleteButton.classList.add('small', 'delete-entry');
    deleteButton.onclick = function() {
        entryDiv.remove();
    };

    entryDiv.appendChild(subjectWrapper);
    entryDiv.appendChild(timeWrapper);
    entryDiv.appendChild(deleteButton);

    entryList.appendChild(entryDiv);
}

// Function to generate schedule input fields for each day
function generateScheduleSelectors() {
    const container = document.getElementById('scheduleSelector');
    container.innerHTML = '';

    daysOfWeek.forEach(day => {
        const dayDiv = document.createElement('div');
        dayDiv.classList.add('schedule-day');
        dayDiv.id = `schedule-day-${day}`;

        const dayLabel = document.createElement('label');
        dayLabel.textContent = day;
        dayLabel.classList.add('day-label');
        dayDiv.appendChild(dayLabel);

        const entryList = document.createElement('div');
        entryList.id = `schedule-entry-list-${day}`;
        entryList.classList.add('schedule-entry-list');
        dayDiv.appendChild(entryList);

        const addButtonContainer = document.createElement('div');
        addButtonContainer.classList.add('add-subject-btn-container');

        const addButton = document.createElement('button');
        addButton.type = 'button';
        addButton.textContent = 'Add Subject';
        addButton.classList.add('small', 'success');
        addButton.onclick = function() { addScheduleEntry(day); };
        addButtonContainer.appendChild(addButton);

        dayDiv.appendChild(addButtonContainer);
        container.appendChild(dayDiv);
    });
}

// Tab Navigation
document.querySelectorAll('.tab').forEach(tab => {
    tab.addEventListener('click', function() {
        document.querySelectorAll('.tab').forEach(t => t.classList.remove('active'));
        document.querySelectorAll('.tab-content').forEach(c => c.classList.remove('active'));
        this.classList.add('active');
        const tabId = this.getAttribute('data-tab');
        document.getElementById(tabId).classList.add('active');
        if (tabId === 'records') {
            loadStudentRecords();
        }
    });
});

// Handle college selection in registration form
document.getElementById('regCollege').addEventListener('change', function() {
    const college = this.value;
    const programSelect = document.getElementById('regProgram');
    const programContainer = document.getElementById('programContainer');
    const yearContainer = document.getElementById('yearContainer');
    programSelect.innerHTML = '<option value="">Select Program</option>';
    if (college) {
        collegePrograms[college].forEach(program => {
            const option = document.createElement('option');
            option.value = program;
            option.textContent = program;
            programSelect.appendChild(option);
        });
        programContainer.style.display = 'block';
        yearContainer.style.display = 'block';
    } else {
        programContainer.style.display = 'none';
        yearContainer.style.display = 'none';
    }
});

// Handle college selection in filter
document.getElementById('filterCollege').addEventListener('change', function() {
    const college = this.value;
    const programSelect = document.getElementById('filterProgram');
    programSelect.innerHTML = '<option value="">All Programs</option>';
    if (college) {
        collegePrograms[college].forEach(program => {
            const option = document.createElement('option');
            option.value = program;
            option.textContent = program;
            programSelect.appendChild(option);
        });
    }
    loadStudentRecords();
});

// Handle changes in other filters
document.getElementById('filterProgram').addEventListener('change', loadStudentRecords);
document.getElementById('filterYear').addEventListener('change', loadStudentRecords);

// Registration Form Submission
document.getElementById('registerButton').addEventListener('click', async function() {
    const studentNumber = document.getElementById('regStudentNumber').value.trim();
    const name = document.getElementById('regName').value.trim();
    const college = document.getElementById('regCollege').value;
    const program = document.getElementById('regProgram').value;
    const year = document.getElementById('regYear').value;
    const guardianEmail = document.getElementById('regGuardianEmail').value.trim();

    // Collect schedule data
    const schedule = {};
    let scheduleValid = true;
    let validationMessage = '';

    daysOfWeek.forEach(day => {
        const entryList = document.getElementById(`schedule-entry-list-${day}`);
        const entries = entryList.querySelectorAll('.schedule-entry');
        const daySchedule = [];

        entries.forEach((entryDiv) => {
            const subjectInput = entryDiv.querySelector('.schedule-subject-input');
            const timeSelect = entryDiv.querySelector('.schedule-time-select');
            const timeInputCustom = entryDiv.querySelector('.schedule-time-input-custom');

            const subject = subjectInput.value.trim();
            let time = timeOptionVacant;

            if (timeSelect.value === timeOptionEnter) {
                time = timeInputCustom.value.trim();
                if (!time) {
                    scheduleValid = false;
                    validationMessage = `Please enter a time for '${subject || 'entry'}' on ${day} or select 'Vacant Time'.`;
                    timeInputCustom.style.borderColor = 'red';
                } else {
                    timeInputCustom.style.borderColor = '#ddd';
                }
            } else {
                timeInputCustom.style.borderColor = '#ddd';
            }

            if (!subject) {
                scheduleValid = false;
                validationMessage = `Please enter a subject for the entry on ${day}.`;
                subjectInput.style.borderColor = 'red';
            } else {
                subjectInput.style.borderColor = '#ddd';
            }

            if (subject) {
                daySchedule.push({ subject: subject, time: time });
            }

            if (scheduleValid) {
                entryDiv.style.borderColor = '#ddd';
            } else {
                entryDiv.style.borderColor = 'red';
            }
        });

        if (daySchedule.length > 0) {
            schedule[day] = daySchedule;
        } else {
            schedule[day] = 'Vacant';
        }
        if (scheduleValid) {
            document.getElementById(`schedule-day-${day}`).style.borderColor = '#f0f0f0';
        }
    });

    const messageElement = document.getElementById('registrationMessage');

    // Validations
    if (!studentNumber || !name || !college || !program || !year || !guardianEmail) {
        messageElement.textContent = 'Please fill in all required student details.';
        messageElement.className = 'message error';
        messageElement.style.display = 'block';
        return;
    }
    if (!scheduleValid) {
        messageElement.textContent = validationMessage;
        messageElement.className = 'message error';
        messageElement.style.display = 'block';
        return;
    }
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(guardianEmail)) {
        messageElement.textContent = 'Please enter a valid email address.';
        messageElement.className = 'message error';
        messageElement.style.display = 'block';
        return;
    }

    // Check existing student
    const students = await db.getStudents();
    if (students[studentNumber]) {
        messageElement.textContent = 'Student with this number already exists.';
        messageElement.className = 'message error';
        messageElement.style.display = 'block';
        return;
    }

    // Add new student
    const studentData = {
        name: name,
        college: college,
        program: program,
        year: year,
        schedule: schedule,
        guardianEmail: guardianEmail
    };

    const success = await db.saveStudent(studentNumber, studentData);
    if (success) {
        messageElement.textContent = 'Student registered successfully!';
        messageElement.className = 'message success';
        messageElement.style.display = 'block';
        document.getElementById('clearRegForm').click();
        setTimeout(() => { messageElement.style.display = 'none'; }, 3000);
    } else {
        messageElement.textContent = 'Error saving student data. Please try again.';
        messageElement.className = 'message error';
        messageElement.style.display = 'block';
    }
});

// Clear Registration Form
document.getElementById('clearRegForm').addEventListener('click', function() {
    document.getElementById('regStudentNumber').value = '';
    document.getElementById('regName').value = '';
    document.getElementById('regCollege').value = '';
    document.getElementById('regProgram').innerHTML = '<option value="">Select Program</option>';
    document.getElementById('regYear').value = '';
    document.getElementById('regGuardianEmail').value = '';
    document.getElementById('registrationMessage').style.display = 'none';
    document.getElementById('programContainer').style.display = 'none';
    document.getElementById('yearContainer').style.display = 'none';
    daysOfWeek.forEach(day => {
        document.getElementById(`schedule-entry-list-${day}`).innerHTML = '';
        document.getElementById(`schedule-day-${day}`).style.borderColor = '#f0f0f0';
    });
});

// Search Student Event Listeners
document.getElementById('searchStudentNumber').addEventListener('keypress', function(event) {
    if (event.key === 'Enter') {
        event.preventDefault();
        searchStudent();
    }
});
document.getElementById('searchStudentButton').addEventListener('click', searchStudent);

// Function to format schedule object for display
function formatScheduleForDisplay(schedule) {
    if (!schedule) return 'N/A';
    if (typeof schedule === 'string') return schedule;

    if (typeof schedule === 'object' && schedule !== null) {
        let scheduleString = '';
        daysOfWeek.forEach(day => {
            const daySchedule = schedule[day];
            if (daySchedule && daySchedule !== 'Vacant') {
                if (Array.isArray(daySchedule)) {
                    scheduleString += `${day}:\n`;
                    daySchedule.forEach(entry => {
                        const timeDisplay = entry.time === timeOptionVacant ? '(Vacant Time)' : `(${entry.time})`;
                        scheduleString += `  - ${entry.subject} ${timeDisplay}\n`;
                    });
                } else if (typeof daySchedule === 'object' && daySchedule.subject) {
                    const timeDisplay = daySchedule.time === timeOptionVacant ? '(Vacant Time)' : `(${daySchedule.time})`;
                    scheduleString += `${day}: ${daySchedule.subject} ${timeDisplay}\n`;
                } else if (typeof daySchedule === 'string') {
                    scheduleString += `${day}: ${daySchedule}\n`;
                }
            }
        });
        return scheduleString.trim() || 'No classes scheduled.';
    }
    return 'N/A';
}

// Function to get current Philippine date and time
function getPhilippineDateTime() {
    const options = {
        timeZone: 'Asia/Manila',
        year: 'numeric',
        month: '2-digit',
        day: '2-digit',
        hour: '2-digit',
        minute: '2-digit',
        hour12: true // This will show time in 12-hour format with AM/PM
    };

    const now = new Date();
    const phTime = now.toLocaleTimeString('en-PH', options);
    const phDate = now.toLocaleDateString('en-PH', {
        timeZone: 'Asia/Manila',
        year: 'numeric',
        month: '2-digit',
        day: '2-digit'
    });

    return {
        date: phDate.split('/').reverse().join('-'), // Convert to YYYY-MM-DD format
        time: phTime
    };
}

// Function to check today's attendance status for a student
async function checkTodayAttendance(studentNumber) {
    try {
        const snapshot = await database.ref('attendance').once('value');
        const attendance = snapshot.val() || [];
        
        const { date } = getPhilippineDateTime(); // Get current PH date
        
        const records = Array.isArray(attendance) ? attendance : Object.values(attendance);
        
        const todayRecords = records.filter(record => 
            record.studentNumber === studentNumber && 
            record.date === date
        );

        const hasEntry = todayRecords.some(record => record.type === 'entry');
        const hasExit = todayRecords.some(record => record.type === 'exit');

        return { hasEntry, hasExit };
    } catch (error) {
        console.error('Error checking attendance:', error);
        return { hasEntry: false, hasExit: false };
    }
}

// Function to update button states
function updateAttendanceButtons(hasEntry, hasExit) {
    const entryButton = document.getElementById('entryButton');
    const exitButton = document.getElementById('exitButton');

    // Update button states based on database status
    entryButton.disabled = hasEntry;
    exitButton.disabled = hasExit;

    // Add visual feedback for disabled state
    [entryButton, exitButton].forEach(button => {
        if (button.disabled) {
            button.style.opacity = '0.5';
            button.style.cursor = 'not-allowed';
            button.title = 'Already recorded for today';
        } else {
            button.style.opacity = '1';
            button.style.cursor = 'pointer';
            button.title = '';
        }
    });

    // Update status indicator
    const statusIndicator = document.getElementById('studentStatus');
    if (hasEntry && hasExit) {
        statusIndicator.textContent = 'Current Status: Completed attendance for today';
        statusIndicator.style.color = '#155724';
    } else if (hasEntry) {
        statusIndicator.textContent = 'Current Status: Entered, pending exit';
        statusIndicator.style.color = '#856404';
    } else {
        statusIndicator.textContent = 'Current Status: Not Present';
        statusIndicator.style.color = '#721c24';
    }
}

// Function to search for a student
async function searchStudent() {
    const studentNumber = document.getElementById('searchStudentNumber').value.trim();
    const messageElement = document.getElementById('studentStatusMessage');
    const attendanceStatus = document.getElementById('attendanceStatus');
    const attendanceHistory = document.getElementById('attendanceHistory');
    const scheduleDisplay = document.getElementById('studentSchedule');

    messageElement.style.display = 'none';
    attendanceStatus.classList.add('hidden');
    attendanceHistory.classList.add('hidden');
    scheduleDisplay.textContent = '';

    if (!studentNumber) {
        messageElement.textContent = 'Please enter a student number.';
        messageElement.className = 'message error';
        messageElement.style.display = 'block';
        return;
    }

    try {
        // Get student data from Firebase
        const studentSnapshot = await database.ref(`students/${studentNumber}`).once('value');
        const student = studentSnapshot.val();

        if (!student) {
            messageElement.textContent = 'Student number not found in the system.';
            messageElement.className = 'message error';
            messageElement.style.display = 'block';
            return;
        }

        // Display student information
        document.getElementById('studentName').textContent = student.name;
        document.getElementById('studentDept').textContent = student.college;
        document.getElementById('studentProgram').textContent = student.program;
        document.getElementById('studentYear').textContent = student.year;
        scheduleDisplay.textContent = formatScheduleForDisplay(student.schedule);
        attendanceStatus.classList.remove('hidden');

        // Check current attendance status from database
        const { hasEntry, hasExit } = await checkTodayAttendance(studentNumber);
        updateAttendanceButtons(hasEntry, hasExit);

        await loadAttendanceHistory(studentNumber);
        attendanceHistory.classList.remove('hidden');

    } catch (error) {
        console.error('Error searching student:', error);
        messageElement.textContent = 'Error loading student data. Please try again.';
        messageElement.className = 'message error';
        messageElement.style.display = 'block';
    }
}

// Record Entry/Exit Buttons
document.getElementById('entryButton').addEventListener('click', () => recordAttendance('entry'));
document.getElementById('exitButton').addEventListener('click', () => recordAttendance('exit'));

// Function to record attendance
async function recordAttendance(type) {
    const button = type === 'entry' ? document.getElementById('entryButton') : document.getElementById('exitButton');
    
    // Immediately disable the button
    button.disabled = true;
    button.style.opacity = '0.5';
    button.style.cursor = 'not-allowed';
    button.title = 'Already used today';

    const studentNumber = document.getElementById('searchStudentNumber').value.trim();
    const students = await db.getStudents();
    const student = students[studentNumber];
    if (!student) {
        // Re-enable button if student not found
        button.disabled = false;
        button.style.opacity = '1';
        button.style.cursor = 'pointer';
        button.title = '';
        return;
    }

    const { date, time } = getPhilippineDateTime();
    const record = {
        studentNumber: studentNumber,
        name: student.name,
        college: student.college,
        program: student.program,
        year: student.year,
        date: date,
        time: time,
        type: type,
        notificationSent: 'Email sent to ' + student.guardianEmail
    };

    const success = await db.saveAttendance(record);
    if (success) {
        // Check and update both button states after recording attendance
        const { hasEntry, hasExit } = await checkTodayAttendance(studentNumber);
        updateAttendanceButtons(hasEntry, hasExit);

        await loadAttendanceHistory(studentNumber);
        const messageElement = document.getElementById('studentStatusMessage');
        messageElement.textContent = `Attendance ${type} recorded successfully! Notification email sent to guardian.`;
        messageElement.className = 'message success';
        messageElement.style.display = 'block';
        setTimeout(() => { messageElement.style.display = 'none'; }, 3000);
    } else {
        // Re-enable button if save failed
        button.disabled = false;
        button.style.opacity = '1';
        button.style.cursor = 'pointer';
        button.title = '';
        
        const messageElement = document.getElementById('studentStatusMessage');
        messageElement.textContent = 'Error recording attendance. Please try again.';
        messageElement.className = 'message error';
        messageElement.style.display = 'block';
    }
}

// Function to load attendance history for a student
async function loadAttendanceHistory(studentNumber) {
    try {
        // Get attendance records from Firebase
        const snapshot = await database.ref('attendance').once('value');
        const attendanceData = snapshot.val() || {};
        
        // Convert Firebase object to array and filter for the student
        const records = Object.values(attendanceData).filter(record => 
            record && record.studentNumber === studentNumber
        );

        // Sort records by date and time, newest first
        records.sort((a, b) => {
            const dateA = new Date(a.date + ' ' + a.time);
            const dateB = new Date(b.date + ' ' + b.time);
            return dateB - dateA;
        });

        const tableBody = document.getElementById('attendanceHistoryBody');
        tableBody.innerHTML = '';

        if (records.length === 0) {
            tableBody.innerHTML = '<tr><td colspan="4" style="text-align: center;">No attendance records found</td></tr>';
        } else {
            records.forEach(record => {
                const row = tableBody.insertRow();
                row.innerHTML = `
                    <td>${record.date}</td>
                    <td>${record.time}</td>
                    <td class="${record.type}">${record.type.charAt(0).toUpperCase() + record.type.slice(1)}</td>
                    <td>${record.notificationSent}</td>
                `;
            });
        }
    } catch (error) {
        console.error('Error loading attendance history:', error);
        const tableBody = document.getElementById('attendanceHistoryBody');
        tableBody.innerHTML = '<tr><td colspan="4" style="text-align: center;">Error loading attendance history</td></tr>';
    }
}

// Function to format schedule for the records table
function formatScheduleForTable(schedule) {
    if (!schedule) return 'N/A';
    if (typeof schedule === 'string') return schedule;

    if (typeof schedule === 'object' && schedule !== null) {
        let scheduleString = '';
        let hasSchedule = false;
        daysOfWeek.forEach(day => {
            const daySchedule = schedule[day];
            if (daySchedule && daySchedule !== 'Vacant') {
                hasSchedule = true;
                if (Array.isArray(daySchedule)) {
                    const subjects = daySchedule.map(e => `${e.subject.substring(0,10)}${e.time === timeOptionVacant ? '(V)' : ''}`).join(', ');
                    scheduleString += `${day.substring(0, 3)}: ${subjects}\n`;
                } else if (typeof daySchedule === 'object' && daySchedule.subject) {
                    const timeDisplay = daySchedule.time === timeOptionVacant ? '(V)' : '';
                    scheduleString += `${day.substring(0, 3)}: ${daySchedule.subject.substring(0,10)}${timeDisplay}\n`;
                } else if (typeof daySchedule === 'string') {
                    scheduleString += `${day.substring(0, 3)}: ${daySchedule}\n`;
                }
            }
        });
        return hasSchedule ? scheduleString.trim() : 'All Vacant';
    }
    return 'N/A';
}

// Function to load all student records
async function loadStudentRecords() {
    const students = await db.getStudents();
    const collegeFilter = document.getElementById('filterCollege').value;
    const programFilter = document.getElementById('filterProgram').value;
    const yearFilter = document.getElementById('filterYear').value;
    const tableBody = document.getElementById('studentRecordsBody');
    tableBody.innerHTML = '';

    const studentList = Object.entries(students);

    if (studentList.length === 0) {
        tableBody.innerHTML = '<tr><td colspan="7" style="text-align: center;">No students registered</td></tr>';
        return;
    }

    const filteredStudents = studentList.filter(([studentNumber, student]) => {
        if (collegeFilter && student.college !== collegeFilter) return false;
        if (programFilter && student.program !== programFilter) return false;
        if (yearFilter && student.year !== yearFilter) return false;
        return true;
    });

    if (filteredStudents.length === 0) {
        tableBody.innerHTML = '<tr><td colspan="7" style="text-align: center;">No students match filters</td></tr>';
        return;
    }

    filteredStudents.forEach(([studentNumber, student]) => {
        const row = tableBody.insertRow();
        let badgeClass = '';
        switch (student.college) {
            case 'CEA': badgeClass = 'badge-cea'; break;
            case 'CAS': badgeClass = 'badge-cas'; break;
            case 'CBEA': badgeClass = 'badge-cbea'; break;
        }
        const scheduleDisplay = formatScheduleForTable(student.schedule);

        row.innerHTML = `
            <td>${studentNumber}</td>
            <td>${student.name}</td>
            <td><span class="badge ${badgeClass}">${student.college}</span></td>
            <td>${student.program}</td>
            <td>${student.year}</td>
            <td style="white-space: pre-wrap; font-size: 0.85em;">${scheduleDisplay}</td>
            <td>${student.guardianEmail}</td>
        `;
    });
}

// Initial setup on page load
document.addEventListener('DOMContentLoaded', () => {
    generateScheduleSelectors();
    if (document.getElementById('records').classList.contains('active')) {
        loadStudentRecords();
    }
});
