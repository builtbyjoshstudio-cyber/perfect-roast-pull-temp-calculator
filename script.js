// Theme Management
const themeButtons = document.querySelectorAll('.theme-switch button');
const htmlEl = document.documentElement;

// Force initialize dark theme if no saved preference
const savedTheme = localStorage.getItem('tynkr-theme');
if (savedTheme) {
  setTheme(savedTheme);
} else {
  setTheme('dark');
}

themeButtons.forEach(btn => {
  btn.addEventListener('click', () => {
    setTheme(btn.getAttribute('data-set-theme'));
  });
});

function setTheme(themeName) {
  htmlEl.setAttribute('data-theme', themeName);
  localStorage.setItem('tynkr-theme', themeName);
  themeButtons.forEach(b => b.classList.remove('on'));
  const activeBtn = document.querySelector(`[data-set-theme="${themeName}"]`);
  if (activeBtn) activeBtn.classList.add('on');
}

// DOM Elements
const unitToggle = document.getElementById('unit-toggle');
const meatType = document.getElementById('meat-type');
const cutSize = document.getElementById('cut-size');
const finalDoneness = document.getElementById('final-doneness');
const calculateBtn = document.getElementById('calculate-btn');
const pullTempOutput = document.getElementById('pull-temp-output');
const targetTempOutput = document.getElementById('target-temp-output');
const restWarning = document.getElementById('rest-warning');
const copyBtn = document.getElementById('copy-btn');
const poultrySafeOpt = document.getElementById('poultry-safe');
const fishSafeOpt = document.getElementById('fish-safe');
const duckMrOpt = document.getElementById('duck-mr');
const duckMedOpt = document.getElementById('duck-med');
const bbqSafeOpt = document.getElementById('bbq-safe');
const cookingMethod = document.getElementById('cooking-method');
const brisketSafeOpt = document.getElementById('brisket-safe');
const duckBreastMrOpt = document.getElementById('duck-breast-mr');
const cutBrisket = document.getElementById('cut-brisket');
const cutDuckBreast = document.getElementById('cut-duck-breast');

// UI Logic
function updateUI() {
    const isCelsius = unitToggle.checked;
    const isBrisketOverride = (meatType.value === 'beef' && cutSize.value === 'brisket');
    const isDuckBreastOverride = (meatType.value === 'duck' && cutSize.value === 'duck_breast');

    // Manage special cuts visibility in cutSize dropdown
    if (meatType.value === 'beef') {
        cutBrisket.style.display = '';
        cutDuckBreast.style.display = 'none';
    } else if (meatType.value === 'duck') {
        cutBrisket.style.display = 'none';
        cutDuckBreast.style.display = '';
    } else {
        cutBrisket.style.display = 'none';
        cutDuckBreast.style.display = 'none';
        if (cutSize.value === 'brisket' || cutSize.value === 'duck_breast') {
            cutSize.value = 'large';
        }
    }

    const options = finalDoneness.options;
    
    if (isBrisketOverride) {
        for (let i = 0; i < options.length; i++) {
            if (options[i].id !== 'brisket-safe') {
                options[i].style.display = 'none';
            }
        }
        brisketSafeOpt.style.display = '';
        finalDoneness.value = "203";
    } else if (isDuckBreastOverride) {
        for (let i = 0; i < options.length; i++) {
            if (options[i].id !== 'duck-breast-mr') {
                options[i].style.display = 'none';
            }
        }
        duckBreastMrOpt.style.display = '';
        finalDoneness.value = "135";
    } else if (meatType.value === 'poultry') {
        for (let i = 0; i < options.length; i++) {
            if (options[i].id !== 'poultry-safe') {
                options[i].style.display = 'none';
            }
        }
        poultrySafeOpt.style.display = '';
        finalDoneness.value = "165";
    } else if (meatType.value === 'fish') {
        for (let i = 0; i < options.length; i++) {
            if (options[i].id !== 'fish-safe') {
                options[i].style.display = 'none';
            }
        }
        fishSafeOpt.style.display = '';
        finalDoneness.value = "140";
    } else if (meatType.value === 'duck') {
        for (let i = 0; i < options.length; i++) {
            if (options[i].id !== 'duck-mr' && options[i].id !== 'duck-med') {
                options[i].style.display = 'none';
            }
        }
        duckMrOpt.style.display = '';
        duckMedOpt.style.display = '';
        if (finalDoneness.value !== "130" && finalDoneness.value !== "140") {
            finalDoneness.value = "130";
        }
    } else if (meatType.value === 'bbq') {
        for (let i = 0; i < options.length; i++) {
            if (options[i].id !== 'bbq-safe') {
                options[i].style.display = 'none';
            }
        }
        bbqSafeOpt.style.display = '';
        finalDoneness.value = "200";
    } else {
        // Hide all special options, show standard options
        const specialIds = ['poultry-safe', 'fish-safe', 'duck-mr', 'duck-med', 'bbq-safe', 'brisket-safe', 'duck-breast-mr'];
        for (let i = 0; i < options.length; i++) {
            if (!specialIds.includes(options[i].id)) {
                options[i].style.display = '';
            } else {
                options[i].style.display = 'none';
            }
        }
        
        // Manage Pork constraints
        for (let i = 0; i < options.length; i++) {
            if (options[i].style.display !== 'none') {
                const val = parseInt(options[i].value);
                if (meatType.value === 'pork' && val < 145) {
                    options[i].disabled = true;
                    if (finalDoneness.value == options[i].value) {
                        finalDoneness.value = "145";
                    }
                } else {
                    options[i].disabled = false;
                }
            }
        }

        if (['165', '140', '130', '200', '203', '135'].includes(finalDoneness.value)) {
            finalDoneness.value = "145";
        }
    }
}

