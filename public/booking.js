// booking.js
import { initializeApp } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-app.js";
import { 
    getFirestore, 
    collection, 
    addDoc, 
    doc, 
    getDoc, 
    getDocs, 
    query 
} from "https://www.gstatic.com/firebasejs/10.7.1/firebase-firestore.js";
import { 
    getAuth, 
    onAuthStateChanged,
    signOut 
} from "https://www.gstatic.com/firebasejs/10.7.1/firebase-auth.js";

const firebaseConfig = {
    apiKey: "AIzaSyDAu9wfWgBwfPUB3-qFECrQxckNDwCdkKA",
    authDomain: "gegel-glit-glam.firebaseapp.com",
    projectId: "gegel-glit-glam",
    storageBucket: "gegel-glit-glam.firebasestorage.app",
    messagingSenderId: "105374344569",
    appId: "1:105374344569:web:0ce7b1c9d5f2050eed7ba8"
};

const app = initializeApp(firebaseConfig);
const db = getFirestore(app);
const auth = getAuth(app);

// Mobile Menu Toggle
const mobileMenuBtn = document.querySelector(".mobile-menu-btn");
const navLinks = document.querySelector(".nav-links");

if (mobileMenuBtn) {
    mobileMenuBtn.addEventListener("click", () => {
        navLinks.classList.toggle("active");
        mobileMenuBtn.innerHTML = navLinks.classList.contains("active")
            ? '<i class="fas fa-times"></i>'
            : '<i class="fas fa-bars"></i>';
    });
}

// Header Scroll Effect
window.addEventListener("scroll", () => {
    const header = document.getElementById("header");
    if (window.scrollY > 100) {
        header.classList.add("header-scrolled");
    } else {
        header.classList.remove("header-scrolled");
    }
});

// Set minimum date to today
const dateInput = document.getElementById("date");
if (dateInput) {
    const today = new Date().toISOString().split("T")[0];
    dateInput.min = today;
    
    // Check for booked slots when date changes
    dateInput.addEventListener("change", async () => {
        await checkBookedSlots(dateInput.value);
    });
}

// Function to check and disable already booked time slots
async function checkBookedSlots(selectedDate) {
    if (!selectedDate) return;
    
    try {
        console.log('Checking booked slots for date:', selectedDate);
        
        // Get all bookings for the selected date
        const bookingsSnapshot = await getDocs(collection(db, 'bookings'));
        const bookedTimes = new Set();
        
        bookingsSnapshot.forEach(doc => {
            const booking = doc.data();
            const bookingDate = booking.booking_date;
            
            // Convert booking date to string for comparison
            let bookingDateStr = '';
            if (typeof bookingDate === 'string') {
                bookingDateStr = bookingDate;
            } else if (bookingDate && bookingDate.toDate) {
                bookingDateStr = bookingDate.toDate().toISOString().split('T')[0];
            }
            
            // If booking is on the selected date and status is pending or confirmed
            const status = (booking.status || '').toLowerCase();
            if (bookingDateStr === selectedDate && (status === 'pending' || status === 'confirmed')) {
                bookedTimes.add(booking.booking_time);
                console.log('Booked slot found:', booking.booking_time, 'Status:', status);
            }
        });
        
        console.log(`Total booked slots for ${selectedDate}:`, Array.from(bookedTimes));
        
        // Update time slots UI
        const allTimeSlots = document.querySelectorAll('.time-slot');
        allTimeSlots.forEach(slot => {
            const slotTime = slot.getAttribute('data-time');
            
            // Remove old event listeners and classes
            slot.classList.remove('selected');
            
            if (bookedTimes.has(slotTime)) {
                // Mark as unavailable
                slot.classList.add('unavailable');
                slot.style.cursor = 'not-allowed';
                slot.style.opacity = '0.5';
                slot.style.backgroundColor = '#f8d7da';
                slot.title = 'This time slot is already booked';
            } else {
                // Mark as available
                slot.classList.remove('unavailable');
                slot.style.cursor = 'pointer';
                slot.style.opacity = '1';
                slot.style.backgroundColor = '';
                slot.title = 'Click to select this time';
            }
        });
        
        // Re-attach click events to all time slots
        attachTimeSlotEvents();
        
    } catch (error) {
        console.error('Error checking booked slots:', error);
    }
}

