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

// UI Logic
function updateUI() {
    const isCelsius = unitToggle.checked;
    
    // Manage Pork constraints
    const options = finalDoneness.options;
    for (let i = 0; i < options.length; i++) {
        const val = parseInt(options[i].value);
        if (options[i].id === 'poultry-safe' || options[i].id === 'fish-safe') continue; // handled separately
        
        if (meatType.value === 'pork' && val < 145) {
            options[i].disabled = true;
            if (finalDoneness.value == options[i].value) {
                finalDoneness.value = "145"; // fallback to safe pork temp
            }
        } else {
            options[i].disabled = false;
        }
    }

    // Manage Poultry constraints
    if (meatType.value === 'poultry') {
        // Hide standard options, show and force select Safe option
        for (let i = 0; i < options.length; i++) {
            if (options[i].id !== 'poultry-safe') {
                options[i].style.display = 'none';
            }
        }
        poultrySafeOpt.style.display = '';
        fishSafeOpt.style.display = 'none';
        finalDoneness.value = "165";
    } else if (meatType.value === 'fish') {
        // Hide standard options, show and force select Fish safe option
        for (let i = 0; i < options.length; i++) {
            if (options[i].id !== 'fish-safe') {
                options[i].style.display = 'none';
            }
        }
        fishSafeOpt.style.display = '';
        poultrySafeOpt.style.display = 'none';
        finalDoneness.value = "140";
    } else {
        // Hide safe options, show standard options
        for (let i = 0; i < options.length; i++) {
            if (options[i].id !== 'poultry-safe' && options[i].id !== 'fish-safe') {
                options[i].style.display = '';
            }
        }
        poultrySafeOpt.style.display = 'none';
        fishSafeOpt.style.display = 'none';
        if (finalDoneness.value === "165" || finalDoneness.value === "140") {
            finalDoneness.value = "145"; // reset back to medium
        }
    }

    // Update labels based on unit
    const unitLabel = isCelsius ? '°C' : '°F';
    // Optionally update select text to show C instead of F if needed, but not strictly required
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
    
    let targetTempF = parseInt(finalDoneness.value);
    
    // Enforce logic rule minimums defensively
    if (isPoultry) targetTempF = 165;
    if (isFish) targetTempF = 140;
    if (isPork && targetTempF < 145) targetTempF = 145;

    let carryoverSubF = 0;
    let restTimeStr = "";
    
    if (isFish) {
        carryoverSubF = 3;
        restTimeStr = "a few minutes";
    } else {
        switch (cutSize.value) {
            case 'large':
                carryoverSubF = 10;
                restTimeStr = "15 mins for large roasts";
                break;
            case 'thick':
                carryoverSubF = 5;
                restTimeStr = "5 mins for steaks/chops";
                break;
            case 'thin':
                carryoverSubF = 2;
                restTimeStr = "5 mins for thin cuts";
                break;
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

    if (isGame) {
        restWarning.innerHTML = `<strong>Chef's Note:</strong> Game meat is extremely lean. It is highly recommended not to target above Medium-Rare (135°F) or it will dry out. Rest 5-10 minutes.`;
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