// Math Engine
function convertToCelsius(f) {
    return Math.round((f - 32) * 5 / 9);
}

function calculate() {
    const isCelsius = unitToggle.checked;
    const isPoultry = meatType.value === 'poultry';
    const isPork = meatType.value === 'pork';
    const isFish = meatType.value === 'fish';
    const isGame = meatType.value === 'game';
    const isDuck = meatType.value === 'duck';
    const isBbq = meatType.value === 'bbq';
    
    const isBrisketOverride = (meatType.value === 'beef' && cutSize.value === 'brisket');
    const isDuckBreastOverride = (meatType.value === 'duck' && cutSize.value === 'duck_breast');
    
    let targetTempF = parseInt(finalDoneness.value);
    
    // Enforce logic rule minimums defensively
    if (isPoultry) targetTempF = 165;
    if (isFish) targetTempF = 140;
    if (isBbq) targetTempF = 200;
    if (isPork && targetTempF < 145) targetTempF = 145;
    if (isBrisketOverride) targetTempF = 203;
    if (isDuckBreastOverride) targetTempF = 135; // Medium-Rare target

    let carryoverSubF = 0;
    let restTimeStr = "";
    const method = cookingMethod.value; // 'standard', 'high', 'low'
    
    if (isBrisketOverride) {
        carryoverSubF = 5; // Pull at 198°F (203 - 5 = 198)
    } else if (isDuckBreastOverride) {
        carryoverSubF = 5; // Pull at 130°F (135 - 5 = 130)
    } else if (isFish) {
        carryoverSubF = 3;
        restTimeStr = "a few minutes";
    } else if (isBbq) {
        carryoverSubF = targetTempF - 195; // Forces pull temp to 195
    } else {
        if (method === 'high') {
            switch (cutSize.value) {
                case 'large':
                    carryoverSubF = 15;
                    restTimeStr = "15-20 mins for large roasts (intense high-heat carryover)";
                    break;
                case 'thick':
                    carryoverSubF = 12;
                    restTimeStr = "10 mins for thick cuts (high-heat carryover)";
                    break;
                case 'thin':
                    carryoverSubF = 10;
                    restTimeStr = "5-8 mins for thin cuts (high-heat carryover)";
                    break;
            }
        } else if (method === 'low') {
            switch (cutSize.value) {
                case 'large':
                    carryoverSubF = 4;
                    restTimeStr = "10 mins for large roasts (minimal low-gradient carryover)";
                    break;
                case 'thick':
                    carryoverSubF = 3;
                    restTimeStr = "5 mins for thick cuts (minimal low-gradient carryover)";
                    break;
                case 'thin':
                    carryoverSubF = 2;
                    restTimeStr = "3-5 mins for thin cuts (minimal low-gradient carryover)";
                    break;
            }
        } else { // 'standard'
            switch (cutSize.value) {
                case 'large':
                    carryoverSubF = 7;
                    restTimeStr = "15 mins for large roasts";
                    break;
                case 'thick':
                    carryoverSubF = 6;
                    restTimeStr = "5 mins for steaks/chops";
                    break;
                case 'thin':
                    carryoverSubF = 5;
                    restTimeStr = "5 mins for thin cuts";
                    break;
            }
        }
    }

    const pullTempF = targetTempF - carryoverSubF;
    
    // Display
    if (isCelsius) {
        const pullTempC = convertToCelsius(pullTempF);
        const targetTempC = convertToCelsius(targetTempF);
        pullTempOutput.innerText = `${pullTempC}°C`;
        targetTempOutput.innerText = `${targetTempC}°C`;
    } else {
        pullTempOutput.innerText = `${pullTempF}°F`;
        targetTempOutput.innerText = `${targetTempF}°F`;
    }

    if (isBrisketOverride) {
        restWarning.innerHTML = `<strong>Brisket Override:</strong> Low & slow brisket requires breaking down tough collagen up to 203°F. Pull at 198°F and immediately store inside an insulated cooler for a minimum of 2 hours to rest.`;
    } else if (isDuckBreastOverride) {
        restWarning.innerHTML = `<strong>Chef's Note:</strong> For premium duck breast, bypass generic well-done poultry guidelines to preserve succulence. Pull at 130°F and rest for 8 minutes.`;
    } else if (isGame) {
        restWarning.innerHTML = `<strong>Chef's Note:</strong> Game meat is extremely lean. It is highly recommended not to target above Medium-Rare (135°F) or it will dry out. Rest 5-10 minutes.`;
    } else if (isBbq) {
        restWarning.innerHTML = `<strong>Chef's Note:</strong> Barbecue cuts are cooked for tenderness, not temperature. Pull when a probe slides in like warm butter (usually around 195°F-203°F). You MUST rest these large cuts in an insulated cooler for 1 to 2 hours before slicing.`;
    } else {
        restWarning.innerHTML = `<strong>Chef's Note:</strong> You must rest the meat uncovered for at least <strong>${restTimeStr}</strong> to achieve this final temperature. Cutting early halts the cooking process and ruins the calculation.`;
    }
}

