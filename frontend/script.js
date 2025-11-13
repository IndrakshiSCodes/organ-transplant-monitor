// GraftWatch - Intelligent Organ Transplant Monitoring
console.log('🚀 GraftWatch Frontend Loading...');

// Sample patient data
const patientData = {
    patient001: {
        name: "John Smith",
        age: 45,
        organ: "Kidney",
        transplantDate: "2024-01-15",
        lastCheckup: "2025-11-01",
        measurements: [
            { date: "2025-10-25", cfdna: 120.5, ddcfdna: 4.2, outcome: "Stable" },
            { date: "2025-11-01", cfdna: 118.3, ddcfdna: 5.1, outcome: "Stable" },
            { date: "2025-11-04", cfdna: 125.7, ddcfdna: 4.8, outcome: "Stable" }
        ]
    },
    patient002: {
        name: "Maria Garcia", 
        age: 52,
        organ: "Heart", 
        transplantDate: "2024-02-20",
        lastCheckup: "2025-11-04",
        measurements: [
            { date: "2025-10-25", cfdna: 110.2, ddcfdna: 5.5, outcome: "Stable" },
            { date: "2025-11-01", cfdna: 135.8, ddcfdna: 12.3, outcome: "Mild Rejection" },
            { date: "2025-11-04", cfdna: 280.5, ddcfdna: 25.7, outcome: "Severe Rejection" }
        ]
    }
};

// Initialize when page loads
document.addEventListener('DOMContentLoaded', function() {
    console.log('✅ GraftWatch Initialized');
    initializeApp();
});

function initializeApp() {
    setupEventListeners();
    updateTime();
    loadPatientData('patient002'); // Start with Maria Garcia
    
    // Update time every minute
    setInterval(updateTime, 60000);
}

function setupEventListeners() {
    console.log('Setting up event listeners...');
    
    // Patient card clicks
    const patientCards = document.querySelectorAll('.patient-card');
    patientCards.forEach(card => {
        card.addEventListener('click', function() {
            const patientId = this.getAttribute('data-patient');
            console.log('Patient selected:', patientId);
            selectPatient(patientId);
        });
    });
    
    // Alert close button
    const alertClose = document.querySelector('.alert-close');
    if (alertClose) {
        alertClose.addEventListener('click', hideAlert);
    }
    
    // Refresh button
    const refreshBtn = document.querySelector('.refresh-btn');
    if (refreshBtn) {
        refreshBtn.addEventListener('click', refreshData);
    }
    
    // Navigation links
    const navLinks = document.querySelectorAll('.nav-link');
    navLinks.forEach(link => {
        link.addEventListener('click', function(e) {
            e.preventDefault();
            handleNavClick(this);
        });
    });
    
    console.log('Event listeners setup complete');
}

function selectPatient(patientId) {
    // Update active card
    document.querySelectorAll('.patient-card').forEach(card => {
        card.classList.remove('active');
    });
    document.querySelector(`[data-patient="${patientId}"]`).classList.add('active');
    
    // Load patient data
    loadPatientData(patientId);
}

function loadPatientData(patientId) {
    const patient = patientData[patientId];
    if (!patient) {
        console.error('Patient not found:', patientId);
        return;
    }
    
    updatePatientOverview(patient);
    updateMeasurementsTable(patient);
    updateAlertBanner(patient);
    updateTrendAnalysis(patient);
    updateActionItems(patient);
}

function updatePatientOverview(patient) {
    const overviewDiv = document.getElementById('patientOverview');
    const latest = patient.measurements[patient.measurements.length - 1];
    const status = getPatientStatus(latest.ddcfdna);

    overviewDiv.innerHTML = `
        <div class="overview-grid">
            <div class="overview-item">
                <span class="overview-label">Transplant Duration</span>
                <span class="overview-value">${calculateMonthsSinceTransplant(patient.transplantDate)} months</span>
            </div>
            <div class="overview-item">
                <span class="overview-label">Last Checkup</span>
                <span class="overview-value">${patient.lastCheckup}</span>
            </div>
            <div class="overview-item">
                <span class="overview-label">Current dd-cfDNA</span>
                <span class="overview-value">${latest.ddcfdna} ng/mL</span>
            </div>
            <div class="overview-item">
                <span class="overview-label">Monitoring Status</span>
                <span class="overview-value">${status.level}</span>
            </div>
        </div>
    `;
}

