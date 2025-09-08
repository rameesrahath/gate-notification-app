# Gate App - Visitor Notification System

A QR code-based visitor management system that sends WhatsApp notifications to property owners when someone visits their gate.

## Features

- **QR Code Generation**: Generate and print QR codes for your gate
- **Visitor Form**: Mobile-friendly form for visitors to fill out their details
- **Photo Upload**: Optional photo capture/upload for visitor identification
- **WhatsApp Notifications**: Automatic WhatsApp messages to property owner
- **Admin Dashboard**: View all visitor records and manage the system
- **Real-time Updates**: Auto-refreshing visitor list

## How It Works

1. **Setup**: Property owner generates a QR code and prints it at their gate
2. **Visitor Arrival**: Visitor scans QR code with their phone
3. **Information Entry**: Visitor fills out form with:
   - Their name (required)
   - Phone number (optional)
   - Who they're visiting (required)
   - Purpose of visit (optional)
   - Photo (optional)
4. **Notification**: Property owner receives WhatsApp message with visitor details
5. **Response**: Property owner can respond to allow/deny entry

## Installation

1. **Clone and install dependencies:**
   ```bash
   npm install
   ```

2. **Set up environment variables:**
   - Copy `env-example.txt` to `.env`
   - Fill in your Twilio WhatsApp API credentials
   - Set your host WhatsApp number

3. **Start the server:**
   ```bash
   npm start
   ```

4. **Access the application:**
   - Admin panel: http://localhost:3000
   - Visitor form: http://localhost:3000/visitor

## WhatsApp Setup (Twilio)

1. **Create Twilio Account**: Sign up at https://www.twilio.com
2. **Get Credentials**: Find your Account SID and Auth Token in the Console
3. **WhatsApp Sandbox**: For testing, use Twilio's WhatsApp Sandbox
4. **Production**: For production, apply for WhatsApp Business API approval

### Environment Variables Required:
```
TWILIO_ACCOUNT_SID=your_account_sid
TWILIO_AUTH_TOKEN=your_auth_token
TWILIO_WHATSAPP_NUMBER=whatsapp:+14155238886
HOST_WHATSAPP_NUMBER=whatsapp:+1234567890
```

## Usage

### For Property Owners:
1. Visit http://localhost:3000 for the admin dashboard
2. Generate and print the QR code
3. Place the QR code at your gate
4. Receive WhatsApp notifications when visitors arrive

### For Visitors:
1. Scan the QR code at the gate
2. Fill out the visitor form
3. Submit and wait for host response

## Project Structure

```
GATEAPP/
├── server.js              # Main server file
├── package.json           # Dependencies and scripts
├── public/                # Frontend files
│   ├── index.html         # Admin dashboard
│   └── visitor-form.html  # Visitor registration form
├── uploads/               # Uploaded visitor photos
├── visitors.json          # Visitor records (use database in production)
└── .env                   # Environment variables (create from env-example.txt)
```

## API Endpoints

- `GET /` - Admin dashboard
- `GET /visitor` - Visitor registration form
- `POST /api/visitor` - Submit visitor information
- `GET /api/visitors` - Get all visitor records
- `GET /api/qrcode` - Generate QR code

## Production Deployment

### Heroku Deployment (Recommended)

1. **Install Heroku CLI**: Download from https://devcenter.heroku.com/articles/heroku-cli

2. **Login to Heroku**:
   ```bash
   heroku login
   ```

3. **Create Heroku app**:
   ```bash
   heroku create your-gate-app-name
   ```

4. **Set environment variables on Heroku**:
   ```bash
   heroku config:set TWILIO_ACCOUNT_SID=your_account_sid
   heroku config:set TWILIO_AUTH_TOKEN=your_auth_token
   heroku config:set TWILIO_WHATSAPP_NUMBER=whatsapp:+14155238886
   heroku config:set HOST_WHATSAPP_NUMBER=whatsapp:+your_number
   heroku config:set BASE_URL=https://your-gate-app-name.herokuapp.com
   ```

5. **Deploy to Heroku**:
   ```bash
   git add .
   git commit -m "Deploy to Heroku"
   git push heroku main
   ```

6. **Open your app**:
   ```bash
   heroku open
   ```

### Other Production Options

1. **Database**: Replace JSON file storage with a proper database (MongoDB, PostgreSQL, etc.)
2. **File Storage**: Use cloud storage (AWS S3, Cloudinary) for photos
3. **HTTPS**: Enable SSL/TLS for secure connections
4. **Environment**: Set production environment variables
5. **Domain**: Update BASE_URL to your production domain

## Security Considerations

- Implement rate limiting for API endpoints
- Add input validation and sanitization
- Use HTTPS in production
- Implement proper error handling
- Consider adding authentication for admin panel

## Troubleshooting

### WhatsApp Not Working:
- Check Twilio credentials in .env file
- Verify WhatsApp number format (include whatsapp: prefix)
- Ensure WhatsApp Sandbox is set up correctly
- Check Twilio console for error messages

### QR Code Not Loading:
- Verify server is running on correct port
- Check BASE_URL in .env matches your server URL
- Ensure internet connection for QR code generation

### Photos Not Uploading:
- Check uploads folder permissions
- Verify file size limits (currently 5MB)
- Ensure only image files are being uploaded

## License

MIT License - feel free to modify and use for your own projects.

## Support

For issues and questions, please check the troubleshooting section above or create an issue in the repository.
