// Remove all creation logic from this file. Only keep the grading system usage logic (upload, user selection, grading calculation).
// --- Grading System Usage Page Logic ---
let uploadedActivities = [];
let userGender = '';
let userAge = '';

// --- Popup fonctionnalités à venir ---
const openFeaturesBtn = document.getElementById('open-features-btn');
const featuresModal = document.getElementById('features-modal');
const closeFeaturesModal = document.getElementById('close-features-modal');
const featuresIcon = document.createElement('div');
featuresIcon.id = 'features-fab';
featuresIcon.title = 'Fonctionnalités à venir';
featuresIcon.innerHTML = '<svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="#fff" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10" fill="#007bff"/><text x="12" y="17" text-anchor="middle" font-size="14" fill="#fff" font-family="Arial">★</text></svg>';
document.body.appendChild(featuresIcon);

openFeaturesBtn.onclick = function() {
    featuresModal.style.display = 'block';
};
closeFeaturesModal.onclick = function() {
    featuresModal.style.display = 'none';
};
window.onclick = function(event) {
    if (event.target === featuresModal) {
        featuresModal.style.display = 'none';
    }
};
featuresIcon.onclick = function() {
    featuresModal.style.display = 'block';
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
        if ((act.name === 'test léger-navette' || act.name.toLowerCase().includes('navette')) && (userGradeSelect.value === '1' || userGradeSelect.value === '2')) {
            return;
        }
        let crit;
        if (act.name === 'test léger-navette' || act.name.toLowerCase().includes('navette')) {
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
            activityHtml += `<button type="button" class="block-btn" data-aidx="${aidx}" data-bidx="${bidx}" style="margin:4px;width:100%;">Score ${block.min} - ${block.max} → ${block.points} pts</button>`;
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
                sliderContainer.innerHTML = `<label for="slider-${aidx}">Score précis : <input type="number" id="slider-input-${aidx}" min="${block.min}" max="${block.max}" value="${block.min}" step="0.1" style="width:70px;" autocomplete="off"></label><input type="range" id="slider-${aidx}" min="${block.min}" max="${block.max}" value="${block.min}" step="0.1" style="width:200px;margin-left:10px;">`;
                const slider = document.getElementById(`slider-${aidx}`);
                const input = document.getElementById(`slider-input-${aidx}`);
                input.removeAttribute('readonly');
                input.disabled = false;
                slider.oninput = function() {
                    input.value = slider.value;
                };
                input.oninput = function() {
                    slider.value = input.value;
                };
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
                }
            });
            let percent = totalPossible ? ((total / totalPossible) * 100).toFixed(2) : '0.00';
            // Add name input before download button
            document.getElementById('grading-result').innerHTML = `
                <strong>Total : ${total} / ${totalPossible} pts (${percent}%)</strong><br>
                <label for="user-name-input">Votre nom : </label>
                <input type="text" id="user-name-input" style="margin-right:10px;" placeholder="Entrez votre nom" required>
                <button type="button" id="download-result-btn" style="margin-top:15px;">Télécharger JSON</button>
            `;
            // Download JSON logic
            const downloadBtn = document.getElementById('download-result-btn');
            if (downloadBtn) {
                downloadBtn.onclick = function() {
                    const userName = document.getElementById('user-name-input').value.trim();
                    if (!userName) {
                        alert('Veuillez entrer votre nom avant de télécharger.');
                        return;
                    }
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
                            let preciseScore = null;
                            const sliderInput = document.getElementById(`slider-input-${aidx}`);
                            if (sliderInput) {
                                preciseScore = sliderInput.value;
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
                    const dataStr = JSON.stringify(results, null, 2);
                    const blob = new Blob([dataStr], { type: 'application/json' });
                    const url = URL.createObjectURL(blob);
                    // Build code: G/F + grade + age
                    const genderCode = userGender === 'Boy' ? 'G' : (userGender === 'Girl' ? 'F' : 'X');
                    const code = `${genderCode}${userGradeSelect.value}${userAge}`;
                    const filename = `${userName}_${code}.json`;
                    const a = document.createElement('a');
                    a.href = url;
                    a.download = filename;
                    document.body.appendChild(a);
                    a.click();
                    document.body.removeChild(a);
                    URL.revokeObjectURL(url);
                };
            }
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