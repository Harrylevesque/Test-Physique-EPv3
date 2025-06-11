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
    html += '<form id="grading-form">';
    uploadedActivities.forEach((act, aidx) => {
        // Hide test léger-navette for sec 1-2 (by both name variants)
        if ((act.name === 'test léger-navette' || act.name.toLowerCase().includes('navette')) && (userGradeSelect.value === '1' || userGradeSelect.value === '2')) {
            return;
        }
        // Special exception for test léger-navette (by both name variants)
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
        html += `<div class="activity"><strong>${act.name}</strong> <span style="color:#888;font-size:0.95em;">[${crit.criteria}]</span><br>Max : ${crit.maxScore}<br>`;
        html += '<div class="block-list">';
        crit.scale.forEach((block, bidx) => {
            html += `<button type="button" class="block-btn" data-aidx="${aidx}" data-bidx="${bidx}" style="margin:4px;">Score ${block.min} - ${block.max} → ${block.points} pts</button>`;
        });
        html += `<span id="block-result-${aidx}" style="margin-left:10px;color:#007bff;"></span>`;
        // Ajout du conteneur du slider (sera affiché dynamiquement)
        html += `<div id="slider-container-${aidx}" style="margin-top:10px;display:none;"></div>`;
        html += '</div></div>';
        totalPossible += Math.max(...crit.scale.map(b => b.points));
    });
    html += foundAny ? '<button type="submit">Calculer</button></form>' : '';
    html += foundAny ? '<div id="grading-result" style="margin-top:20px;font-size:1.2em;"></div>' : '<div style="color:red;margin-top:20px;">Aucune activité ne correspond à vos critères.</div>';
    gradingSection.innerHTML = html;
    if (foundAny) {
        document.querySelectorAll('.block-btn').forEach(btn => {
            btn.onclick = function() {
                const aidx = btn.getAttribute('data-aidx');
                const bidx = btn.getAttribute('data-bidx');
                // Deselect all for this activity
                document.querySelectorAll(`.block-btn[data-aidx='${aidx}']`).forEach(b => b.classList.remove('selected'));
                btn.classList.add('selected');
                selectedBlocks[aidx] = bidx;
                // Show selection
                const act = uploadedActivities[aidx];
                let crit;
                if (act.name === 'test léger-navette' || act.name.toLowerCase().includes('navette')) {
                    let overrideAge = userAge;
                    if (userGradeSelect.value === '3') overrideAge = 15;
                    if (userGradeSelect.value === '4' || userGradeSelect.value === '5') overrideAge = 17;
                    crit = act.criteria.find(c => c.gender === userGender && c.age === overrideAge);
                } else {
                    crit = act.criteria.find(c => c.gender === userGender && c.age === userAge);
                }
                const block = crit.scale[bidx];
                document.getElementById(`block-result-${aidx}`).textContent = `Sélectionné : Score ${block.min}-${block.max} → ${block.points} pts`;
                // Afficher le slider
                const sliderContainer = document.getElementById(`slider-container-${aidx}`);
                // Masquer tous les sliders des autres blocks de cette activité
                document.querySelectorAll(`[id^='slider-container-${aidx}']`).forEach(div => div.style.display = 'none');
                sliderContainer.style.display = 'block';
                sliderContainer.innerHTML = `<label for="slider-${aidx}">Score précis : <span id="slider-value-${aidx}">${block.min}</span></label><input type="range" id="slider-${aidx}" min="${block.min}" max="${block.max}" value="${block.min}" step="0.1" style="width:200px;margin-left:10px;">`;
                // Mettre à jour la valeur affichée lors du déplacement du slider
                const slider = document.getElementById(`slider-${aidx}`);
                const sliderValue = document.getElementById(`slider-value-${aidx}`);
                slider.oninput = function() {
                    sliderValue.textContent = slider.value;
                };
            };
        });
        document.getElementById('grading-form').onsubmit = function(e) {
            e.preventDefault();
            let total = 0;
            uploadedActivities.forEach((act, aidx) => {
                // Special exception for test léger-navette
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
            document.getElementById('grading-result').innerHTML = `<strong>Total : ${total} / ${totalPossible} pts (${percent}%)</strong>`;
        };
    }
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
