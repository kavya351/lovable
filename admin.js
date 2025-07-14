// Check authentication
const currentUser = JSON.parse(localStorage.getItem('currentUser'));
if (!currentUser) {
    window.location.href = 'index.html';
}

// Set welcome message
document.getElementById('welcomeUser').textContent = `Welcome, ${currentUser.name}`;

let allBookings = [];
let filteredBookings = [];
let selectedBookingToDelete = null;

// Initialize admin page
document.addEventListener('DOMContentLoaded', function() {
    loadAllBookings();
    updateSummaryStats();
    renderBookingsTable();
    setupDateFilter();
});

// Load all bookings from localStorage
function loadAllBookings() {
    allBookings = [];
    
    // Get all booking data from localStorage
    for (let i = 0; i < localStorage.length; i++) {
        const key = localStorage.key(i);
        
        // Look for booking keys (format: bookedSeats_YYYY-MM-DD)
        if (key && key.startsWith('bookedSeats_')) {
            const date = key.replace('bookedSeats_', '');
            const dayBookings = JSON.parse(localStorage.getItem(key)) || {};
            
            // Convert day bookings to individual booking records
            Object.keys(dayBookings).forEach(seat => {
                const employeeName = dayBookings[seat];
                const employeeData = getEmployeeData(employeeName);
                
                allBookings.push({
                    date: date,
                    seat: seat,
                    employeeId: employeeData.id,
                    employeeName: employeeName,
                    department: getDepartmentForSeat(seat),
                    timestamp: new Date(`${date}T09:00:00`).toISOString() // Default booking time
                });
            });
        }
    }
    
    // Sort bookings by date (newest first)
    allBookings.sort((a, b) => new Date(b.date) - new Date(a.date));
    filteredBookings = [...allBookings];
}

// Get employee data by name
function getEmployeeData(name) {
    const employees = [
        { id: "Emp001", name: "Subash" },
        { id: "Emp002", name: "Raghav" },
        { id: "Emp003", name: "Gautham" },
        { id: "Emp004", name: "Daison" },
        { id: "Emp005", name: "Hari" },
        { id: "Emp006", name: "Rahul" },
        { id: "Emp007", name: "Arun Sandeep" },
        { id: "Emp008", name: "Sumithra" },
        { id: "Emp009", name: "Monalisa" },
        { id: "Emp010", name: "Mythili" },
        { id: "Emp011", name: "Debora" },
        { id: "Emp012", name: "Shamshath" },
        { id: "Emp013", name: "Shanthini" },
        { id: "Emp014", name: "Ramya" },
        { id: "Emp015", name: "Tejas" },
        { id: "Emp016", name: "Anand" },
        { id: "Emp017", name: "Harsha" },
        { id: "Emp018", name: "Ankan" },
        { id: "Emp019", name: "Kavya" },
        { id: "Emp020", name: "Nausheen" },
        { id: "Emp021", name: "Sneha" },
        { id: "Emp022", name: "Yukti" },
        { id: "Emp023", name: "Karthik" }
    ];
    
    const employee = employees.find(emp => emp.name === name);
    return employee || { id: 'Unknown', name: name };
}

// Get department for seat
function getDepartmentForSeat(seat) {
    const seatNumber = parseInt(seat.replace('Seat-', ''));
    
    if (seatNumber >= 23 && seatNumber <= 26) return 'DCC';
    if ((seatNumber >= 27 && seatNumber <= 29) || (seatNumber >= 38 && seatNumber <= 43)) return 'BREAD';
    if (seatNumber >= 30 && seatNumber <= 37) return 'Solutions';
    if (seatNumber >= 44 && seatNumber <= 47) return 'Cap360';
    return 'Unknown';
}

// Update summary statistics
function updateSummaryStats() {
    const today = new Date().toISOString().split('T')[0];
    const todayBookings = filteredBookings.filter(booking => booking.date === today);
    
    document.getElementById('totalBookings').textContent = filteredBookings.length;
    document.getElementById('todayBookings').textContent = todayBookings.length;
}

