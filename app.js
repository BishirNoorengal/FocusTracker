alert("app.js started"))
// 1. MODULAR FIREBASE CORE RESOURCE IMPORTS
import { initializeApp } from "https://www.gstatic.com/firebasejs/12.14.0/firebase-app.js";
import { getDatabase, ref, onValue, update, get } from "https://www.gstatic.com/firebasejs/12.14.0/firebase-database.js";

// Your verified database configuration connection keys
const firebaseConfig = {
    apiKey: "AIzaSyDJu6D5IkoB6TlxaVw62OkyGqPl1zqoTEU",
    authDomain: "focustracker-e8d07.firebaseapp.com",
    projectId: "focustracker-e8d07",
    storageBucket: "focustracker-e8d07.firebasestorage.app",
    messagingSenderId: "649183959326",
    appId: "1:649183959326:web:f11c994b047979650b910f",
    databaseURL: "https://focustracker-e8d07-default-rtdb.firebaseio.com"
};

// Initialize Core App Context Instantiation
const app = initializeApp(firebaseConfig);
const db = getDatabase(app);

// 2. PRIVATE WORKSPACE GLOBAL CONFIGURATIONS
const PRIVATE_GATEWAY_KEY = "opensesame"; 

let localState = { todayDate: new Date().toLocaleDateString('en-CA') };
let activeUser = localStorage.getItem('studyUser');
let screenWakeLock = null;
let workspaceFocusMode = false;

// Native Client Device Intercept
const isMobileClient = /Android|iPhone|iPad/i.test(navigator.userAgent);
if (isMobileClient) document.body.classList.add('is-mobile');

// Pipeline Streams Setup
let pipCanvas, pipCtx, pipVideo, squadGrid, tableHeaders;

// 3. INITIALIZATION GATE (Ensures HTML is fully loaded before JavaScript hooks run)
window.addEventListener('DOMContentLoaded', () => {
    pipCanvas = document.getElementById('pip-canvas');
    pipCtx = pipCanvas.getContext('2d');
    pipVideo = document.getElementById('pip-video');
    squadGrid = document.getElementById('squad-grid');
    tableHeaders = document.getElementById('table-headers');

    // Intercept existing local storage verification states on startup paths
    if (activeUser && localStorage.getItem('studySecretVerified') === 'true') {
        mountAuthorizedWorkspace();
    } else {
        const loginBtn = document.getElementById('btn-login');
        if (loginBtn) loginBtn.addEventListener('click', window.verifyAndLogin);
    }

    const logoutBtn = document.getElementById('btn-logout');
    if (logoutBtn) {
        logoutBtn.addEventListener('click', () => {
            localStorage.clear();
            window.location.reload();
        });
    }

    // Initialize Database Synchronizations Loops
    initDatabaseListeners();
});

// 4. SECURITY GATEWAY SECURITY INTERCEPT ROUTINES
window.verifyAndLogin = async () => {
    const enteredName = document.getElementById('user-input').value.trim();
    const enteredSecret = document.getElementById('secret-input').value.trim();
    const errorDisplay = document.getElementById('auth-error');

    if (!enteredName) {
        errorDisplay.innerText = "Please enter your name.";
        return;
    }
    if (enteredName.includes('.') || enteredName.includes('#') || enteredName.includes('$') || enteredName.includes('[') || enteredName.includes(']')) {
        errorDisplay.innerText = "Names cannot contain special database characters (., #, $, [, ]).";
        return;
    }
    if (enteredSecret !== PRIVATE_GATEWAY_KEY) {
        errorDisplay.innerText = "Invalid Secret Access Code!";
        return;
    }

    errorDisplay.innerText = "";
    activeUser = enteredName;
    localStorage.setItem('studyUser', enteredName);
    localStorage.setItem('studySecretVerified', 'true');

    const userCheckSnapshot = await get(ref(db, `stats/${enteredName}`));
    if (!userCheckSnapshot.exists()) {
        await update(ref(db, `stats/${enteredName}`), {
            status: 'break',
            totalToday: 0,
            startTime: 0,
            maxSession: 0,
            lastBreakAt: ""
        });
    }

    mountAuthorizedWorkspace();
};

function mountAuthorizedWorkspace() {
    document.getElementById('auth-gate').style.display = 'none';
    document.getElementById('workspace').style.display = 'block';
    document.getElementById('current-user-display').innerText = activeUser;
    
    requestWakeLockChannel();
    rebuildDynamicInterfaceStructure();
}

