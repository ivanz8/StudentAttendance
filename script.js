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

// Add these constants at the top of your file
const TWILIO_ACCOUNT_SID = 'ACb3fe03839e25f87a6f4fbc37320a7103';
const TWILIO_AUTH_TOKEN = '00d9b0a3efafae5f451c10e758722cb5';
const TWILIO_PHONE_NUMBER = '+18564468120';
const TWILIO_API_URL = `https://api.twilio.com/2010-04-01/Accounts/${TWILIO_ACCOUNT_SID}/Messages.json`;

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

// Add this function to send SMS
async function sendSMS(to, message) {
    const credentials = btoa(`${TWILIO_ACCOUNT_SID}:${TWILIO_AUTH_TOKEN}`);
    
    try {
        const response = await fetch(TWILIO_API_URL, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/x-www-form-urlencoded',
                'Authorization': `Basic ${credentials}`
            },
            body: new URLSearchParams({
                'To': to,
                'From': TWILIO_PHONE_NUMBER,
                'Body': message
            })
        });

        if (!response.ok) {
            throw new Error('Failed to send SMS');
        }

        return true;
    } catch (error) {
        console.error('SMS sending failed:', error);
        return false;
    }
}

// Registration Form Submission
document.getElementById('registerButton').addEventListener('click', async function() {
    const studentNumber = document.getElementById('regStudentNumber').value.trim();
    const name = document.getElementById('regName').value.trim();
    const college = document.getElementById('regCollege').value;
    const program = document.getElementById('regProgram').value;
    const year = document.getElementById('regYear').value;
    const guardianEmail = document.getElementById('regGuardianEmail').value.trim();
    const guardianPhone = document.getElementById('regGuardianPhone').value.trim();

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
    if (!studentNumber || !name || !college || !program || !year || !guardianEmail || !guardianPhone) {
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
    const phoneRegex = /^\+[1-9]\d{1,14}$/;
    if (!phoneRegex.test(guardianPhone)) {
        messageElement.textContent = 'Please enter a valid phone number in international format (e.g., +639123456789)';
        messageElement.className = 'message error';
        messageElement.style.display = 'block';
        return;
    }

    // Check existing student only if registering a new student
    const students = await db.getStudents();
    if (!document.getElementById('registerButton').textContent.includes('Save Changes') && students[studentNumber]) {
        messageElement.textContent = 'Student with this number already exists.';
        messageElement.className = 'message error';
        messageElement.style.display = 'block';
        return;
    }

    // Add new student or update existing student
    const studentData = {
        name: name,
        college: college,
        program: program,
        year: year,
        schedule: schedule,
        guardianEmail: guardianEmail,
        guardianPhone: guardianPhone
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
    document.getElementById('regGuardianPhone').value = '';
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
        
        const { date } = getPhilippineDateTime();
        
        const records = Array.isArray(attendance) ? attendance : Object.values(attendance);
        
        const todayRecords = records.filter(record => 
            record.studentNumber === studentNumber && 
            record.date === date
        );

        // Get the last record for the day
        const lastRecord = todayRecords[todayRecords.length - 1];
        
        // If no records exist or last record was 'exit', allow entry
        // If last record was 'entry', allow exit
        return { 
            hasEntry: lastRecord?.type === 'entry',
            hasExit: lastRecord?.type === 'exit' || !lastRecord,
            totalRecords: todayRecords
        };
    } catch (error) {
        console.error('Error checking attendance:', error);
        return { hasEntry: false, hasExit: true, totalRecords: [] };
    }
}

// Function to update button states
function updateAttendanceButtons(hasEntry, hasExit) {
    const entryButton = document.getElementById('entryButton');
    const exitButton = document.getElementById('exitButton');

    // Remove existing event listeners by cloning and replacing buttons
    const newEntryButton = entryButton.cloneNode(true);
    const newExitButton = exitButton.cloneNode(true);
    entryButton.parentNode.replaceChild(newEntryButton, entryButton);
    exitButton.parentNode.replaceChild(newExitButton, exitButton);

    // Enable entry button if last action was exit or no records
    newEntryButton.disabled = !hasExit;
    // Enable exit button if last action was entry
    newExitButton.disabled = !hasEntry;
    
    // Set correct text for each button
    newEntryButton.textContent = 'IN';
    newExitButton.textContent = 'OUT';

    // Add visual feedback
    [newEntryButton, newExitButton].forEach(button => {
        if (button.disabled) {
            button.style.opacity = '0.5';
            button.style.cursor = 'not-allowed';
            button.style.pointerEvents = 'none';
            button.title = button === newEntryButton ? 
                'Must record exit first' : 
                'Must record entry first';
            button.dataset.loading = 'false';
        } else {
            button.style.opacity = '1';
            button.style.cursor = 'pointer';
            button.style.pointerEvents = 'auto';
            button.title = '';
            button.dataset.loading = 'false';
        }
    });

    // Only add event listeners to enabled buttons
    if (hasExit) {
        newEntryButton.addEventListener('click', () => recordAttendance('entry'));
    }
    if (hasEntry) {
        newExitButton.addEventListener('click', () => recordAttendance('exit'));
    }
}

// Function to search for a student
async function searchStudent() {
    const studentNumber = document.getElementById('searchStudentNumber').value.trim();
    const messageElement = document.getElementById('studentStatusMessage');
    const attendanceStatus = document.getElementById('attendanceStatus');
    const attendanceHistory = document.getElementById('attendanceHistory');
    const scheduleDisplay = document.getElementById('studentSchedule');
    const statusIndicator = document.getElementById('studentStatus');

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
        const { hasEntry, hasExit, totalRecords } = await checkTodayAttendance(studentNumber);
        
        // Update status text and color
        if (totalRecords.length === 0) {
            statusIndicator.textContent = 'Current Status: Not Present Today';
            statusIndicator.style.color = '#721c24';
        } else {
            const lastRecord = totalRecords[totalRecords.length - 1];
            if (lastRecord.type === 'entry') {
                statusIndicator.textContent = 'Current Status: Inside Campus';
                statusIndicator.style.color = '#155724';
            } else {
                statusIndicator.textContent = 'Current Status: Outside Campus';
                statusIndicator.style.color = '#856404';
            }
            
            // Add total entries/exits for the day
            const entries = totalRecords.filter(r => r.type === 'entry').length;
            const exits = totalRecords.filter(r => r.type === 'exit').length;
            statusIndicator.textContent += ` (Entries: ${entries}, Exits: ${exits})`;
        }

        // Update button states
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

// Function to record attendance
async function recordAttendance(type) {
    const button = type === 'entry' ? document.getElementById('entryButton') : document.getElementById('exitButton');
    const statusIndicator = document.getElementById('studentStatus');
    
    if (button.disabled || button.dataset.loading === 'true') {
        return;
    }

    button.disabled = true;
    button.dataset.loading = 'true';
    button.textContent = 'Processing...';

    try {
        // Get student number and validate
        const studentNumber = document.getElementById('searchStudentNumber').value.trim();
        const students = await db.getStudents();
        const student = students[studentNumber];
        if (!student) {
            throw new Error('Student not found');
        }

        // Get current date and time
        const { date, time } = getPhilippineDateTime();

        // Save initial attendance record
        const attendanceRef = await database.ref('attendance').push({
            studentNumber: studentNumber,
            name: student.name,
            college: student.college,
            program: student.program,
            year: student.year,
            date: date,
            time: time,
            type: type,
            notificationSent: 'Processing...'
        });

        const recordKey = attendanceRef.key;

        try {
            // Send notifications and track their statuses
            const notificationStatus = await sendNotifications(student, type, date, time);

            // Update the attendance record with notification status
            await database.ref(`attendance/${recordKey}`).update({
                notificationSent: notificationStatus.join(' | ')
            });

            // Check and update current attendance status
            const { hasEntry, hasExit } = await checkTodayAttendance(studentNumber);
            updateStatusIndicator(statusIndicator, hasEntry, hasExit);

            // Update buttons and attendance history
            updateAttendanceButtons(hasEntry, hasExit);
            await loadAttendanceHistory(studentNumber);

            // Show success message
            const messageElement = document.getElementById('studentStatusMessage');
            messageElement.textContent = `Attendance ${type} recorded successfully! (${notificationStatus.join(' | ')})`;
            messageElement.className = 'message success';
            messageElement.style.display = 'block';
            
            // Reload the page after the message is displayed
            setTimeout(() => {
                messageElement.style.display = 'none'; 
                location.reload(); // Reload the page
            }, 3000); // Adjust the timeout as needed

        } catch (error) {
            console.error('Error sending notifications:', error);
            await database.ref(`attendance/${recordKey}`).update({
                notificationSent: 'Failed to send notifications'
            });
        }
    } catch (error) {
        console.error('Error recording attendance:', error);
        const messageElement = document.getElementById('studentStatusMessage');
        messageElement.textContent = 'Error recording attendance. Please try again.';
        messageElement.className = 'message error';
        messageElement.style.display = 'block';
    } finally {
        // Re-enable the button regardless of success or failure
        button.disabled = false;
        button.dataset.loading = 'false';
        button.textContent = type === 'entry' ? 'Record Entry' : 'Record Exit';
    }
}

// Helper function to send notifications
async function sendNotifications(student, type, date, time) {
    const notificationStatus = [];

    // Format time and date properly
    const formattedTime = formatTime(time); // Extract time only (e.g., "7:00 AM")
    const formattedDate = formatDate(date); // Extract date only (e.g., "4/10/2025")

    // Send email
    try {
        const emailResponse = await fetch('https://nodetendance-production.up.railway.app/send-email', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Access-Control-Allow-Origin': '*'
            },
            body: JSON.stringify({
                studentName: student.name,
                type: type,
                guardianEmail: student.guardianEmail,
                time: formattedTime,
                date: formattedDate
            })
        });

        notificationStatus.push(emailResponse.ok ? 'Email: Sent' : 'Email: Failed');
    } catch (error) {
        notificationStatus.push('Email: Failed');
    }

    // Send SMS
    try {
        const message = `Your student ${student.name} has ${type === 'entry' ? 'entered' : 'exited'} the school at ${formattedTime} on ${formattedDate}.`;
        const smsResponse = await sendSMS(student.guardianPhone, message);
        notificationStatus.push(smsResponse ? 'SMS: Sent' : 'SMS: Failed');
    } catch (error) {
        notificationStatus.push('SMS: Failed');
    }

    return notificationStatus;
}

// Helper function to update the status indicator
function updateStatusIndicator(statusIndicator, hasEntry, hasExit) {
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

// Helper function to format time (e.g., "7:00 AM")
function formatTime(time) {
    const dateObj = new Date(time);
    return dateObj.toLocaleTimeString('en-US', {
        hour: 'numeric',
        minute: '2-digit',
        hour12: true
    });
}

// Helper function to format date (e.g., "4/10/2025")
function formatDate(date) {
    const dateObj = new Date(date);
    return dateObj.toLocaleDateString('en-US');
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
            <td>
                Email: ${student.guardianEmail}<br>
                Phone: ${student.guardianPhone || 'N/A'}
            </td>
            <td><button class="edit-button" data-student-number="${studentNumber}">Edit</button></td>
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
// Firebase reference
document.addEventListener('click', async (event) => {
    if (event.target.classList.contains('edit-button')) {
        const studentNumber = event.target.getAttribute('data-student-number');
        const students = await db.getStudents();
        const student = students[studentNumber];
        openEditForm(studentNumber, student);
    }
});

// Function to switch between tabs
function switchTab(tabId) {
    // Hide all tab contents
    document.querySelectorAll('.tab-content').forEach(content => {
        content.classList.remove('active');
    });

    // Remove active class from all tabs
    document.querySelectorAll('.tab').forEach(tab => {
        tab.classList.remove('active');
    });

    // Show the selected tab content
    document.getElementById(tabId).classList.add('active');

    // Set the clicked tab as active
    const activeTab = document.querySelector(`.tab[data-tab="${tabId}"]`);
    if (activeTab) {
        activeTab.classList.add('active');
    }
}

// Open the edit form and populate it with existing data
function openEditForm(studentNumber, student) {
    // Switch to the Registration tab
    switchTab('registration');

    // Populate the form fields
    document.getElementById('regStudentNumber').value = studentNumber;
    document.getElementById('regName').value = student.name;
    document.getElementById('regCollege').value = student.college;

    // Populate the program and year level based on the college
    updateProgramDropdown(student.college, student.program);
    document.getElementById('regYear').value = student.year; // Set the year level

    document.getElementById('regGuardianEmail').value = student.guardianEmail || '';
    document.getElementById('regGuardianPhone').value = student.guardianPhone || '';

    // Generate schedule selectors to reuse the existing design
    generateScheduleSelectors(); // Call the existing function to create the schedule structure

    // Populate the existing schedule data
    populateScheduleEntries(student.schedule);

    // Update the Register button to Save Changes
    const registerButton = document.getElementById('registerButton');
    registerButton.textContent = 'Save Changes';
    registerButton.onclick = async () => await saveEditedStudent(studentNumber);
}

// Function to populate schedule entries based on existing data
function populateScheduleEntries(schedule) {
    daysOfWeek.forEach(day => {
        const entryList = document.getElementById(`schedule-entry-list-${day}`);
        if (schedule[day] && schedule[day] !== 'Vacant') {
            schedule[day].forEach(entry => {
                const entryDiv = document.createElement('div');
                entryDiv.classList.add('schedule-entry');

                // Subject Input Wrapper
                const subjectWrapper = document.createElement('div');
                subjectWrapper.classList.add('input-wrapper');
                const subjectInput = document.createElement('input');
                subjectInput.type = 'text';
                subjectInput.placeholder = 'Subject';
                subjectInput.classList.add('schedule-subject-input');
                subjectInput.value = entry.subject; // Set existing subject
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

                // Set the time based on existing data
                if (entry.time === timeOptionVacant) {
                    timeSelect.value = timeOptionVacant;
                } else {
                    timeSelect.value = timeOptionEnter; // Assuming custom time input is used
                }

                const timeInputCustom = document.createElement('input');
                timeInputCustom.type = 'text';
                timeInputCustom.placeholder = 'e.g., 9-11AM';
                timeInputCustom.classList.add('schedule-time-input-custom');
                timeInputCustom.value = entry.time !== timeOptionVacant ? entry.time : ''; // Set existing time
                timeInputCustom.style.display = entry.time === timeOptionVacant ? 'none' : 'block';

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
            });
        }
    });
}

// Save the edited student data
async function saveEditedStudent(studentNumber) {
    const updatedData = {
        name: document.getElementById('regName').value.trim(),
        college: document.getElementById('regCollege').value,
        program: document.getElementById('regProgram').value,
        year: document.getElementById('regYear').value,
        guardianEmail: document.getElementById('regGuardianEmail').value.trim(),
        guardianPhone: document.getElementById('regGuardianPhone').value.trim(),
        schedule: getSelectedSchedule()
    };

    try {
        // Update the student data in Firebase
        await fetch(`${DB_URL}/students/${studentNumber}.json`, {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(updatedData)
        });

        alert('Student updated successfully!');
        loadStudentRecords(); // Refresh the records table
        clearRegistrationForm(); // Reset the form
    } catch (error) {
        console.error('Error updating student:', error);
        alert('Failed to update student. Please try again.');
    }
}

// Helper function to dynamically update the program dropdown
function updateProgramDropdown(college, selectedProgram) {
    const programContainer = document.getElementById('programContainer');
    const programDropdown = document.getElementById('regProgram');

    // Show the program container
    programContainer.style.display = 'block';

    // Define programs for each college
    const programs = {
        CEA: ['BS Computer Science', 'BS Civil Engineering', 'BS Architecture'],
        CAS: ['BS Psychology', 'BA Communication', 'BS Biology'],
        CBEA: ['BS Business Administration', 'BS Economics', 'BS Accountancy']
    };

    // Populate the program dropdown
    programDropdown.innerHTML = '<option value="">Select Program</option>';
    if (programs[college]) {
        programs[college].forEach(program => {
            const option = document.createElement('option');
            option.value = program;
            option.textContent = program;
            if (program === selectedProgram) {
                option.selected = true;
            }
            programDropdown.appendChild(option);
        });
    }
}

// Register a new student
async function registerStudent() {
    const studentNumber = document.getElementById('regStudentNumber').value.trim();
    const name = document.getElementById('regName').value.trim();
    const college = document.getElementById('regCollege').value;
    const program = document.getElementById('regProgram').value;
    const year = document.getElementById('regYear').value;
    const guardianEmail = document.getElementById('regGuardianEmail').value.trim();
    const guardianPhone = document.getElementById('regGuardianPhone').value.trim();
    const schedule = getSelectedSchedule();

    if (!studentNumber || !name || !college || !program || !year || !guardianEmail || !guardianPhone || schedule.length === 0) {
        alert('Please fill out all required fields.');
        return;
    }

    const newStudent = {
        name,
        college,
        program,
        year,
        guardianEmail,
        guardianPhone,
        schedule
    };

    try {
        await fetch(`${DB_URL}/students/${studentNumber}.json`, {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(newStudent)
        });

        alert('Student registered successfully!');
        clearRegistrationForm();
        loadStudentRecords(); // Refresh the records table
    } catch (error) {
        console.error('Error registering student:', error);
        alert('Failed to register student. Please try again.');
    }
}

// Initialize the app
document.addEventListener('DOMContentLoaded', () => {
    loadStudentRecords(); // Load student records when the page loads
});