// Render bookings table
function renderBookingsTable() {
    const adminBookingsTable = document.getElementById('adminBookings');
    const noBookingsAdmin = document.getElementById('noBookingsAdmin');
    
    if (filteredBookings.length === 0) {
        adminBookingsTable.innerHTML = '';
        noBookingsAdmin.style.display = 'block';
        return;
    }
    
    noBookingsAdmin.style.display = 'none';
    adminBookingsTable.innerHTML = '';
    
    filteredBookings.forEach((booking, index) => {
        const row = document.createElement('tr');
        const isToday = booking.date === new Date().toISOString().split('T')[0];
        
        row.innerHTML = `
            <td>${formatDate(booking.date)}</td>
            <td><strong>${booking.seat}</strong></td>
            <td>${booking.employeeId}</td>
            <td>${booking.employeeName}</td>
            <td>
                <span class="dept-badge dept-${booking.department.toLowerCase()}">
                    ${booking.department}
                </span>
            </td>
            <td>${formatTime(booking.timestamp)}</td>
            <td>
                <button onclick="deleteBooking('${booking.date}', '${booking.seat}')" 
                        class="delete-btn" title="Delete Booking">
                    🗑️ Delete
                </button>
            </td>
        `;
        
        if (isToday) {
            row.style.background = 'rgba(16, 185, 129, 0.1)';
        }
        
        // Add animation delay
        row.style.opacity = '0';
        row.style.transform = 'translateY(20px)';
        
        setTimeout(() => {
            row.style.transition = 'all 0.3s ease';
            row.style.opacity = '1';
            row.style.transform = 'translateY(0)';
        }, index * 50);
        
        adminBookingsTable.appendChild(row);
    });
}

// Setup date filter
function setupDateFilter() {
    const dateFilter = document.getElementById('dateFilter');
    const today = new Date().toISOString().split('T')[0];
    dateFilter.value = today;
}

// Filter bookings by date
function filterBookings() {
    const selectedDate = document.getElementById('dateFilter').value;
    
    if (selectedDate) {
        filteredBookings = allBookings.filter(booking => booking.date === selectedDate);
    } else {
        filteredBookings = [...allBookings];
    }
    
    updateSummaryStats();
    renderBookingsTable();
}

// Delete booking
function deleteBooking(date, seat) {
    selectedBookingToDelete = { date, seat };
    
    const booking = filteredBookings.find(b => b.date === date && b.seat === seat);
    document.getElementById('deleteText').innerHTML = `
        Are you sure you want to delete this booking?
        <br><br>
        <strong>Date:</strong> ${formatDate(date)}<br>
        <strong>Seat:</strong> ${seat}<br>
        <strong>Employee:</strong> ${booking.employeeName}
    `;
    
    document.getElementById('deleteModal').classList.add('show');
}

// Confirm delete
function confirmDelete() {
    if (!selectedBookingToDelete) return;
    
    const { date, seat } = selectedBookingToDelete;
    
    // Remove from localStorage
    const dayBookings = JSON.parse(localStorage.getItem(`bookedSeats_${date}`)) || {};
    delete dayBookings[seat];
    
    if (Object.keys(dayBookings).length === 0) {
        localStorage.removeItem(`bookedSeats_${date}`);
    } else {
        localStorage.setItem(`bookedSeats_${date}`, JSON.stringify(dayBookings));
    }
    
    // Also remove from user's booking history
    removeFromUserHistory(date, seat);
    
    // Reload data
    loadAllBookings();
    updateSummaryStats();
    renderBookingsTable();
    
    // Close modal
    closeDeleteModal();
    
    // Show success message
    showSuccessMessage(`Booking deleted: ${seat} on ${formatDate(date)}`);
}

// Remove from user booking history
function removeFromUserHistory(date, seat) {
    const booking = allBookings.find(b => b.date === date && b.seat === seat);
    if (!booking) return;
    
    const userBookings = JSON.parse(localStorage.getItem(`userBookings_${booking.employeeId}`)) || [];
    const updatedBookings = userBookings.filter(b => !(b.date === date && b.seat === seat));
    
    if (updatedBookings.length === 0) {
        localStorage.removeItem(`userBookings_${booking.employeeId}`);
    } else {
        localStorage.setItem(`userBookings_${booking.employeeId}`, JSON.stringify(updatedBookings));
    }
}