// 5. HARDWARE SYSTEM API WAKE-LOCK INTEGRATIONS
async function requestWakeLockChannel() {
    if ('wakeLock' in navigator && !screenWakeLock) {
        try { screenWakeLock = await navigator.wakeLock.request('screen'); }
        catch (err) { console.warn("System OS blocked WakeLock engagement:", err.message); }
    }
}

function releaseWakeLockChannel() {
    if (screenWakeLock) {
        screenWakeLock.release().then(() => { screenWakeLock = null; });
    }
}

// 6. PIPELINE STREAM ARCHITECTURE
async function executePiPToggle() {
    try {
        if (document.pictureInPictureElement) {
            await document.exitPictureInPicture();
        } else {
            renderPiPCanvasFrame('00:00:00', '🌱');
            const streamChannel = pipCanvas.captureStream(1); 
            pipVideo.srcObject = streamChannel;
            await pipVideo.play();
            await pipVideo.requestPictureInPicture();
        }
    } catch (err) { console.error("PiP Allocation Refused:", err); }
}

function renderPiPCanvasFrame(timeString, emojiCharacter) {
    if (!pipCtx) return;
    pipCtx.fillStyle = '#131316';
    pipCtx.fillRect(0, 0, pipCanvas.width, pipCanvas.height);
    pipCtx.fillStyle = '#f5f5f7';
    pipCtx.textAlign = 'center';
    pipCtx.textBaseline = 'middle';
    pipCtx.font = 'bold 28px Inter';
    pipCtx.fillText(timeString, pipCanvas.width / 2 - 20, pipCanvas.height / 2);
    pipCtx.font = '26px Inter';
    pipCtx.fillText(emojiCharacter, pipCanvas.width - 35, pipCanvas.height / 2);
}

document.addEventListener("visibilitychange", () => {
    if (document.visibilityState === 'hidden' && activeUser) {
        const profile = localState[activeUser];
        if (profile && profile.status === 'studying' && !document.pictureInPictureElement) {
            executeStatusToggle(); 
        }
    } else if (document.visibilityState === 'visible' && activeUser) {
        const profile = localState[activeUser];
        if (profile && profile.status === 'studying') requestWakeLockChannel();
    }
});

// 7. FOCUS VISIBILITY UTILITY COMPONENT
function executeFocusToggle() {
    workspaceFocusMode = !workspaceFocusMode;
    const allMembers = Object.keys(localState).filter(key => key !== 'todayDate');
    
    allMembers.forEach(member => {
        if (member !== activeUser) {
            const cardNode = document.getElementById(`card-${member}`);
            if (cardNode) cardNode.style.display = workspaceFocusMode ? 'none' : 'block';
        }
    });
    document.getElementById('history-section').style.display = workspaceFocusMode ? 'none' : 'block';
    document.getElementById('btn-logout').style.display = workspaceFocusMode ? 'none' : 'block';
    
    const focusBtn = document.getElementById(`focus-${activeUser}`);
    if (focusBtn) {
        focusBtn.innerText = workspaceFocusMode ? 'Show All' : 'Focus';
        focusBtn.style.background = workspaceFocusMode ? '#86868b' : '#3498db';
    }
}

// 8. DATABASE UPSTREAM & DOWNSTREAM SYNCHRONIZATION RUNTIMES
function initDatabaseListeners() {
    onValue(ref(db, 'stats'), (snapshot) => {
        const remoteData = snapshot.val() || { todayDate: new Date().toLocaleDateString('en-CA') };
        const systemTodayString = new Date().toLocaleDateString('en-CA');
        
        if (remoteData.todayDate && remoteData.todayDate !== systemTodayString) {
            executeMidnightResetCycle(remoteData, systemTodayString);
        } else {
            localState = remoteData;
            rebuildDynamicInterfaceStructure();
        }
    });

    onValue(ref(db, 'history'), (snapshot) => {
        if (!tableHeaders) return;
        const tableBody = document.getElementById('table-body');
        tableBody.innerHTML = '';
        const historicalNode = snapshot.val();
        if (!historicalNode) return;

        const historicalMembers = new Set();
        Object.values(historicalNode).forEach(dayData => {
            Object.keys(dayData).forEach(name => historicalMembers.add(name));
        });
        const sortedMembersList = Array.from(historicalMembers).sort();

        tableHeaders.innerHTML = `<th>Date</th>` + sortedMembersList.map(m => `<th>${m}</th>`).join('');

        Object.keys(historicalNode).sort((a, b) => new Date(b) - new Date(a)).forEach(dateKey => {
            const rowData = historicalNode[dateKey];
            let structuralCells = `<td>${dateKey}</td>`;
            sortedMembersList.forEach(member => {
                structuralCells += `<td>${rowData[member] || '00:00:00'}</td>`;
            });
            tableBody.innerHTML += `<tr>${structuralCells}</tr>`;
        });
    });
}