// Function to attach click events to time slots
function attachTimeSlotEvents() {
    const allTimeSlots = document.querySelectorAll('.time-slot');
    
    allTimeSlots.forEach(slot => {
        // Remove any existing listeners by cloning
        const newSlot = slot.cloneNode(true);
        slot.parentNode.replaceChild(newSlot, slot);
        
        // Add new event listener
        newSlot.addEventListener('click', function() {
            if (!this.classList.contains('unavailable')) {
                // Remove selected class from all time slots
                document.querySelectorAll('.time-slot').forEach(s => s.classList.remove('selected'));
                
                // Add selected class to clicked slot
                this.classList.add('selected');
                
                // Update hidden input value
                selectedTimeInput.value = this.getAttribute('data-time');
                
                // Update booking summary
                updateBookingSummary();
            }
        });
    });
}

// Time Slot Selection - Initial setup
const selectedTimeInput = document.getElementById("selectedTime");

// Attach initial event listeners
attachTimeSlotEvents();

// Load selected services from localStorage
let selectedServices = JSON.parse(localStorage.getItem("regelCart")) || [];
const selectedServicesList = document.getElementById("selectedServicesList");
const selectedServicesContainer = document.getElementById("selectedServicesContainer");

// Function to display selected services
function displaySelectedServices() {
    if (!selectedServicesList) return;

    selectedServicesList.innerHTML = '';

    if (selectedServices.length === 0) {
        selectedServicesList.innerHTML = '<div class="no-services">No services selected. <a href="/services">Browse services</a></div>';
        if (selectedServicesContainer) {
            selectedServicesContainer.style.display = 'none';
        }
    } else {
        if (selectedServicesContainer) {
            selectedServicesContainer.style.display = 'block';
        }
        
        selectedServices.forEach((service, index) => {
            const serviceItem = document.createElement("div");
            serviceItem.className = "selected-service-item";
            serviceItem.innerHTML = `
                <div>
                    <div class="selected-service-name">${service.service}</div>
                    <div class="selected-service-duration">${service.duration}</div>
                </div>
                <div style="display: flex; align-items: center;">
                    <span class="selected-service-price">$${service.price}</span>
                    <button class="remove-service" data-index="${index}">
                        <i class="fas fa-times"></i>
                    </button>
                </div>
            `;
            selectedServicesList.appendChild(serviceItem);
        });

        // Add event listeners to remove buttons
        document.querySelectorAll(".remove-service").forEach(button => {
            button.addEventListener("click", function() {
                const index = parseInt(this.getAttribute("data-index"));
                removeService(index);
            });
        });
    }

    updateBookingSummary();
}

// Function to remove a service
function removeService(index) {
    selectedServices.splice(index, 1);
    localStorage.setItem("regelCart", JSON.stringify(selectedServices));
    displaySelectedServices();
}

// Function to calculate total duration
function calculateTotalDuration() {
    let totalMinutes = 0;
    
    selectedServices.forEach(service => {
        const duration = service.duration;
        if (duration.includes('min')) {
            const minutes = parseInt(duration);
            if (!isNaN(minutes)) {
                totalMinutes += minutes;
            }
        } else if (duration.includes('-')) {
            // Handle ranges like "60-90 min"
            const range = duration.split('-');
            const maxMinutes = parseInt(range[1]);
            if (!isNaN(maxMinutes)) {
                totalMinutes += maxMinutes;
            }
        }
    });
    
    if (totalMinutes < 60) {
        return `${totalMinutes} min`;
    } else {
        const hours = Math.floor(totalMinutes / 60);
        const minutes = totalMinutes % 60;
        return minutes > 0 ? `${hours}h ${minutes}min` : `${hours}h`;
    }
}

