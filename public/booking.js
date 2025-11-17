// booking.js
import { initializeApp } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-app.js";
import { getFirestore, collection, addDoc, doc, getDoc } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-firestore.js";
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
}

// Time Slot Selection
const timeSlots = document.querySelectorAll(".time-slot:not(.unavailable)");
const selectedTimeInput = document.getElementById("selectedTime");

if (timeSlots.length > 0) {
    timeSlots.forEach((slot) => {
        slot.addEventListener("click", () => {
            // Remove selected class from all time slots
            timeSlots.forEach((s) => s.classList.remove("selected"));

            // Add selected class to clicked slot
            slot.classList.add("selected");

            // Update hidden input value
            selectedTimeInput.value = slot.getAttribute("data-time");

            // Update booking summary
            updateBookingSummary();
        });
    });
}

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
                services: selectedServices.map(service => ({
                    id: service.id || service.service.toLowerCase().replace(/\s+/g, '-'),
                    name: service.service,
                    price: parseFloat(service.price),
                    duration: service.duration
                })),
                booking_date: dateValue,
                booking_time: timeValue,
                special_requests: specialRequests,
                status: 'Pending',
                total_price: totalPrice,
                created_at: new Date(),
                updated_at: new Date(),
                // Add user ID if logged in via Firebase
                user_id: user ? user.uid : null,
                // Add admin flag if booking is made by admin
                is_admin_booking: isAdmin
            };

            // Save booking to Firestore
            const docRef = await addDoc(collection(db, 'bookings'), bookingData);
            
            // Send email receipt to customer
            try {
                await sendBookingReceipt({
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
            document.getElementById('confirm-booking-id').textContent = docRef.id;
            document.getElementById('confirm-services').textContent = serviceNames;
            document.getElementById('confirm-date').textContent = formattedDate;
            document.getElementById('confirm-time').textContent = displayTime;
            document.getElementById('confirm-total').textContent = `$${totalPrice.toFixed(2)}`;

            // Show confirmation modal
            confirmationModal.style.display = "flex";

            // Clear localStorage and reset form
            localStorage.removeItem("regelCart");
            selectedServices = [];
            displaySelectedServices();
            bookingForm.reset();
            if (timeSlots.length > 0) {
                timeSlots.forEach((slot) => slot.classList.remove("selected"));
            }
            updateBookingSummary();

        } catch (error) {
            console.error('Error creating booking:', error);
            alert('There was an error submitting your booking. Please try again.');
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
    const userAuthSection = document.getElementById('userAuthSection');
    
    if (!userAuthSection) return;

    if (isLoggedIn) {
        // User is logged in - show logout button
        userAuthSection.innerHTML = `
            <li>
                <button class="btn-logout" id="logoutBtn">
                    <i class="fas fa-sign-out-alt"></i> Logout
                </button>
            </li>
        `;

        // Add admin link if user is admin
        if (isAdmin) {
            const adminLi = document.createElement('li');
            adminLi.innerHTML = `<a href="/admin" style="color: var(--gold);">Admin</a>`;
            userAuthSection.parentNode.insertBefore(adminLi, userAuthSection);
        }

        // Add logout event listener
        const logoutBtn = document.getElementById('logoutBtn');
        if (logoutBtn) {
            logoutBtn.addEventListener('click', handleLogout);
        }
    } else {
        // User is not logged in - show login/signup
        userAuthSection.innerHTML = `
            <li><a href="/login">Login</a></li>
        `;
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
function checkAuthStatus() {
    // Check Firebase authentication
    onAuthStateChanged(auth, (user) => {
        if (user) {
            // User is signed in via Firebase
            updateNavigationForUser(true, false);
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

// Send booking receipt via email
async function sendBookingReceipt(bookingDetails) {
    // Initialize EmailJS (you'll need to replace these with your actual EmailJS credentials)
    // Sign up at https://www.emailjs.com/ and get your public key
    emailjs.init("YOUR_PUBLIC_KEY"); // Replace with your EmailJS public key
    
    const templateParams = {
        to_email: bookingDetails.customerEmail,
        to_name: bookingDetails.customerName,
        booking_id: bookingDetails.bookingId,
        services: bookingDetails.services,
        booking_date: bookingDetails.date,
        booking_time: bookingDetails.time,
        total_price: `GHS ${bookingDetails.total.toFixed(2)}`,
        phone: bookingDetails.phone,
        salon_name: "Regel Glit Glam",
        salon_phone: "0556548737",
        salon_email: "info@regelglitglam.com"
    };
    
    try {
        // Replace 'YOUR_SERVICE_ID' and 'YOUR_TEMPLATE_ID' with your actual EmailJS IDs
        const response = await emailjs.send(
            'YOUR_SERVICE_ID',      // Replace with your EmailJS service ID
            'YOUR_TEMPLATE_ID',     // Replace with your EmailJS template ID
            templateParams
        );
        console.log('Email sent successfully:', response);
        return response;
    } catch (error) {
        console.error('Email sending failed:', error);
        throw error;
    }
}

// Initialize the page
document.addEventListener("DOMContentLoaded", function() {
    displaySelectedServices();
    updateBookingSummary();
    checkAuthStatus();
});
