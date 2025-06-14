// Remove all creation logic from this file. Only keep the grading system usage logic (upload, user selection, grading calculation).
// --- Grading System Usage Page Logic ---
let uploadedActivities = [];
let userGender = '';
let userAge = '';

// --- Popup fonctionnalités à venir ---
const featuresModal = document.getElementById('features-modal');
const closeFeaturesModal = document.getElementById('close-features-modal');
const featuresIcon = document.createElement('div');
featuresIcon.id = 'menu-fab';
featuresIcon.title = 'Menu';
featuresIcon.innerHTML = '<svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="#fff" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="3" y="6" width="18" height="2" rx="1" fill="#007bff"/><rect x="3" y="11" width="18" height="2" rx="1" fill="#007bff"/><rect x="3" y="16" width="18" height="2" rx="1" fill="#007bff"/></svg>';
document.body.appendChild(featuresIcon);

featuresIcon.onclick = function() {
    const menu = document.querySelector('.navbar-fixed-bottom');
    if (menu) {
        menu.style.display = (menu.style.display === 'none' || menu.style.display === '') ? 'flex' : 'none';
    }
};

closeFeaturesModal.onclick = function() {
    featuresModal.style.display = 'none';
};
window.onclick = function(event) {
    if (event.target === featuresModal) {
        featuresModal.style.display = 'none';
    }
};
// Ouvre la popup automatiquement au chargement
window.addEventListener('DOMContentLoaded', function() {
    featuresModal.style.display = 'block';
});

const uploadInput = document.getElementById('upload-json');
const userForm = document.getElementById('user-form');
const userGenderSelect = document.getElementById('user-gender');
const userAgeSelect = document.getElementById('user-age');
const userGradeSelect = document.getElementById('user-grade');
const startBtn = document.getElementById('start-btn');
const gradingSection = document.getElementById('grading-section');

