# Email Receipt Setup Guide

## Setting up EmailJS for Booking Receipts

### Step 1: Create an EmailJS Account
1. Go to [https://www.emailjs.com/](https://www.emailjs.com/)
2. Sign up for a free account (allows 200 emails/month)
3. Verify your email address

### Step 2: Add Email Service
1. In your EmailJS dashboard, go to **Email Services**
2. Click **Add New Service**
3. Choose your email provider (Gmail recommended):
   - For Gmail: Select "Gmail"
   - Connect your salon email: `info@regelglitglam.com`
   - Or use a dedicated Gmail account
4. Note the **Service ID** (you'll need this)

### Step 3: Create Email Template
1. Go to **Email Templates**
2. Click **Create New Template**
3. Use this template content:

**Subject:**
```
Booking Confirmation - Regel Glit Glam - {{booking_id}}
```

**Email Body:**
```html
<div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; background-color: #FFF5F8;">
    <div style="background-color: #d4025d; padding: 20px; text-align: center; border-radius: 10px 10px 0 0;">
        <h1 style="color: white; margin: 0;">👑 Regel Glit Glam</h1>
        <p style="color: white; margin: 10px 0 0 0;">Booking Confirmation</p>
    </div>
    
    <div style="background-color: white; padding: 30px; border-radius: 0 0 10px 10px;">
        <p style="font-size: 16px;">Dear {{to_name}},</p>
        
        <p style="font-size: 14px; line-height: 1.6;">
            Thank you for choosing Regel Glit Glam! Your booking has been confirmed.
        </p>
        
        <div style="background-color: #FFE5EC; padding: 20px; border-radius: 8px; margin: 20px 0;">
            <h2 style="color: #d4025d; margin-top: 0;">Booking Details</h2>
            <table style="width: 100%; font-size: 14px;">
                <tr>
                    <td style="padding: 8px 0;"><strong>Booking ID:</strong></td>
                    <td style="padding: 8px 0;">{{booking_id}}</td>
                </tr>
                <tr>
                    <td style="padding: 8px 0;"><strong>Services:</strong></td>
                    <td style="padding: 8px 0;">{{services}}</td>
                </tr>
                <tr>
                    <td style="padding: 8px 0;"><strong>Date:</strong></td>
                    <td style="padding: 8px 0;">{{booking_date}}</td>
                </tr>
                <tr>
                    <td style="padding: 8px 0;"><strong>Time:</strong></td>
                    <td style="padding: 8px 0;">{{booking_time}}</td>
                </tr>
                <tr>
                    <td style="padding: 8px 0;"><strong>Total:</strong></td>
                    <td style="padding: 8px 0; font-size: 18px; color: #d4025d;"><strong>{{total_price}}</strong></td>
                </tr>
            </table>
        </div>
        
        <div style="background-color: #f9f9f9; padding: 15px; border-radius: 8px; margin: 20px 0;">
            <h3 style="color: #1a1a1a; margin-top: 0; font-size: 16px;">Important Information</h3>
            <ul style="font-size: 14px; line-height: 1.8; color: #6c757d;">
                <li>Please arrive 10 minutes before your appointment</li>
                <li>Bring this confirmation email or booking ID</li>
                <li>Contact us if you need to reschedule</li>
            </ul>
        </div>
        
        <hr style="border: none; border-top: 1px solid #e0e0e0; margin: 25px 0;">
        
        <div style="text-align: center; color: #6c757d; font-size: 14px;">
            <p><strong>Contact Us</strong></p>
            <p>📞 {{salon_phone}}</p>
            <p>✉️ {{salon_email}}</p>
            <p style="margin-top: 20px;">We look forward to pampering you!</p>
        </div>
    </div>
    
    <div style="text-align: center; padding: 20px; font-size: 12px; color: #6c757d;">
        <p>&copy; 2024 Regel Glit Glam. All rights reserved.</p>
    </div>
</div>
```

4. Save the template and note the **Template ID**

### Step 4: Get Your Public Key
1. Go to **Account** → **General**
2. Copy your **Public Key**

### Step 5: Update booking.js
Open `public/booking.js` and replace the placeholders:

```javascript
// Line ~532 - Replace with your public key
emailjs.init("YOUR_PUBLIC_KEY");

// Line ~548-549 - Replace with your IDs
const response = await emailjs.send(
    'YOUR_SERVICE_ID',      // Your service ID from step 2
    'YOUR_TEMPLATE_ID',     // Your template ID from step 3
    templateParams
);
```

### Step 6: Test the Email
1. Deploy your changes: `firebase deploy`
2. Make a test booking on your site
3. Check the customer email inbox for the receipt

### Troubleshooting
- **Emails not sending?** Check the browser console for errors
- **Quota exceeded?** EmailJS free tier allows 200 emails/month
- **Emails in spam?** Add a custom domain to EmailJS (paid feature)
- **Template not working?** Make sure all variable names match: `{{to_name}}`, `{{booking_id}}`, etc.

### Alternative: Upgrade to Paid Plan
For production use, consider:
- EmailJS Pro ($15/month) - 10,000 emails/month
- Or use SendGrid, AWS SES, or Mailgun for higher volume

## Email Template Variables Used
- `to_email` - Customer email
- `to_name` - Customer name
- `booking_id` - Booking reference ID
- `services` - List of services booked
- `booking_date` - Appointment date
- `booking_time` - Appointment time
- `total_price` - Total cost
- `phone` - Customer phone
- `salon_name` - "Regel Glit Glam"
- `salon_phone` - "0556548737"
- `salon_email` - "info@regelglitglam.com"