// Update Booking Summary
function updateBookingSummary() {
    const dateValue = dateInput ? dateInput.value : '';
    const timeElement = document.querySelector(".time-slot.selected");

    // Update services summary
    if (selectedServices.length > 0) {
        const serviceNames = selectedServices.map(s => s.service).join(', ');
        const summaryServices = document.getElementById("summary-services");
        if (summaryServices) summaryServices.textContent = serviceNames;
        
        const totalPrice = selectedServices.reduce((sum, item) => sum + parseFloat(item.price), 0);
        const summaryTotal = document.getElementById("summary-total");
        if (summaryTotal) summaryTotal.textContent = `$${totalPrice.toFixed(2)}`;
        
        const totalDuration = calculateTotalDuration();
        const summaryDuration = document.getElementById("summary-duration");
        if (summaryDuration) summaryDuration.textContent = totalDuration;
    } else {
        const summaryServices = document.getElementById("summary-services");
        if (summaryServices) summaryServices.textContent = "-";
        const summaryTotal = document.getElementById("summary-total");
        if (summaryTotal) summaryTotal.textContent = "-";
        const summaryDuration = document.getElementById("summary-duration");
        if (summaryDuration) summaryDuration.textContent = "-";
    }

    if (dateValue) {
        const formattedDate = new Date(dateValue).toLocaleDateString("en-US", {
            weekday: "long",
            year: "numeric",
            month: "long",
            day: "numeric",
        });
        const summaryDate = document.getElementById("summary-date");
        if (summaryDate) summaryDate.textContent = formattedDate;
    }

    if (timeElement) {
        const summaryTime = document.getElementById("summary-time");
        if (summaryTime) summaryTime.textContent = timeElement.textContent;
    }
}

// Update summary when date changes
if (dateInput) {
    dateInput.addEventListener("change", updateBookingSummary);
}

// Form Submission
const bookingForm = document.getElementById("bookingForm");
const confirmationModal = document.getElementById("confirmationModal");

