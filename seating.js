// Check authentication
const currentUser = JSON.parse(localStorage.getItem('currentUser'));
if (!currentUser) {
    window.location.href = 'index.html';
}

// Set welcome message and current date
document.getElementById('welcomeUser').textContent = `Welcome, ${currentUser.name}`;
document.getElementById('currentDate').textContent = new Date().toLocaleDateString('en-US', {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric'
});

// Seat configuration (seats 23-47)
const seatConfig = {
    // Row 1: Seats 23-29 (7 seats)
    23: { department: 'dcc', row: 1 },
    24: { department: 'dcc', row: 1 },
    25: { department: 'dcc', row: 1 },
    26: { department: 'dcc', row: 1 },
    27: { department: 'bread', row: 1 },
    28: { department: 'bread', row: 1 },
    29: { department: 'bread', row: 1 },
    
    // Row 2: Seats 30-36 (7 seats)
    30: { department: 'solutions', row: 2 },
    31: { department: 'solutions', row: 2 },
    32: { department: 'solutions', row: 2 },
    33: { department: 'solutions', row: 2 },
    34: { department: 'solutions', row: 2 },
    35: { department: 'solutions', row: 2 },
    36: { department: 'solutions', row: 2 },
    
    // Row 3: Seats 37-43 (7 seats)
    37: { department: 'solutions', row: 3 },
    38: { department: 'bread', row: 3 },
    39: { department: 'bread', row: 3 },
    40: { department: 'bread', row: 3 },
    41: { department: 'bread', row: 3 },
    42: { department: 'bread', row: 3 },
    43: { department: 'bread', row: 3 },
    
    // Row 4: Seats 44-47 (4 seats, 3 empty spaces)
    44: { department: 'cap360', row: 4 },
    45: { department: 'cap360', row: 4 },
    46: { department: 'cap360', row: 4 },
    47: { department: 'cap360', row: 4 }
};

let selectedSeat = null;
let todayBookings = {};

// Initialize seating page
document.addEventListener('DOMContentLoaded', function() {
    loadTodayBookings();
    renderSeatGrid();
    checkExistingBooking();
});

// Load today's bookings
function loadTodayBookings() {
    const today = new Date().toISOString().split('T')[0];
    todayBookings = JSON.parse(localStorage.getItem(`bookedSeats_${today}`)) || {};
}

// Render seat grid
function renderSeatGrid() {
    const seatGrid = document.getElementById('seatGrid');
    seatGrid.innerHTML = '';
    
    // Create 4 rows with 7 seats each
    for (let row = 1; row <= 4; row++) {
        for (let col = 1; col <= 7; col++) {
            const seatNumber = getSeatNumberForPosition(row, col);
            const seatElement = createSeatElement(seatNumber);
            seatGrid.appendChild(seatElement);
        }
    }
}

// Get seat number for grid position
function getSeatNumberForPosition(row, col) {
    const seatNumber = 22 + ((row - 1) * 7) + col;
    return seatNumber <= 47 ? seatNumber : null;
}

// Create seat element
function createSeatElement(seatNumber) {
    const seatDiv = document.createElement('div');
    
    if (!seatNumber || !seatConfig[seatNumber]) {
        // Empty space for layout
        seatDiv.className = 'empty-space';
        return seatDiv;
    }
    
    const config = seatConfig[seatNumber];
    const isBooked = todayBookings[`Seat-${seatNumber}`];
    const isCurrentUserBooking = isBooked === currentUser.name;
    
    seatDiv.className = `seat ${config.department}`;
    seatDiv.dataset.seatNumber = seatNumber;
    
    if (isBooked) {
        seatDiv.classList.add('booked');
        seatDiv.innerHTML = `
            <div class="seat-number">Seat-${seatNumber}</div>
            <div class="seat-employee">${isBooked}</div>
        `;
    } else {
        seatDiv.innerHTML = `
            <div class="seat-number">Seat-${seatNumber}</div>
            <div class="seat-status">Available</div>
        `;
        
        // Add click handler for available seats
        seatDiv.addEventListener('click', () => selectSeat(seatNumber));
    }
    
    // Add hover tooltips
    seatDiv.addEventListener('mouseenter', (e) => showTooltip(e, seatNumber, isBooked));
    seatDiv.addEventListener('mouseleave', hideTooltip);
    
    return seatDiv;
}

// Show tooltip
function showTooltip(e, seatNumber, bookedBy) {
    const tooltip = document.getElementById('tooltip');
    const config = seatConfig[seatNumber];
    const departmentName = getDepartmentName(config.department);
    
    let tooltipText = `Seat-${seatNumber} - ${departmentName}`;
    
    if (bookedBy) {
        tooltipText += `\nBooked by: ${bookedBy}`;
        tooltipText += `\nDate: ${new Date().toLocaleDateString()}`;
    } else {
        tooltipText += '\nClick to book this seat';
    }
    
    tooltip.textContent = tooltipText;
    tooltip.style.whiteSpace = 'pre-line';
    tooltip.classList.add('show');
    
    // Position tooltip
    const rect = e.target.getBoundingClientRect();
    tooltip.style.left = rect.left + (rect.width / 2) - (tooltip.offsetWidth / 2) + 'px';
    tooltip.style.top = rect.top - tooltip.offsetHeight - 10 + 'px';
}

