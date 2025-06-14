// Data structure to hold activities
let activities = [];

// Helper to render all activities
function renderActivities() {
    const list = document.getElementById('activities-list');
    list.innerHTML = '';
    activities.forEach((activity, idx) => {
        const div = document.createElement('div');
        div.className = 'activity';
        div.innerHTML = `
            <div class="activity-header">
                <strong>${activity.editing ? `<input type='text' id='edit-activity-name-${idx}' value='${activity.name}' style='width:180px;'>` : activity.name}</strong>
                <button class="remove-btn" onclick="removeActivity(${idx})">Supprimer</button>
                <button onclick="toggleEditActivity(${idx})" style="margin-left:8px;">${activity.editing ? 'Enregistrer' : 'Renommer'}</button>
            </div>
            <button onclick="toggleCriteriaForm(${idx})" style="margin:10px 0;">${activity.showCriteriaForm ? 'Cacher' : 'Ajouter/Modifier Critères'}</button>
            <div id="criteria-form-${idx}" style="display:${activity.showCriteriaForm ? 'block' : 'none'};margin-bottom:10px;">
                <form onsubmit="addCriteria(event,${idx})" style="display:flex;gap:6px;flex-wrap:wrap;align-items:center;">
                    <select name="gender" required>
                        <option value="">Sexe</option>
                        <option value="Boy">Garçon</option>
                        <option value="Girl">Fille</option>
                    </select>
                    <input type="text" name="age" min="1" max="120" placeholder="Âge" required style="width:70px;">
                    <input type="text" name="criteria" placeholder="Critère (ex: Pushups)" required style="width:120px;">
                    <button type="submit">Ajouter Critère</button>
                </form>
            </div>
            <div class="event-list">
                ${activity.criteria.map((crit, cidx) => `
                    <div class="event">
                        <strong>${crit.editing ? `<input type='text' id='edit-criteria-${idx}-${cidx}' value='${crit.criteria}' style='width:120px;'>` : crit.criteria} (${crit.gender === 'Boy' ? 'Garçon' : 'Fille'}, Âge ${crit.age})</strong> <span style="color:#888;font-size:0.95em;">[Max: ${crit.maxScore}]</span>
                        <button class="remove-btn" onclick="removeCriteria(${idx},${cidx})">Supprimer</button>
                        <button onclick="toggleEditCriteria(${idx},${cidx})" style="margin-left:8px;">${crit.editing ? 'Enregistrer' : 'Renommer'}</button>
                        <button onclick="toggleScaleForm(${idx},${cidx})" style="margin-left:8px;">${crit.showScaleForm ? 'Cacher' : 'Ajouter/Modifier Blocs'}</button>
                        <div id="scale-form-${idx}-${cidx}" style="display:${crit.showScaleForm ? 'block' : 'none'};margin-top:6px;">
                            <form onsubmit="addScaleBlock(event,${idx},${cidx})" style="display:flex;gap:6px;align-items:center;flex-wrap:wrap;">
                                ${crit.criteria.trim().toLowerCase() === 'time' ? `
                                    <span>Min:</span>
                                    <input type="number" name="min_min" min="0" max="59" placeholder="mm" required style="width:45px;">
                                    <input type="number" name="min_sec" min="0" max="59" placeholder="ss" required style="width:45px;">
                                    <input type="number" name="min_ms" min="0" max="999" placeholder="xxx" required style="width:55px;">
                                    <span>Max:</span>
                                    <input type="number" name="max_min" min="0" max="59" placeholder="mm" required style="width:45px;">
                                    <input type="number" name="max_sec" min="0" max="59" placeholder="ss" required style="width:45px;">
                                    <input type="number" name="max_ms" min="0" max="999" placeholder="xxx" required style="width:55px;">
                                ` : `
                                    <input type="text" name="min" placeholder="Score min" required style="width:70px;">
                                    <input type="text" name="max" placeholder="Score max" required style="width:70px;">
                                `}
                                <input type="text" name="points" placeholder="Points pour ce bloc" required style="width:110px;">
                                <button type="submit">Ajouter Bloc</button>
                            </form>
                        </div>
                        <div class="block-list">
                            ${crit.scale.map((block, bidx) => `
                                <div class="block">
                                    ${block.editing ? `${crit.criteria.trim().toLowerCase() === 'time' ? `Temps <input type='number' id='edit-block-min-min-${idx}-${cidx}-${bidx}' value='${Math.floor(block.min/60000)}' style='width:35px;'>:<input type='number' id='edit-block-min-sec-${idx}-${cidx}-${bidx}' value='${Math.floor((block.min%60000)/1000)}' style='width:35px;'>:<input type='number' id='edit-block-min-ms-${idx}-${cidx}-${bidx}' value='${block.min%1000}' style='width:45px;'> - <input type='number' id='edit-block-max-min-${idx}-${cidx}-${bidx}' value='${Math.floor(block.max/60000)}' style='width:35px;'>:<input type='number' id='edit-block-max-sec-${idx}-${cidx}-${bidx}' value='${Math.floor((block.max%60000)/1000)}' style='width:35px;'>:<input type='number' id='edit-block-max-ms-${idx}-${cidx}-${bidx}' value='${block.max%1000}' style='width:45px;'>` : `Score <input type='text' id='edit-block-min-${idx}-${cidx}-${bidx}' value='${block.min}' style='width:40px;'> - <input type='text' id='edit-block-max-${idx}-${cidx}-${bidx}' value='${block.max}' style='width:40px;'>`} → <input type='text' id='edit-block-points-${idx}-${cidx}-${bidx}' value='${block.points}' style='width:40px;'> pts <button onclick='saveEditBlock(${idx},${cidx},${bidx})'>Enregistrer</button>` : `${crit.criteria.trim().toLowerCase() === 'time' ? `Temps ${msToTime(block.min)} - ${msToTime(block.max)}` : `Score ${block.min} - ${block.max}`} → ${block.points} pts`} <button class="remove-btn" onclick="removeScaleBlock(${idx},${cidx},${bidx})">Supprimer</button> <button onclick="toggleEditBlock(${idx},${cidx},${bidx})">${block.editing ? 'Annuler' : 'Modifier'}</button>
                                </div>
                            `).join('')}
                        </div>
                    </div>
                `).join('')}
            </div>
        `;
        list.appendChild(div);
    });
}