if (bookingForm) {
    bookingForm.addEventListener("submit", async (e) => {
        e.preventDefault();

        // Check if user is logged in
        const user = auth.currentUser;
        const isAdmin = sessionStorage.getItem('adminUser') === 'true';
        
        if (!user && !isAdmin) {
            // Show custom modal with login/signup options
            showAuthModal();
            return;
        }

        // Validate form
        if (selectedServices.length === 0) {
            alert("Please select at least one service from the services page");
            return;
        }

        if (!selectedTimeInput || !selectedTimeInput.value) {
            alert("Please select a time slot");
            return;
        }

        try {
            // Get form values
            const firstName = document.getElementById('firstName').value;
            const lastName = document.getElementById('lastName').value;
            const email = document.getElementById('email').value;
            const phone = document.getElementById('phone').value;
            const dateValue = dateInput.value;
            const timeValue = selectedTimeInput.value;
            const specialRequests = document.getElementById('specialRequests').value;

            // **DOUBLE-BOOKING CHECK** - Verify slot is still available
            console.log('Checking for double-booking before submission...');
            const bookingsSnapshot = await getDocs(collection(db, 'bookings'));
            let isSlotAvailable = true;
            
            bookingsSnapshot.forEach(doc => {
                const booking = doc.data();
                let bookingDateStr = '';
                
                if (typeof booking.booking_date === 'string') {
                    bookingDateStr = booking.booking_date;
                } else if (booking.booking_date && booking.booking_date.toDate) {
                    bookingDateStr = booking.booking_date.toDate().toISOString().split('T')[0];
                }
                
                const status = (booking.status || '').toLowerCase();
                if (bookingDateStr === dateValue && 
                    booking.booking_time === timeValue && 
                    (status === 'pending' || status === 'confirmed')) {
                    isSlotAvailable = false;
                    console.log('Slot already booked:', booking);
                }
            });
            
            if (!isSlotAvailable) {
                alert('Sorry, this time slot has just been booked by another customer. Please select a different time.');
                await checkBookedSlots(dateValue); // Refresh available slots
                return;
            }

            // Format date for display
            const formattedDate = new Date(dateValue).toLocaleDateString("en-US", {
                weekday: "long",
                year: "numeric",
                month: "long",
                day: "numeric",
            });

            // Format time for display
            const timeElement = document.querySelector(".time-slot.selected");
            const displayTime = timeElement ? timeElement.textContent : timeValue;

            // Calculate total price
            const totalPrice = selectedServices.reduce((sum, item) => sum + parseFloat(item.price), 0);
            const serviceNames = selectedServices.map(s => s.service).join(', ');

            // Create booking data for Firestore
            const bookingData = {
                customer_info: {
                    first_name: firstName,
                    last_name: lastName,
                    email: email,
                    phone: phone
                },
                // Add top-level fields for easier querying
                email: email,
                phone: phone,
                full_name: `${firstName} ${lastName}`,
                services: selectedServices.map(service => ({
                    id: service.id || service.service.toLowerCase().replace(/\s+/g, '-'),
                    name: service.service,
                    price: parseFloat(service.price),
                    duration: service.duration
                })),
                booking_date: dateValue,
                booking_time: timeValue,
                special_requests: specialRequests,
                status: 'pending',
                total_price: totalPrice,
                created_at: new Date(),
                updated_at: new Date(),
                // Add user ID if logged in via Firebase
                user_id: user ? user.uid : null,
                // Add admin flag if booking is made by admin
                is_admin_booking: isAdmin
            };

            // Save booking to Firestore
            console.log('Attempting to save booking:', bookingData);
            const docRef = await addDoc(collection(db, 'bookings'), bookingData);
            console.log('Booking saved successfully with ID:', docRef.id);
            
            // Send email receipt to customer using mailto
            try {
                sendBookingReceipt({
                    bookingId: docRef.id,
                    customerName: `${firstName} ${lastName}`,
                    customerEmail: email,
                    services: serviceNames,
                    date: formattedDate,
                    time: displayTime,
                    total: totalPrice,
                    phone: phone
                });
            } catch (emailError) {
                console.error('Error sending email:', emailError);
                // Don't fail the booking if email fails
            }

            // Update confirmation modal with booking details
            try {
                document.getElementById('confirm-booking-id').textContent = docRef.id;
                document.getElementById('confirm-services').textContent = serviceNames;
                document.getElementById('confirm-date').textContent = formattedDate;
                document.getElementById('confirm-time').textContent = displayTime;
                document.getElementById('confirm-total').textContent = `$${totalPrice.toFixed(2)}`;

                // Show confirmation modal
                confirmationModal.style.display = "flex";
            } catch (modalError) {
                console.error('Error showing modal:', modalError);
                // Show alert instead if modal fails
                alert(`Booking confirmed! Your booking ID is: ${docRef.id}`);
            }

            // Clear localStorage and reset form
            try {
                localStorage.removeItem("regelCart");
                selectedServices = [];
                displaySelectedServices();
                bookingForm.reset();
                
                // Clear selected time slots
                const allTimeSlots = document.querySelectorAll('.time-slot');
                if (allTimeSlots.length > 0) {
                    allTimeSlots.forEach((slot) => slot.classList.remove("selected"));
                }
                
                if (selectedTimeInput) {
                    selectedTimeInput.value = '';
                }
                
                updateBookingSummary();
            } catch (cleanupError) {
                console.error('Error during cleanup:', cleanupError);
                // Don't show error to user for cleanup issues
            }

        } catch (error) {
            console.error('Error creating booking:', error);
            console.error('Error message:', error.message);
            console.error('Error code:', error.code);
            console.error('Error stack:', error.stack);
            
            // Only show error alert if booking actually failed (not if it's a cleanup/UI error after successful save)
            // Check if error is from cleanup phase or actual booking failure
            const isCleanupError = error.message && (
                error.message.includes('timeSlots') || 
                error.message.includes('modal') ||
                error.message.includes('docRef')
            );
            
            if (!isCleanupError) {
                alert('There was an error submitting your booking. Please try again. Error: ' + error.message);
            }
        }
    });
}

// Close Modal
const closeModalBtn = document.getElementById("closeModal");
if (closeModalBtn) {
    closeModalBtn.addEventListener("click", () => {
        if (confirmationModal) {
            confirmationModal.style.display = "none";
        }
    });
}

// Close modal when clicking outside
window.addEventListener("click", (e) => {
    if (confirmationModal && e.target === confirmationModal) {
        confirmationModal.style.display = "none";
    }
});