function updateMeasurementsTable(patient) {
    const tableDiv = document.getElementById('measurementsTable');
    
    let tableHTML = `
        <div class="measurement-row header">
            <div>Date</div>
            <div>Total cfDNA</div>
            <div>Donor cfDNA</div>
            <div>Trend</div>
        </div>
    `;
    
    patient.measurements.forEach((measurement, index) => {
        const trend = calculateTrend(patient.measurements, index);
        const trendClass = getTrendClass(trend);
        const trendText = getTrendText(trend);
        
        tableHTML += `
            <div class="measurement-row">
                <div>${measurement.date}</div>
                <div>${measurement.cfdna} ng/mL</div>
                <div>${measurement.ddcfdna} ng/mL</div>
                <div class="trend-badge ${trendClass}">${trendText}</div>
            </div>
        `;
    });
    
    tableDiv.innerHTML = tableHTML;
}

function updateAlertBanner(patient) {
    const alertBanner = document.getElementById('alertBanner');
    const alertTitle = document.getElementById('alertTitle');
    const alertMessage = document.getElementById('alertMessage');
    const latest = patient.measurements[patient.measurements.length - 1];
    const status = getPatientStatus(latest.ddcfdna);
    
    alertBanner.className = `alert-banner ${status.alertClass}`;
    alertTitle.textContent = status.title;
    alertMessage.textContent = status.message;
    alertBanner.classList.remove('hidden');
}

function updateTrendAnalysis(patient) {
    const trendDiv = document.getElementById('trendAnalysis');
    const riskLevel = document.getElementById('riskLevel');
    const measurements = patient.measurements;
    const latest = measurements[measurements.length - 1];
    const status = getPatientStatus(latest.ddcfdna);
    
    if (riskLevel) {
        riskLevel.textContent = status.riskLevel;
        riskLevel.className = `risk-indicator ${status.riskClass}`;
    }

    trendDiv.innerHTML = `
        <div class="overview-grid">
            <div class="overview-item">
                <span class="overview-label">Rejection Probability</span>
                <span class="overview-value">${calculateRejectionProbability(latest.ddcfdna)}%</span>
            </div>
            <div class="overview-item">
                <span class="overview-label">Trend Direction</span>
                <span class="overview-value">${getTrendDirection(measurements)}</span>
            </div>
            <div class="overview-item">
                <span class="overview-label">Next Review</span>
                <span class="overview-value">${getNextReviewDate(status.level)}</span>
            </div>
        </div>
    `;
}

function updateActionItems(patient) {
    const actionDiv = document.getElementById('actionItems');
    const latest = patient.measurements[patient.measurements.length - 1];
    const status = getPatientStatus(latest.ddcfdna);
    
    let actionsHTML = '';
    
    if (status.level === 'Critical') {
        actionsHTML = `
            <div class="action-item critical">
                <span>Schedule immediate biopsy procedure</span>
            </div>
            <div class="action-item critical">
                <span>Contact patient for emergency consultation</span>
            </div>
            <div class="action-item warning">
                <span>Adjust immunosuppressant dosage</span>
            </div>
        `;
    } else if (status.level === 'Warning') {
        actionsHTML = `
            <div class="action-item warning">
                <span>Increase monitoring to twice weekly</span>
            </div>
            <div class="action-item warning">
                <span>Schedule follow-up within 48 hours</span>
            </div>
            <div class="action-item info">
                <span>Review medication adherence</span>
            </div>
        `;
    } else {
        actionsHTML = `
            <div class="action-item info">
                <span>Continue routine monthly monitoring</span>
            </div>
            <div class="action-item info">
                <span>Schedule next routine checkup</span>
            </div>
        `;
    }
    
    actionDiv.innerHTML = actionsHTML;
}