function rebuildDynamicInterfaceStructure() {
    if (!squadGrid) return;
    const currentRegisteredMembers = Object.keys(localState).filter(key => key !== 'todayDate');
    squadGrid.innerHTML = '';

    currentRegisteredMembers.forEach(member => {
        const data = localState[member];
        const activeStudyingFlag = data.status === 'studying';
        const isMe = member === activeUser;

        squadGrid.innerHTML += `
            <div id="card-${member}" class="card ${activeStudyingFlag ? 'studying' : ''}">
                <div id="leader-${member}" class="leader-badge" style="display: none;">🏆</div>
                <div id="reward-${member}" class="reward-badge">🌱</div>
                <div class="name">${member}</div>
                <div id="status-${member}" class="status-badge">${activeStudyingFlag ? 'Studying' : 'On Break'}</div>
                <div id="timer-${member}" class="timer-display">00:00:00</div>
                <div class="max-display">Max Session: <span id="max-${member}">${convertSecondsToFormattedString(data.maxSession || 0)}</span></div>
                <div id="msg-${member}" class="break-msg" style="${data.lastBreakAt && !activeStudyingFlag ? 'display: inline-block;' : 'display: none;'}">${data.lastBreakAt || ''}</div>
                <div id="controls-${member}" class="controls" style="${isMe ? 'display: flex;' : 'display: none;'}">
                    <button id="toggle-${member}" class="btn-toggle ${activeStudyingFlag ? 'active-pausing' : ''}">${activeStudyingFlag ? 'Pause' : (data.totalToday > 0 ? 'Resume' : 'Start')}</button>
                    <button id="focus-${member}" class="btn-focus">Focus</button>
                    <button id="pip-${member}" class="btn-pip">PiP</button>
                    <button id="reset-${member}" class="btn-reset">Reset</button>
                </div>
            </div>`;
    });

    if (activeUser && currentRegisteredMembers.includes(activeUser)) {
        setTimeout(() => {
            const toggleBtn = document.getElementById(`toggle-${activeUser}`);
            const focusBtn = document.getElementById(`focus-${activeUser}`);
            const pipBtn = document.getElementById(`pip-${activeUser}`);
            const resetBtn = document.getElementById(`reset-${activeUser}`);

            if (toggleBtn) toggleBtn.addEventListener('click', executeStatusToggle);
            if (focusBtn) focusBtn.addEventListener('click', executeFocusToggle);
            if (pipBtn) pipBtn.addEventListener('click', executePiPToggle);
            if (resetBtn) resetBtn.addEventListener('click', executeLocalReset);
        }, 50);
    }
}

function executeStatusToggle() {
    if (!activeUser || !localState[activeUser]) return;
    const profile = localState[activeUser];
    const clockString = new Date().toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit', hour12: true });
    
    if (profile.status === 'studying') {
        releaseWakeLockChannel();
        const absoluteDeltaSessionSeconds = Math.floor((Date.now() - profile.startTime) / 1000);
        update(ref(db, `stats/${activeUser}`), {
            status: 'break',
            totalToday: (profile.totalToday || 0) + absoluteDeltaSessionSeconds,
            maxSession: Math.max((profile.maxSession || 0), absoluteDeltaSessionSeconds),
            startTime: 0,
            lastBreakAt: `Paused study session at ${clockString}`
        });
    } else {
        requestWakeLockChannel();
        update(ref(db, `stats/${activeUser}`), {
            status: 'studying',
            startTime: Date.now(),
            lastBreakAt: ""
        });
    }
}

function executeLocalReset() {
    if (!activeUser) return;
    if (confirm("Reset today's progress parameters to absolute zero?")) {
        releaseWakeLockChannel();
        update(ref(db, `stats/${activeUser}`), { totalToday: 0, startTime: 0, status: 'break', maxSession: 0, lastBreakAt: "" });
    }
}