// Hide tooltip
function hideTooltip() {
    const tooltip = document.getElementById('tooltip');
    tooltip.classList.remove('show');
}

// Get department full name
function getDepartmentName(dept) {
    const names = {
        'dcc': 'DCC',
        'bread': 'BREAD',
        'solutions': 'Solutions',
        'cap360': 'Cap360'
    };
    return names[dept] || dept;
}

// Select seat for booking
function selectSeat(seatNumber) {
    // Check if user already has a booking today
    const userBooking = Object.keys(todayBookings).find(seat => 
        todayBookings[seat] === currentUser.name
    );
    
    if (userBooking) {
        alert(`You already have a booking today: ${userBooking}`);
        return;
    }
    
    selectedSeat = seatNumber;
    const config = seatConfig[seatNumber];
    const departmentName = getDepartmentName(config.department);
    
    // Update confirmation modal
    document.getElementById('confirmText').innerHTML = `
        Do you want to book <strong>Seat-${seatNumber}</strong> in the <strong>${departmentName}</strong> department?
        <br><br>
        <small>Date: ${new Date().toLocaleDateString()}</small>
    `;
    
    // Show confirmation modal
    document.getElementById('confirmModal').classList.add('show');
}

// Confirm booking
function confirmBooking() {
    if (!selectedSeat) return;
    
    const today = new Date().toISOString().split('T')[0];
    const seatKey = `Seat-${selectedSeat}`;
    
    // Update today's bookings
    todayBookings[seatKey] = currentUser.name;
    
    // Save to localStorage with booking metadata
    localStorage.setItem(`bookedSeats_${today}`, JSON.stringify(todayBookings));
    
    // Save booking history for the user
    saveUserBookingHistory(selectedSeat);
    
    // Close modal
    closeModal();
    
    // Update UI
    renderSeatGrid();
    updateBookingInfo(`Successfully booked ${seatKey}!`);
    
    // Show success animation
    showSuccessAnimation();
}

// Save user booking history
function saveUserBookingHistory(seatNumber) {
    const userBookings = JSON.parse(localStorage.getItem(`userBookings_${currentUser.id}`)) || [];
    
    const booking = {
        date: new Date().toISOString().split('T')[0],
        seat: `Seat-${seatNumber}`,
        department: getDepartmentName(seatConfig[seatNumber].department),
        timestamp: new Date().toISOString(),
        status: 'active'
    };
    
    userBookings.push(booking);
    localStorage.setItem(`userBookings_${currentUser.id}`, JSON.stringify(userBookings));
}

// Show success animation
function showSuccessAnimation() {
    const successDiv = document.createElement('div');
    successDiv.innerHTML = '🎉 Booking Confirmed! 🎉';
    successDiv.style.cssText = `
        position: fixed;
        top: 50%;
        left: 50%;
        transform: translate(-50%, -50%);
        background: linear-gradient(135deg, #10b981, #26a69a);
        color: white;
        padding: 2rem;
        border-radius: 16px;
        font-size: 1.5rem;
        font-weight: 700;
        text-align: center;
        z-index: 3000;
        box-shadow: 0 20px 40px rgba(0, 0, 0, 0.3);
        animation: successPop 2s ease;
    `;
    
    // Add success animation CSS
    const style = document.createElement('style');
    style.textContent = `
        @keyframes successPop {
            0% { transform: translate(-50%, -50%) scale(0); opacity: 0; }
            20% { transform: translate(-50%, -50%) scale(1.2); opacity: 1; }
            30% { transform: translate(-50%, -50%) scale(1); }
            90% { transform: translate(-50%, -50%) scale(1); opacity: 1; }
            100% { transform: translate(-50%, -50%) scale(0); opacity: 0; }
        }
    `;
    document.head.appendChild(style);
    
    document.body.appendChild(successDiv);
    
    setTimeout(() => {
        document.body.removeChild(successDiv);
        document.head.removeChild(style);
    }, 2000);
}

// Update booking info
function updateBookingInfo(message) {
    const bookingInfo = document.getElementById('bookingInfo');
    bookingInfo.innerHTML = `<p style="color: #10b981; font-weight: 600;">${message}</p>`;
    
    setTimeout(() => {
        bookingInfo.innerHTML = '<p>Click on an available seat to book it for today</p>';
    }, 3000);
}

// Check existing booking
function checkExistingBooking() {
    const userBooking = Object.keys(todayBookings).find(seat => 
        todayBookings[seat] === currentUser.name
    );
    
    if (userBooking) {
        updateBookingInfo(`You have already booked ${userBooking} for today`);
    }
}

// Modal functions
function closeModal() {
    document.getElementById('confirmModal').classList.remove('show');
    selectedSeat = null;
}

// Navigation functions
function goToDashboard() {
    window.location.href = 'dashboard.html';
}

// Close modal when clicking outside
document.getElementById('confirmModal').addEventListener('click', function(e) {
    if (e.target === this) {
        closeModal();
    }
});

// Keyboard shortcuts
document.addEventListener('keydown', function(e) {
    switch(e.key) {
        case 'Escape':
            closeModal();
            break;
        case 'Enter':
            if (document.getElementById('confirmModal').classList.contains('show')) {
                confirmBooking();
            }
            break;
    }
});

// Auto-refresh bookings every 10 seconds
setInterval(() => {
    loadTodayBookings();
    renderSeatGrid();
}, 10000);