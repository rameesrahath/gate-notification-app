const express = require('express');
const multer = require('multer');
const path = require('path');
const fs = require('fs');
const cors = require('cors');
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.static('public'));
app.use('/uploads', express.static('uploads'));

// Configure multer for file uploads
const storage = multer.diskStorage({
    destination: function (req, file, cb) {
        cb(null, 'uploads/');
    },
    filename: function (req, file, cb) {
        const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
        cb(null, file.fieldname + '-' + uniqueSuffix + path.extname(file.originalname));
    }
});

const upload = multer({ 
    storage: storage,
    limits: {
        fileSize: 5 * 1024 * 1024 // 5MB limit
    },
    fileFilter: (req, file, cb) => {
        if (file.mimetype.startsWith('image/')) {
            cb(null, true);
        } else {
            cb(new Error('Only image files are allowed!'), false);
        }
    }
});

// Routes
app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

app.get('/visitor', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'visitor-form.html'));
});

// Handle visitor form submission
app.post('/api/visitor', upload.single('photo'), async (req, res) => {
    try {
        const { visitorName, phoneNumber, personToVisit, purpose } = req.body;
        const photoPath = req.file ? req.file.filename : null;

        // Create visitor data object
        const visitorData = {
            visitorName,
            phoneNumber,
            personToVisit,
            purpose,
            photoPath,
            timestamp: new Date().toISOString(),
            ip: req.ip
        };

        // Save visitor data to JSON file (in production, use a proper database)
        const visitorsFile = path.join(__dirname, 'visitors.json');
        let visitors = [];
        
        if (fs.existsSync(visitorsFile)) {
            const fileContent = fs.readFileSync(visitorsFile, 'utf8');
            visitors = JSON.parse(fileContent);
        }
        
        visitors.push(visitorData);
        fs.writeFileSync(visitorsFile, JSON.stringify(visitors, null, 2));

        // Send WhatsApp notification (implement this function)
        await sendWhatsAppNotification(visitorData);

        res.json({ 
            success: true, 
            message: 'Visitor information recorded successfully. The host has been notified.',
            data: {
                visitorName,
                personToVisit,
                timestamp: visitorData.timestamp
            }
        });

    } catch (error) {
        console.error('Error processing visitor:', error);
        res.status(500).json({ 
            success: false, 
            message: 'Error processing visitor information' 
        });
    }
});

// Function to send WhatsApp notification
async function sendWhatsAppNotification(visitorData) {
    try {
        // Using Twilio WhatsApp API
        const accountSid = process.env.TWILIO_ACCOUNT_SID;
        const authToken = process.env.TWILIO_AUTH_TOKEN;
        const fromWhatsApp = process.env.TWILIO_WHATSAPP_NUMBER; // e.g., 'whatsapp:+14155238886'
        const toWhatsApp = process.env.HOST_WHATSAPP_NUMBER; // e.g., 'whatsapp:+1234567890'

        if (!accountSid || !authToken || !fromWhatsApp || !toWhatsApp) {
            console.log('WhatsApp credentials not configured. Notification not sent.');
            return;
        }

        const client = require('twilio')(accountSid, authToken);

        const message = `🚪 *Gate Visitor Alert*

👤 *Visitor:* ${visitorData.visitorName}
📞 *Phone:* ${visitorData.phoneNumber}
🎯 *Visiting:* ${visitorData.personToVisit}
📝 *Purpose:* ${visitorData.purpose}
⏰ *Time:* ${new Date(visitorData.timestamp).toLocaleString()}

${visitorData.photoPath ? '📸 Photo attached' : '📸 No photo provided'}

Please respond to allow or deny entry.`;

        await client.messages.create({
            body: message,
            from: fromWhatsApp,
            to: toWhatsApp
        });

        console.log('WhatsApp notification sent successfully');
    } catch (error) {
        console.error('Error sending WhatsApp notification:', error);
    }
}

// Get all visitors (for admin)
app.get('/api/visitors', (req, res) => {
    try {
        const visitorsFile = path.join(__dirname, 'visitors.json');
        
        if (fs.existsSync(visitorsFile)) {
            const fileContent = fs.readFileSync(visitorsFile, 'utf8');
            const visitors = JSON.parse(fileContent);
            res.json({ success: true, visitors });
        } else {
            res.json({ success: true, visitors: [] });
        }
    } catch (error) {
        console.error('Error fetching visitors:', error);
        res.status(500).json({ success: false, message: 'Error fetching visitors' });
    }
});

// Generate QR code for gate
app.get('/api/qrcode', async (req, res) => {
    try {
        const QRCode = require('qrcode');
        
        // Auto-detect the base URL from the request
        let baseUrl = process.env.BASE_URL;
        if (!baseUrl) {
            const protocol = req.headers['x-forwarded-proto'] || (req.connection && req.connection.encrypted ? 'https' : 'http');
            const host = req.headers.host;
            baseUrl = `${protocol}://${host}`;
        }
        
        // Remove trailing slash if it exists
        baseUrl = baseUrl.replace(/\/+$/, '');
        
        // Force HTTPS for production environments
        if (process.env.VERCEL || process.env.NODE_ENV === 'production') {
            baseUrl = baseUrl.replace('http://', 'https://');
        }
        
        const visitorUrl = `${baseUrl}/visitor`;
        
        const qrCodeDataURL = await QRCode.toDataURL(visitorUrl, {
            width: 300,
            margin: 2
        });
        
        res.json({ 
            success: true, 
            qrCode: qrCodeDataURL,
            url: visitorUrl
        });
    } catch (error) {
        console.error('Error generating QR code:', error);
        res.status(500).json({ success: false, message: 'Error generating QR code' });
    }
});

app.listen(PORT, () => {
    console.log(`Gate App server running on port ${PORT}`);
    console.log(`Visit http://localhost:${PORT} to view the admin panel`);
    console.log(`QR code should point to: http://localhost:${PORT}/visitor`);
});

// Export for Vercel serverless functions
module.exports = app;