// Add activity
const activityForm = document.getElementById('activity-form');
activityForm.onsubmit = function(e) {
    e.preventDefault();
    const name = document.getElementById('activity-name').value.trim();
    if (name) {
        activities.push({ name, criteria: [], showCriteriaForm: false });
        activityForm.reset();
        renderActivities();
    }
};

// Remove activity
function removeActivity(idx) {
    activities.splice(idx, 1);
    renderActivities();
}

// Toggle criteria form visibility
function toggleCriteriaForm(idx) {
    activities[idx].showCriteriaForm = !activities[idx].showCriteriaForm;
    renderActivities();
}

// Add criteria (gender/age/criteria name)
function addCriteria(e, aidx) {
    e.preventDefault();
    const gender = e.target.gender.value;
    const age = parseFloat(e.target.age.value.replace(',', '.'));
    const criteria = e.target.criteria.value.trim();
    let maxScore = prompt('Enter the maximum score for this criteria:', '100');
    if (maxScore) maxScore = parseFloat(maxScore.replace(',', '.'));
    if (gender && !isNaN(age) && criteria && !isNaN(maxScore)) {
        activities[aidx].criteria.push({ gender, age, criteria, maxScore, scale: [], showScaleForm: false });
        renderActivities();
    }
}

// Remove criteria
function removeCriteria(aidx, cidx) {
    activities[aidx].criteria.splice(cidx, 1);
    renderActivities();
}

// Toggle scale form visibility
function toggleScaleForm(aidx, cidx) {
    activities[aidx].criteria[cidx].showScaleForm = !activities[aidx].criteria[cidx].showScaleForm;
    renderActivities();
}

// Add grading scale block
function addScaleBlock(e, aidx, cidx) {
    e.preventDefault();
    const crit = activities[aidx].criteria[cidx];
    const isTime = crit.criteria.trim().toLowerCase() === 'time';
    let min, max, points;
    if (isTime) {
        // Compose mm:ss:xxx from separate fields
        const min_min = e.target.min_min.value.trim();
        const min_sec = e.target.min_sec.value.trim();
        const min_ms = e.target.min_ms.value.trim();
        const max_min = e.target.max_min.value.trim();
        const max_sec = e.target.max_sec.value.trim();
        const max_ms = e.target.max_ms.value.trim();
        // Validate all fields are present and numbers
        if ([min_min, min_sec, min_ms, max_min, max_sec, max_ms].some(v => v === '' || isNaN(v))) {
            alert('Veuillez remplir tous les champs de temps (mm:ss:xxx)');
            return;
        }
        const minStr = `${min_min}:${min_sec.padStart(2, '0')}:${min_ms.padStart(3, '0')}`;
        const maxStr = `${max_min}:${max_sec.padStart(2, '0')}:${max_ms.padStart(3, '0')}`;
        const timeRegex = /^\d{1,2}:\d{2}:\d{3}$/;
        if (!timeRegex.test(minStr) || !timeRegex.test(maxStr)) {
            alert('Format du temps invalide. Utilisez mm:ss:xxx (minutes:secondes:millisecondes)');
            return;
        }
        min = timeToMs(minStr);
        max = timeToMs(maxStr);
        points = parseFloat(e.target.points.value.replace(',', '.'));
    } else {
        min = parseFloat(e.target.min.value.replace(',', '.'));
        max = parseFloat(e.target.max.value.replace(',', '.'));
        points = parseFloat(e.target.points.value.replace(',', '.'));
    }
    if (!isNaN(min) && !isNaN(max) && !isNaN(points)) {
        activities[aidx].criteria[cidx].scale.push({ min, max, points, isTime });
        renderActivities();
    }
}