async function executeMidnightResetCycle(staleCloudData, verifiedNewCalendarDate) {
    const historicalPayload = {};
    const trackableMembers = Object.keys(staleCloudData).filter(key => key !== 'todayDate');

    trackableMembers.forEach(m => {
        let accumulatedSeconds = staleCloudData[m]?.totalToday || 0;
        if (staleCloudData[m]?.status === 'studying' && staleCloudData[m]?.startTime) {
            accumulatedSeconds += Math.floor((Date.now() - staleCloudData[m].startTime) / 1000);
        }
        historicalPayload[m] = convertSecondsToFormattedString(accumulatedSeconds);
    });

    const archiveSnapshot = await get(ref(db, 'history'));
    let trackingObject = archiveSnapshot.exists() ? archiveSnapshot.val() : {};
    trackingObject[staleCloudData.todayDate] = historicalPayload;

    const loggedKeys = Object.keys(trackingObject).sort((a, b) => new Date(b) - new Date(a));
    if (loggedKeys.length > 5) {
        const truncatedObject = {};
        loggedKeys.slice(0, 5).forEach(k => truncatedObject[k] = trackingObject[k]);
        trackingObject = truncatedObject;
    }

    const clearWorkspaceStats = { todayDate: verifiedNewCalendarDate };
    trackableMembers.forEach(m => {
        clearWorkspaceStats[m] = { status: 'break', totalToday: 0, startTime: 0, maxSession: 0, lastBreakAt: "" };
    });

    update(ref(db), { 'history': trackingObject, 'stats': clearWorkspaceStats });
}

// 9. HIGH-PERFORMANCE TIMER GRAPHICS RUNTIME INTERVAL
setInterval(() => {
    const registeredMembers = Object.keys(localState).filter(key => key !== 'todayDate');
    let globalPeakTimeValue = 0;
    let currentLeaderIdentity = "";

    registeredMembers.forEach(member => {
        const profile = localState[member];
        if (!profile) return;
        
        let runningTotalCumulativeSeconds = profile.totalToday || 0;
        if (profile.status === 'studying' && profile.startTime) {
            runningTotalCumulativeSeconds += Math.floor((Date.now() - profile.startTime) / 1000);
        }

        if (runningTotalCumulativeSeconds > globalPeakTimeValue) {
            globalPeakTimeValue = runningTotalCumulativeSeconds;
            currentLeaderIdentity = member;
        }

        const standardFormattedClockOutput = convertSecondsToFormattedString(runningTotalCumulativeSeconds);
        const timerNode = document.getElementById(`timer-${member}`);
        if (timerNode) timerNode.innerText = standardFormattedClockOutput;
        
        const contextualEmoji = evaluateMetricsEmoji(runningTotalCumulativeSeconds);
        const rewardBadgeElement = document.getElementById(`reward-${member}`);
        if (rewardBadgeElement && rewardBadgeElement.innerText !== contextualEmoji) {
            rewardBadgeElement.innerText = contextualEmoji;
            rewardBadgeElement.classList.add('pop-animation');
            setTimeout(() => rewardBadgeElement.classList.remove('pop-animation'), 400);
        }

        if (member === activeUser && document.pictureInPictureElement) {
            renderPiPCanvasFrame(standardFormattedClockOutput, contextualEmoji);
        }
    });

    registeredMembers.forEach(member => {
        const cardNode = document.getElementById(`card-${member}`);
        const leaderBadgeNode = document.getElementById(`leader-${member}`);
        if (!cardNode) return;

        if (member === currentLeaderIdentity && globalPeakTimeValue > 0) {
            cardNode.classList.add('is-leader');
            if (leaderBadgeNode) leaderBadgeNode.style.display = 'block';
        } else {
            cardNode.classList.remove('is-leader');
            if (leaderBadgeNode) leaderBadgeNode.style.display = 'none';
        }
    });
}, 1000);

// 10. ISOLATED TIME TRANSLATION UTILITIES
function evaluateMetricsEmoji(totalSecondsSeconds) {
    const calculatedHoursValue = totalSecondsSeconds / 3600;
    if (calculatedHoursValue >= 12) return "🌌";
    if (calculatedHoursValue >= 9) return "👑";
    if (calculatedHoursValue >= 7) return "🗿";
    if (calculatedHoursValue >= 5) return "🔥";
    if (calculatedHoursValue >= 3) return "🌿";
    if (calculatedHoursValue >= 1) return "🍃";
    return "🌱";
}

function convertSecondsToFormattedString(totalSecondsSeconds) {
    const hours = Math.floor(totalSecondsSeconds / 3600);
    const minutes = Math.floor((totalSecondsSeconds % 3600) / 60);
    const seconds = totalSecondsSeconds % 60;
    return `${String(hours).padStart(2, '0')}:${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}`;
}