// User Authentication Management
function updateNavigationForUser(isLoggedIn, isAdmin = false) {
    const userMenu = document.getElementById('user-menu');
    const authButtons = document.getElementById('auth-buttons');
    const userName = document.getElementById('user-name');
    const adminLink = document.getElementById('admin-link');
    
    if (isLoggedIn) {
        // User is signed in
        if (authButtons) authButtons.style.display = 'none';
        if (userMenu) userMenu.style.display = 'block';
        
        // Set user name from auth or session
        const user = auth.currentUser;
        if (userName) {
            if (user) {
                userName.textContent = user.displayName || user.email.split('@')[0];
            } else {
                // Admin user from session storage
                const adminEmail = sessionStorage.getItem('userEmail');
                userName.textContent = adminEmail ? adminEmail.split('@')[0] : 'Admin';
            }
        }
        
        // Show admin link if user is admin
        if (isAdmin && adminLink) {
            adminLink.style.display = 'block';
        }
    } else {
        // User is signed out
        if (authButtons) authButtons.style.display = 'flex';
        if (userMenu) userMenu.style.display = 'none';
        if (adminLink) adminLink.style.display = 'none';
    }
    
    // Add logout event listener
    const logoutBtn = document.getElementById('logout-btn');
    if (logoutBtn && !logoutBtn.hasAttribute('data-listener')) {
        logoutBtn.setAttribute('data-listener', 'true');
        logoutBtn.addEventListener('click', handleLogout);
    }
}

// Handle logout
async function handleLogout() {
    try {
        // Check if user is logged in via Firebase
        const user = auth.currentUser;
        if (user) {
            await signOut(auth);
        }
        
        // Clear admin session
        sessionStorage.removeItem('adminUser');
        sessionStorage.removeItem('userEmail');
        
        // Redirect to home page
        window.location.href = '/';
    } catch (error) {
        console.error('Error during logout:', error);
        // Still redirect even if there's an error
        window.location.href = '/';
    }
}

// Check user authentication status and update UI accordingly
function updateBookingUI(isLoggedIn) {
    const loginRequiredMessage = document.getElementById('loginRequiredMessage');
    const bookingContainer = document.getElementById('bookingContainer');
    
    if (loginRequiredMessage && bookingContainer) {
        if (isLoggedIn) {
            // User is logged in - show booking form
            loginRequiredMessage.style.display = 'none';
            bookingContainer.style.display = 'grid';
        } else {
            // User is not logged in - show login required message
            loginRequiredMessage.style.display = 'block';
            bookingContainer.style.display = 'none';
        }
    }
}

// Check user authentication status
async function checkAuthStatus() {
    // Check Firebase authentication
    onAuthStateChanged(auth, async (user) => {
        if (user) {
            // User is signed in via Firebase
            let isAdmin = false;
            
            // Check if user is admin from Firestore
            try {
                const userDoc = await getDoc(doc(db, 'users', user.uid));
                if (userDoc.exists() && userDoc.data().role === 'admin') {
                    isAdmin = true;
                }
            } catch (error) {
                console.error('Error checking admin status:', error);
            }
            
            updateNavigationForUser(true, isAdmin);
            updateBookingUI(true);
            
            // Pre-fill form with user data if available
            if (user.email) {
                const emailInput = document.getElementById('email');
                if (emailInput) emailInput.value = user.email;
            }
        } else {
            // Check if user is admin (using sessionStorage)
            const isAdmin = sessionStorage.getItem('adminUser') === 'true';
            if (isAdmin) {
                updateNavigationForUser(true, true);
                updateBookingUI(true);
                
                // Pre-fill form with admin email if available
                const adminEmail = sessionStorage.getItem('userEmail');
                if (adminEmail) {
                    const emailInput = document.getElementById('email');
                    if (emailInput) emailInput.value = adminEmail;
                }
            } else {
                updateNavigationForUser(false, false);
                updateBookingUI(false);
            }
        }
    });
}