// Helper functions
function getPatientStatus(ddcfdna) {
    if (ddcfdna > 15) {
        return {
            level: 'Critical',
            alertClass: 'critical',
            riskLevel: 'High',
            riskClass: 'high',
            title: 'CRITICAL ALERT',
            message: 'Elevated donor-derived DNA indicates high rejection probability. Immediate intervention required.'
        };
    } else if (ddcfdna > 8) {
        return {
            level: 'Warning',
            alertClass: 'warning', 
            riskLevel: 'Medium',
            riskClass: 'medium',
            title: 'WARNING',
            message: 'Moderate elevation in donor DNA levels. Close monitoring recommended.'
        };
    } else {
        return {
            level: 'Stable',
            alertClass: 'stable',
            riskLevel: 'Low', 
            riskClass: 'low',
            title: 'STABLE',
            message: 'Patient biomarkers within normal expected ranges.'
        };
    }
}

function calculateTrend(measurements, index) {
    if (index === 0) return 0;
    const current = measurements[index].ddcfdna;
    const previous = measurements[index - 1].ddcfdna;
    return ((current - previous) / previous) * 100;
}

function getTrendClass(trend) {
    if (trend > 10) return 'up';
    if (trend < -10) return 'down';
    return 'stable';
}

function getTrendText(trend) {
    if (trend > 10) return `+${trend.toFixed(1)}%`;
    if (trend < -10) return `${trend.toFixed(1)}%`;
    return 'Stable';
}

function calculateRejectionProbability(ddcfdna) {
    if (ddcfdna > 20) return '85-95';
    if (ddcfdna > 15) return '70-85';
    if (ddcfdna > 10) return '40-60';
    if (ddcfdna > 5) return '15-30';
    return '5-10';
}

function getTrendDirection(measurements) {
    if (measurements.length < 2) return 'Insufficient data';
    
    const latest = measurements[measurements.length - 1].ddcfdna;
    const previous = measurements[measurements.length - 2].ddcfdna;
    
    if (latest > previous * 1.5) return 'Rising rapidly';
    if (latest > previous * 1.1) return 'Gradual increase';
    if (latest < previous * 0.9) return 'Decreasing';
    return 'Stable';
}

function getNextReviewDate(level) {
    const today = new Date();
    if (level === 'Critical') {
        today.setDate(today.getDate() + 1);
    } else if (level === 'Warning') {
        today.setDate(today.getDate() + 3);
    } else {
        today.setDate(today.getDate() + 30);
    }
    return today.toISOString().split('T')[0];
}

function calculateMonthsSinceTransplant(transplantDate) {
    const transplant = new Date(transplantDate);
    const today = new Date();
    const months = (today.getFullYear() - transplant.getFullYear()) * 12 + 
                  (today.getMonth() - transplant.getMonth());
    return Math.max(1, months);
}

function hideAlert() {
    document.getElementById('alertBanner').classList.add('hidden');
}

function refreshData() {
    console.log('Refreshing data...');
    const currentPatient = document.querySelector('.patient-card.active').getAttribute('data-patient');
    loadPatientData(currentPatient);
    
    // Show refresh animation
    const refreshBtn = document.querySelector('.refresh-btn');
    refreshBtn.style.transform = 'rotate(360deg)';
    setTimeout(() => {
        refreshBtn.style.transform = 'rotate(0deg)';
    }, 500);
}

function handleNavClick(link) {
    document.querySelectorAll('.nav-link').forEach(navLink => {
        navLink.classList.remove('active');
    });
    link.classList.add('active');
    console.log('Navigation:', link.textContent.trim());
}

function updateTime() {
    const timeElement = document.getElementById('currentTime');
    if (timeElement) {
        const now = new Date();
        const timeString = now.toLocaleTimeString('en-US', { 
            hour: '2-digit', 
            minute: '2-digit',
            hour12: true 
        });
        const dateString = now.toLocaleDateString('en-US', {
            weekday: 'short',
            month: 'short',
            day: 'numeric'
        });
        timeElement.textContent = `${dateString} • ${timeString}`;
    }
}