uploadInput.onchange = function(e) {
    const file = e.target.files[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = function(evt) {
        try {
            uploadedActivities = JSON.parse(evt.target.result);
            // Populate gender and age options based on uploaded data
            const genders = new Set();
            const ages = new Set();
            uploadedActivities.forEach(act => {
                act.criteria.forEach(c => {
                    genders.add(c.gender);
                    ages.add(c.age);
                });
            });
            userGenderSelect.innerHTML = '<option value="">Sélectionner le sexe</option>' + Array.from(genders).map(g => `<option value="${g}">${g === 'Boy' ? 'Garçon' : 'Fille'}</option>`).join('');
            // On ne remplit pas userAgeSelect ici, il sera rempli selon le grade
            userAgeSelect.innerHTML = '<option value="">Sélectionner l\'âge</option>';
            userForm.style.display = '';
            gradingSection.innerHTML = '';
        } catch (err) {
            alert('Fichier JSON invalide.');
        }
    };
    reader.readAsText(file);
};

// Met à jour la liste des âges selon le grade sélectionné
userGradeSelect.onchange = function() {
    const grade = userGradeSelect.value;
    let ages = [];
    if (grade === '1') ages = [12, 13];
    else if (grade === '2') ages = [13, 14];
    else if (grade === '3') ages = [14, 15];
    else if (grade === '4') ages = [15, 16];
    else if (grade === '5') ages = [16, 17];
    userAgeSelect.innerHTML = '<option value="">Sélectionner l\'âge</option>' + ages.map(a => `<option value="${a}">${a}</option>`).join('');
};

startBtn.onclick = function(e) {
    e.preventDefault();
    const grade = userGradeSelect.value;
    userGender = userGenderSelect.value === 'Garçon' ? 'Boy' : (userGenderSelect.value === 'Fille' ? 'Girl' : userGenderSelect.value);
    userAge = parseInt(userAgeSelect.value, 10);
    if (!grade || !userGender || isNaN(userAge)) {
        alert('Veuillez sélectionner le niveau, le sexe et l\'âge.');
        return;
    }
    showGradingInputs();
};

function showGradingInputs() {
    let html = '';
    let totalPossible = 0;
    let foundAny = false;
    let selectedBlocks = {};
    let sliderValues = {};
    // Prepare a list of activities to show one by one
    let activityList = [];
    uploadedActivities.forEach((act, aidx) => {
        // Only hide "test léger-navette" for sec 1 and 2 (exact match, case-insensitive, trimmed)
        const actNameTrimmed = act.name.trim().toLowerCase();
        if (actNameTrimmed === 'test léger-navette' && (userGradeSelect.value === '1' || userGradeSelect.value === '2')) {
            return;
        }
        // Hide "Course d'endurence Sec 3, 4, 5" for grades not 3, 4, 5
        if (act.name === "Course d'endurence Sec 3, 4, 5" && !['3','4','5'].includes(userGradeSelect.value)) {
            return;
        }
        // Hide "Course navette (4x10m)" for grades not 1, 2, 3 (if that's the intent)
        if (act.name === "Course navette (4x10m)" && !['1','2','3'].includes(userGradeSelect.value)) {
            return;
        }
        let crit;
        // Only apply special age logic for test léger-navette
        if (actNameTrimmed === 'test léger-navette') {
            let overrideAge = userAge;
            if (userGradeSelect.value === '3') overrideAge = 15;
            if (userGradeSelect.value === '4' || userGradeSelect.value === '5') overrideAge = 17;
            crit = act.criteria.find(c => c.gender === userGender && c.age === overrideAge);
        } else {
            crit = act.criteria.find(c => c.gender === userGender && c.age === userAge);
        }
        if (!crit) return;
        foundAny = true;
        activityList.push({ act, aidx, crit });
        totalPossible += Math.max(...crit.scale.map(b => b.points));
    });
    if (!foundAny) {
        gradingSection.innerHTML = '<div style="color:red;margin-top:20px;">Aucune activité ne correspond à vos critères.</div>';
        return;
    }
    let currentIndex = 0;
    function renderCurrentActivity() {
        const { act, aidx, crit } = activityList[currentIndex];
        let activityHtml = '';
        activityHtml += `<form id="grading-form" style="width:100%;max-width:none;">`;
        activityHtml += `<div class="activity" style="width:100%;box-sizing:border-box;">`;
        activityHtml += `<strong>${act.name}</strong> <span style="color:#888;font-size:0.95em;">[${crit.criteria}]</span><br>Max : ${crit.maxScore}<br>`;
        activityHtml += '<div class="block-list">';
        crit.scale.forEach((block, bidx) => {
            let minDisplay = block.isTime ? msToTime(block.min) : block.min;
            let maxDisplay = block.isTime ? msToTime(block.max) : block.max;
            activityHtml += `<button type="button" class="block-btn" data-aidx="${aidx}" data-bidx="${bidx}" style="margin:4px;width:100%;">Score ${minDisplay} - ${maxDisplay} → ${block.points} pts</button>`;
        });
        activityHtml += `<span id="block-result-${aidx}" style="margin-left:10px;color:#007bff;"></span>`;
        activityHtml += `<div id="slider-container-${aidx}" style="margin-top:10px;display:none;"></div>`;
        activityHtml += '</div>';
        activityHtml += '</div>';
        activityHtml += '<div style="display:flex;justify-content:space-between;margin-top:20px;width:100%;">';
        if (currentIndex > 0) {
            activityHtml += '<button type="button" id="prev-btn">Précédent</button>';
        } else {
            activityHtml += '<span></span>';
        }
        if (currentIndex < activityList.length - 1) {
            activityHtml += '<button type="button" id="next-btn">Suivant</button>';
        } else {
            activityHtml += '<button type="submit">Calculer</button>';
        }
        activityHtml += '</div>';
        activityHtml += '<div id="grading-result" style="margin-top:20px;font-size:1.2em;"></div>';
        activityHtml += '</form>';
        gradingSection.innerHTML = activityHtml;
        // Block button logic
        document.querySelectorAll('.block-btn').forEach(btn => {
            btn.onclick = function() {
                const aidx = btn.getAttribute('data-aidx');
                const bidx = btn.getAttribute('data-bidx');
                document.querySelectorAll(`.block-btn[data-aidx='${aidx}']`).forEach(b => b.classList.remove('selected'));
                btn.classList.add('selected');
                selectedBlocks[aidx] = bidx;
                const block = crit.scale[bidx];
                document.getElementById(`block-result-${aidx}`).textContent = `Sélectionné : Score ${block.min}-${block.max} → ${block.points} pts`;
                // Show slider
                const sliderContainer = document.getElementById(`slider-container-${aidx}`);
                sliderContainer.style.display = 'block';
                if (block.isTime) {
                    // Time slider: ms, step 1, display mm:ss:xxx
                    sliderContainer.innerHTML = `<label for="slider-${aidx}">Score précis : <input type="text" id="slider-input-${aidx}" value="${msToTime(block.min)}" style="width:90px;" autocomplete="off" pattern="^\\d{1,2}:\\d{2}:\\d{3}$"></label><input type="range" id="slider-${aidx}" min="${block.min}" max="${block.max}" value="${block.min}" step="1" style="width:200px;margin-left:10px;">`;
                    const slider = document.getElementById(`slider-${aidx}`);
                    const input = document.getElementById(`slider-input-${aidx}`);
                    slider.oninput = function() {
                        input.value = msToTime(slider.valueAsNumber);
                    };
                    input.oninput = function() {
                        const timeRegex = /^\d{1,2}:\d{2}:\d{3}$/;
                        if (timeRegex.test(input.value)) {
                            slider.value = timeToMs(input.value);
                        }
                    };
                } else {
                    // Detect if this activity's scale uses decimals
                    let usesDecimals = crit.scale.some(b => {
                        return (b.min % 1 !== 0) || (b.max % 1 !== 0) || (b.points % 1 !== 0);
                    });
                    let sliderStep = usesDecimals ? 0.01 : 1;
                    let sliderFormat = usesDecimals ? (v => Number(v).toFixed(2)) : (v => parseInt(v, 10));
                    sliderContainer.innerHTML = `<label for="slider-${aidx}">Score précis : <input type="number" id="slider-input-${aidx}" min="${block.min}" max="${block.max}" value="${block.min}" step="${sliderStep}" style="width:70px;" autocomplete="off"></label><input type="range" id="slider-${aidx}" min="${block.min}" max="${block.max}" value="${block.min}" step="${sliderStep}" style="width:200px;margin-left:10px;">`;
                    const slider = document.getElementById(`slider-${aidx}`);
                    const input = document.getElementById(`slider-input-${aidx}`);
                    input.removeAttribute('readonly');
                    input.disabled = false;
                    slider.oninput = function() {
                        input.value = sliderFormat(slider.value);
                    };
                    input.oninput = function() {
                        slider.value = input.value;
                    };
                }
            };
        });
        // Navigation logic
        if (currentIndex > 0) {
            document.getElementById('prev-btn').onclick = function() {
                currentIndex--;
                renderCurrentActivity();
            };
        }
        if (currentIndex < activityList.length - 1) {
            document.getElementById('next-btn').onclick = function() {
                currentIndex++;
                renderCurrentActivity();
            };
        }
        document.getElementById('grading-form').onsubmit = function(e) {
            e.preventDefault();
            let total = 0;
            let results = {
                settings: {
                    grade: userGradeSelect.value,
                    gender: userGender,
                    age: userAge
                },
                activities: []
            };
            uploadedActivities.forEach((act, aidx) => {
                let crit;
                if (act.name === 'test léger-navette') {
                    let overrideAge = userAge;
                    if (userGradeSelect.value === '3') overrideAge = 15;
                    if (userGradeSelect.value === '4' || userGradeSelect.value === '5') overrideAge = 17;
                    crit = act.criteria.find(c => c.gender === userGender && c.age === overrideAge);
                } else {
                    crit = act.criteria.find(c => c.gender === userGender && c.age === userAge);
                }
                if (!crit) return;
                const bidx = selectedBlocks[aidx];
                if (bidx !== undefined) {
                    const block = crit.scale[bidx];
                    total += block.points;
                    let preciseScore;
                    const sliderInput = document.getElementById(`slider-input-${aidx}`);
                    if (sliderInput) {
                        if (block.isTime) {
                            // Only save if user changed from default
                            if (sliderInput.value && sliderInput.value !== msToTime(block.min)) {
                                preciseScore = sliderInput.value;
                            } else {
                                preciseScore = '';
                            }
                        } else {
                            // Only save if user changed from default
                            if (sliderInput.value !== '' && parseFloat(sliderInput.value) !== block.min) {
                                preciseScore = parseFloat(sliderInput.value);
                            } else {
                                preciseScore = '';
                            }
                        }
                    } else {
                        preciseScore = '';
                    }
                    results.activities.push({
                        name: act.name,
                        criteria: crit.criteria,
                        blockRange: { min: block.min, max: block.max },
                        blockPoints: block.points,
                        preciseScore: preciseScore
                    });
                }
            });
            let totalPossible = 0;
            results.activities.forEach(a => { totalPossible += 10; }); // Assume 10 per activity for compatibility
            let percent = totalPossible ? ((total / totalPossible) * 100).toFixed(2) : '0.00';
            results.total = total;
            results.totalPossible = totalPossible;
            results.percent = percent;
            results.code = (userGender === 'Boy' ? 'G' : (userGender === 'Girl' ? 'F' : 'X')) + userGradeSelect.value + userAge;
            localStorage.setItem('epv3_full_breakdown', JSON.stringify(results));
            window.location.href = 'result.html';
        };
    }
    renderCurrentActivity(); // This call is now correctly placed at the end of showGradingInputs, to render the initial activity.
}
// --- Chargement automatique du fichier JSON au démarrage ---
fetch('scr/fullversion.json')
    .then(r => r.json())
    .then(data => {
        uploadedActivities = data;
        // Remplir les options de sexe et d'âge comme lors d'un upload
        const genders = new Set();
        uploadedActivities.forEach(act => {
            act.criteria.forEach(c => {
                genders.add(c.gender);
            });
        });
        userGenderSelect.innerHTML = '<option value="">Sélectionner le sexe</option>' + Array.from(genders).map(g => `<option value="${g}">${g === 'Boy' ? 'Garçon' : 'Fille'}</option>`).join('');
        userAgeSelect.innerHTML = '<option value="">Sélectionner l\'âge</option>';
        userForm.style.display = '';
        gradingSection.innerHTML = '';
    })
    .catch(() => {
        // Optionnel : message d'erreur si le fichier n'est pas trouvé
    });
// Helper: ms to mm:ss:xxx
function msToTime(ms) {
    const min = Math.floor(ms / 60000);
    const sec = Math.floor((ms % 60000) / 1000);
    const mil = ms % 1000;
    return `${min.toString().padStart(2, '0')}:${sec.toString().padStart(2, '0')}:${mil.toString().padStart(3, '0')}`;
}
// Helper: mm:ss:xxx to ms
function timeToMs(str) {
    const [min, sec, ms] = str.split(':').map(Number);
    return min * 60000 + sec * 1000 + ms;
}