// Smooth Scrolling for Anchor Links
document.querySelectorAll('a[href^="#"]').forEach((anchor) => {
    anchor.addEventListener("click", function (e) {
        e.preventDefault();

        const targetId = this.getAttribute("href");
        if (targetId === "#") return;

        const targetElement = document.querySelector(targetId);
        if (targetElement) {
            window.scrollTo({
                top: targetElement.offsetTop - 80,
                behavior: "smooth",
            });

            // Close mobile menu if open
            if (navLinks && navLinks.classList.contains("active")) {
                navLinks.classList.remove("active");
                if (mobileMenuBtn) {
                    mobileMenuBtn.innerHTML = '<i class="fas fa-bars"></i>';
                }
            }
        }
    });
});

// Show authentication modal
function showAuthModal() {
    // Create modal HTML
    const modalHTML = `
        <div id="authModal" style="display: fixed; position: fixed; z-index: 10000; left: 0; top: 0; width: 100%; height: 100%; background-color: rgba(0, 0, 0, 0.5); display: flex; justify-content: center; align-items: center;">
            <div style="background-color: white; padding: 40px; border-radius: 10px; box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1); max-width: 400px; width: 90%; text-align: center;">
                <h2 style="font-family: 'Playfair Display', serif; margin-bottom: 20px; color: #1a1a1a;">Book Your Appointment</h2>
                <p style="color: #6c757d; margin-bottom: 30px; font-size: 16px;">You need to sign in or create an account to book an appointment.</p>
                <div style="display: flex; gap: 15px; flex-direction: column;">
                    <a href="/login" style="background-color: #d4af37; color: white; padding: 12px 24px; border-radius: 5px; text-decoration: none; font-weight: 600; border: none; cursor: pointer; font-size: 16px; transition: background-color 0.3s;">
                        Sign In
                    </a>
                    <a href="/register" style="background-color: #FFB6C1; color: white; padding: 12px 24px; border-radius: 5px; text-decoration: none; font-weight: 600; border: none; cursor: pointer; font-size: 16px; transition: background-color 0.3s;">
                        Create Account
                    </a>
                    <button onclick="closeAuthModal()" style="background-color: #f0f0f0; color: #1a1a1a; padding: 12px 24px; border-radius: 5px; border: none; cursor: pointer; font-size: 16px; transition: background-color 0.3s;">
                        Cancel
                    </button>
                </div>
            </div>
        </div>
    `;
    
    // Remove existing modal if any
    const existingModal = document.getElementById('authModal');
    if (existingModal) {
        existingModal.remove();
    }
    
    // Add modal to page
    document.body.insertAdjacentHTML('beforeend', modalHTML);
}

// Close authentication modal
function closeAuthModal() {
    const modal = document.getElementById('authModal');
    if (modal) {
        modal.remove();
    }
}

// Send booking receipt via mailto link
function sendBookingReceipt(bookingDetails) {
    const subject = `Booking Confirmation - Regel Glit Glam - ${bookingDetails.bookingId}`;
    
    const body = `Dear ${bookingDetails.customerName},

Thank you for choosing Regel Glit Glam! Your booking has been confirmed.

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
BOOKING DETAILS
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

Booking ID: ${bookingDetails.bookingId}
Services: ${bookingDetails.services}
Date: ${bookingDetails.date}
Time: ${bookingDetails.time}
Total: GHS ${bookingDetails.total.toFixed(2)}

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
IMPORTANT INFORMATION
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

• Please arrive 10 minutes before your appointment
• Bring this confirmation email or booking ID
• Contact us if you need to reschedule

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
CONTACT US
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

Phone: 0556548737
Email: info@regelglitglam.com

We look forward to pampering you!

Best regards,
Regel Glit Glam Team

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
© 2024 Regel Glit Glam. All rights reserved.`;

    // Create mailto link
    const mailtoLink = `mailto:${bookingDetails.customerEmail}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}&cc=info@regelglitglam.com`;
    
    // Open mail client
    window.open(mailtoLink, '_blank');
    
    console.log('Email receipt prepared for:', bookingDetails.customerEmail);
}

// Initialize the page
document.addEventListener("DOMContentLoaded", function() {
    displaySelectedServices();
    updateBookingSummary();
    checkAuthStatus();
});