// Show success message
function showSuccessMessage(message) {
    const successDiv = document.createElement('div');
    successDiv.innerHTML = `✅ ${message}`;
    successDiv.style.cssText = `
        position: fixed;
        top: 20px;
        right: 20px;
        background: linear-gradient(135deg, #10b981, #26a69a);
        color: white;
        padding: 1rem 2rem;
        border-radius: 12px;
        font-weight: 600;
        z-index: 3000;
        box-shadow: 0 10px 25px rgba(0, 0, 0, 0.2);
        animation: slideInRight 0.5s ease, fadeOut 0.5s ease 2.5s;
    `;
    
    // Add animation CSS
    const style = document.createElement('style');
    style.textContent = `
        @keyframes slideInRight {
            from { transform: translateX(100%); opacity: 0; }
            to { transform: translateX(0); opacity: 1; }
        }
        @keyframes fadeOut {
            from { opacity: 1; }
            to { opacity: 0; }
        }
    `;
    document.head.appendChild(style);
    
    document.body.appendChild(successDiv);
    
    setTimeout(() => {
        if (document.body.contains(successDiv)) {
            document.body.removeChild(successDiv);
        }
        if (document.head.contains(style)) {
            document.head.removeChild(style);
        }
    }, 3000);
}

// Format date for display
function formatDate(dateString) {
    const date = new Date(dateString);
    const today = new Date();
    const yesterday = new Date(today);
    yesterday.setDate(yesterday.getDate() - 1);
    
    if (dateString === today.toISOString().split('T')[0]) {
        return 'Today';
    } else if (dateString === yesterday.toISOString().split('T')[0]) {
        return 'Yesterday';
    } else {
        return date.toLocaleDateString('en-US', {
            weekday: 'short',
            month: 'short',
            day: 'numeric',
            year: 'numeric'
        });
    }
}

// Format time for display
function formatTime(timestamp) {
    return new Date(timestamp).toLocaleTimeString('en-US', {
        hour: '2-digit',
        minute: '2-digit'
    });
}

// Modal functions
function closeDeleteModal() {
    document.getElementById('deleteModal').classList.remove('show');
    selectedBookingToDelete = null;
}

// Navigation functions
function goToDashboard() {
    window.location.href = 'dashboard.html';
}

// Close modal when clicking outside
document.getElementById('deleteModal').addEventListener('click', function(e) {
    if (e.target === this) {
        closeDeleteModal();
    }
});

// Keyboard shortcuts
document.addEventListener('keydown', function(e) {
    if (e.key === 'Escape') {
        closeDeleteModal();
    }
});

// Add CSS for department badges and delete button
const style = document.createElement('style');
style.textContent = `
    .dept-badge {
        padding: 4px 8px;
        border-radius: 12px;
        font-size: 0.75rem;
        font-weight: 600;
        text-transform: uppercase;
        letter-spacing: 0.5px;
    }
    
    .dept-dcc { background: #81c784; color: white; }
    .dept-bread { background: #ff7043; color: white; }
    .dept-solutions { background: #29b6f6; color: white; }
    .dept-cap360 { background: #ffa726; color: #1e293b; }
    .dept-unknown { background: #64748b; color: white; }
    
    .delete-btn {
        background: #ef4444;
        color: white;
        border: none;
        padding: 6px 12px;
        border-radius: 6px;
        cursor: pointer;
        font-size: 0.8rem;
        font-weight: 500;
        transition: all 0.3s ease;
    }
    
    .delete-btn:hover {
        background: #dc2626;
        transform: translateY(-1px);
        box-shadow: 0 4px 12px rgba(239, 68, 68, 0.3);
    }
    
    .admin-table tr:hover {
        background: rgba(0, 112, 173, 0.05) !important;
        transition: background 0.3s ease;
    }
`;
document.head.appendChild(style);

// Auto-refresh every 30 seconds
setInterval(() => {
    loadAllBookings();
    updateSummaryStats();
    renderBookingsTable();
}, 30000);