// Remove grading scale block
function removeScaleBlock(aidx, cidx, bidx) {
    activities[aidx].criteria[cidx].scale.splice(bidx, 1);
    renderActivities();
}

// Download data as JSON file
const downloadBtn = document.getElementById('download-btn');
downloadBtn.onclick = function() {
    const dataStr = JSON.stringify(activities, null, 2);
    const blob = new Blob([dataStr], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'grading-system-data.json';
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
};

// Handle upload for editing
const uploadInput = document.getElementById('upload-json');
uploadInput.onchange = function(e) {
    const file = e.target.files[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = function(evt) {
        try {
            activities = JSON.parse(evt.target.result);
            renderActivities();
        } catch (err) {
            alert('Fichier JSON invalide.');
        }
    };
    reader.readAsText(file);
};
//test
// Initial render
renderActivities();

function toggleEditActivity(idx) {
    const activity = activities[idx];
    if (activity.editing) {
        const input = document.getElementById(`edit-activity-name-${idx}`);
        if (input && input.value.trim()) activity.name = input.value.trim();
    }
    activity.editing = !activity.editing;
    renderActivities();
}

function toggleEditCriteria(aidx, cidx) {
    const crit = activities[aidx].criteria[cidx];
    if (crit.editing) {
        const input = document.getElementById(`edit-criteria-${aidx}-${cidx}`);
        if (input && input.value.trim()) crit.criteria = input.value.trim();
    }
    crit.editing = !crit.editing;
    renderActivities();
}

function toggleEditBlock(aidx, cidx, bidx) {
    const block = activities[aidx].criteria[cidx].scale[bidx];
    block.editing = !block.editing;
    renderActivities();
}
function saveEditBlock(aidx, cidx, bidx) {
    const block = activities[aidx].criteria[cidx].scale[bidx];
    const crit = activities[aidx].criteria[cidx];
    const isTime = crit.criteria.trim().toLowerCase() === 'time';
    let min, max, points;
    if (isTime) {
        // Get values and pad as needed
        let minMin = document.getElementById(`edit-block-min-min-${aidx}-${cidx}-${bidx}`).value.trim();
        let minSec = document.getElementById(`edit-block-min-sec-${aidx}-${cidx}-${bidx}`).value.trim();
        let minMs = document.getElementById(`edit-block-min-ms-${aidx}-${cidx}-${bidx}`).value.trim();
        let maxMin = document.getElementById(`edit-block-max-min-${aidx}-${cidx}-${bidx}`).value.trim();
        let maxSec = document.getElementById(`edit-block-max-sec-${aidx}-${cidx}-${bidx}`).value.trim();
        let maxMs = document.getElementById(`edit-block-max-ms-${aidx}-${cidx}-${bidx}`).value.trim();
        // Pad values
        minSec = minSec.padStart(2, '0');
        minMs = minMs.padStart(3, '0');
        maxSec = maxSec.padStart(2, '0');
        maxMs = maxMs.padStart(3, '0');
        const minStr = `${minMin}:${minSec}:${minMs}`;
        const maxStr = `${maxMin}:${maxSec}:${maxMs}`;
        const timeRegex = /^\d{1,2}:\d{2}:\d{3}$/;
        if (!timeRegex.test(minStr) || !timeRegex.test(maxStr)) {
            alert('Format du temps invalide. Utilisez mm:ss:xxx (minutes:secondes:millisecondes)');
            return;
        }
        min = timeToMs(minStr);
        max = timeToMs(maxStr);
        points = parseFloat(document.getElementById(`edit-block-points-${aidx}-${cidx}-${bidx}`).value.replace(',', '.'));
    } else {
        min = parseFloat(document.getElementById(`edit-block-min-${aidx}-${cidx}-${bidx}`).value);
        max = parseFloat(document.getElementById(`edit-block-max-${aidx}-${cidx}-${bidx}`).value);
        points = parseFloat(document.getElementById(`edit-block-points-${aidx}-${cidx}-${bidx}`).value);
    }
    if (!isNaN(min) && !isNaN(max) && !isNaN(points)) {
        block.min = min;
        block.max = max;
        block.points = points;
    }
    block.editing = false;
    renderActivities();
}

// Helper: mm:ss:xxx to ms
function timeToMs(str) {
    const [min, sec, ms] = str.split(':').map(Number);
    return min * 60000 + sec * 1000 + ms;
}

// Helper: ms to mm:ss:xxx
function msToTime(ms) {
    const min = Math.floor(ms / 60000);
    const sec = Math.floor((ms % 60000) / 1000);
    const mil = ms % 1000;
    return `${min.toString().padStart(2, '0')}:${sec.toString().padStart(2, '0')}:${mil.toString().padStart(3, '0')}`;
}
