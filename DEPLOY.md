# cPanel Deployment Guide for Bridexx Planet

This application is prepared for deployment on modern cPanel hosting with Node.js support.

## Prerequisites
1. Ensure your cPanel plan includes the **Setup Node.js App** feature.
2. Your domain (`bridexxplanet.com`) should be pointed to your hosting.

## Deployment Steps

### 1. Upload Files
Upload the following files/folders to your Application Root (usually a folder like `public_nodejs` or your domain's home folder):
- `dist/` (Contains both Frontend and Backend)
- `package.json`
- `app.js` (The cPanel entry point)
- `.env` (Create this file based on `.env.example`)

### 2. Configure Node.js App in cPanel
1. Open **Setup Node.js App** in cPanel.
2. Click **Create Application**.
3. Set **Node.js version** to 20.x or higher (recommended).
4. **Application mode**: Set to `Production`.
5. **Application root**: Path to the folder where you uploaded the files.
6. **Application URL**: `bridexxplanet.com`
7. **Application startup file**: `app.js`
8. **Environment variables**: Add all keys from `.env.example` manually here or via the `.env` file if supported.

### 3. Install Dependencies
1. Once the application is created, click the **Run npm install** button in the cPanel Node.js interface.

### 4. Start the App
Click **Restart** or **Start** to launch the site.

## Notes
- **Static Assets**: The Express server is configured to serve the frontend from the `dist` folder automatically when `NODE_ENV=production`.
- **Port**: The application listens on `process.env.PORT` which is standard for cPanel/Cloud environments.
- **Resend**: Ensure your domain is verified on Resend.com and the API Key is added to environment variables.
- **Paystack**: Ensure your public/secret keys are added for payments to work.