// Event Listeners
unitToggle.addEventListener('change', () => {
    updateUI();
    if (pullTempOutput.innerText !== '--°F' && pullTempOutput.innerText !== '--°C') {
        calculate();
    }
});

meatType.addEventListener('change', () => {
    updateUI();
});

cutSize.addEventListener('change', () => {
    updateUI();
});

cookingMethod.addEventListener('change', () => {
    if (pullTempOutput.innerText !== '--°F' && pullTempOutput.innerText !== '--°C') {
        calculate();
    }
});

calculateBtn.addEventListener('click', calculate);

// Initial Setup
updateUI();

// Copy to Clipboard logic
copyBtn.addEventListener('click', () => {
    if (pullTempOutput.innerText === '--°F' || pullTempOutput.innerText === '--°C') return;
    
    const isCelsius = unitToggle.checked;
    const unit = isCelsius ? '°C' : '°F';
    const textToCopy = `Perfect Roast Pull Temp Calculation:\nMeat: ${meatType.options[meatType.selectedIndex].text}\nCut: ${cutSize.options[cutSize.selectedIndex].text}\nPull From Heat At: ${pullTempOutput.innerText}\nTarget Final Temp: ${targetTempOutput.innerText}\nNote: ${restWarning.innerText}`;
    
    navigator.clipboard.writeText(textToCopy).then(() => {
        const originalText = copyBtn.innerText;
        copyBtn.innerText = 'Copied!';
        setTimeout(() => {
            copyBtn.innerText = originalText;
        }, 2000);
    });
});
