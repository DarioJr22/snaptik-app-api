# 🎵 SnapTik App API

[![npm version](https://img.shields.io/npm/v/snaptik-app-api.svg)](https://www.npmjs.com/package/snaptik-app-api)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)
[![Node.js Version](https://img.shields.io/badge/node-%3E%3D%2014-brightgreen)](https://nodejs.org/)

> 🚀 A powerful Node.js API wrapper for downloading TikTok videos without watermarks, based on reverse-engineering SnapTik (snaptik.app)

## ✨ Features

- 🎬 **Download TikTok videos** without watermarks
- 📸 **Support for photo slideshows** and single images
- 🔗 **Multiple quality options** including HD
- 🛡️ **No API keys required** - completely free
- ⚡ **Fast and reliable** downloads
- 🎯 **Simple and intuitive** API
- 📱 **Works with all TikTok URLs**

## 📦 Installation

```bash
npm install snaptik-app-api
```

## 🚀 Quick Start

```javascript
const SnapTikClient = require('snaptik-app-api');

const client = new SnapTikClient();

async function downloadTikTok() {
  try {
    const result = await client.process('https://www.tiktok.com/@username/video/1234567890');
    
    console.log('Content Type:', result.type); // 'video', 'photo', or 'slideshow'
    
    if (result.type === 'video') {
      // Download the first (highest quality) video source
      const response = await result.data.sources[0].download();
      console.log('Video downloaded!', response.config.url);
    }
  } catch (error) {
    console.error('Error:', error.message);
  }
}

downloadTikTok();
```

## 📖 API Documentation

### Constructor

```javascript
const client = new SnapTikClient(config);
```

**Parameters:**
- `config` (optional): Configuration object for axios instance

### Methods

#### `process(url)`

Downloads and processes a TikTok URL.

**Parameters:**
- `url` (string): TikTok video URL

**Returns:** Promise that resolves to a result object:

```javascript
{
  type: 'video' | 'photo' | 'slideshow',
  url: string,
  data: {
    sources: Resource[],
    oembed_url: string,
    // For slideshows only:
    photos?: Array<{ sources: Resource[] }>
  }
}
```

#### `Resource.download(config)`

Downloads the media resource.

**Parameters:**
- `config` (optional): Axios configuration object

**Returns:** Promise with the download response

## 💡 Usage Examples

### Video Download

```javascript
const SnapTikClient = require('snaptik-app-api');
const fs = require('fs');

const client = new SnapTikClient();

async function downloadVideo(tiktokUrl) {
  try {
    const result = await client.process(tiktokUrl);
    
    if (result.type === 'video') {
      const videoResponse = await result.data.sources[0].download({
        responseType: 'stream'
      });
      
      const fileName = `tiktok_video_${Date.now()}.mp4`;
      videoResponse.data.pipe(fs.createWriteStream(fileName));
      
      console.log(`Video saved as ${fileName}`);
    }
  } catch (error) {
    console.error('Download failed:', error.message);
  }
}

downloadVideo('https://www.tiktok.com/@user/video/123456789');
```

### Photo Slideshow Download

```javascript
async function downloadSlideshow(tiktokUrl) {
  try {
    const result = await client.process(tiktokUrl);
    
    if (result.type === 'slideshow') {
      for (let i = 0; i < result.data.photos.length; i++) {
        const photo = result.data.photos[i];
        const response = await photo.sources[0].download({
          responseType: 'stream'
        });
        
        const fileName = `photo_${i + 1}_${Date.now()}.jpg`;
        response.data.pipe(fs.createWriteStream(fileName));
        
        console.log(`Photo ${i + 1} saved as ${fileName}`);
      }
    }
  } catch (error) {
    console.error('Download failed:', error.message);
  }
}
```

### Get Video Information Only

```javascript
async function getVideoInfo(tiktokUrl) {
  try {
    const result = await client.process(tiktokUrl);
    
    console.log({
      type: result.type,
      url: result.url,
      sourcesCount: result.data.sources.length,
      oembedUrl: result.data.oembed_url
    });
  } catch (error) {
    console.error('Failed to get info:', error.message);
  }
}
```

## 🔧 Advanced Configuration

```javascript
const client = new SnapTikClient({
  timeout: 10000,
  headers: {
    'User-Agent': 'Custom User Agent'
  }
});
```

## 🌐 HTTP Server (REST API)

You can also run this as a REST API server:

### Start the server

```bash
npm install express cors
npm start
```

The server will start on `http://localhost:3000`

### API Endpoints

#### `POST /download`
Download TikTok video/photos and get download URLs.

**Request Body:**
```json
{
  "url": "https://www.tiktok.com/@username/video/1234567890"
}
```

**Response:**
```json
{
  "status": "success",
  "data": {
    "type": "video",
    "url": "https://www.tiktok.com/@username/video/1234567890",
    "oembed_url": "https://...",
    "sources": [
      {
        "index": 0,
        "url": "https://...",
        "quality": "HD"
      }
    ]
  }
}
```

#### `POST /info`
Get TikTok media information without download URLs.

#### `GET /stream?url=TIKTOK_URL&quality=0`
Stream video directly to browser.

### Example Usage with cURL

```bash
# Download video info
curl -X POST http://localhost:3000/download \
  -H "Content-Type: application/json" \
  -d '{"url": "https://www.tiktok.com/@username/video/123"}'

# Stream video directly
curl "http://localhost:3000/stream?url=https://www.tiktok.com/@username/video/123" \
  --output video.mp4
```

## 🛠️ Development

### Clone the repository

```bash
git clone https://github.com/0x6a69616e/snaptik-app-api.git
cd snaptik-app-api
```

### Install dependencies

```bash
npm install
```

### Run in development mode

```bash
npm run dev
```

### Run in production

```bash
npm start
```

### Run tests

```bash
npm test
```

## 🐳 Docker Deployment

### Build and run with Docker

```bash
# Build the Docker image
docker build -t snaptik-api .

# Run the container
docker run -p 3000:3000 snaptik-api
```

### Or use the build script

```bash
./build-docker.sh
```

### Deploy to Railway

1. Connect your GitHub repository to Railway
2. Railway will automatically detect the `Dockerfile` and `railway.json`
3. The app will be deployed automatically

### Environment Variables for Production

Set these in your Railway dashboard:

- `NODE_ENV=production`
- `PORT` (automatically set by Railway)

## 📋 Requirements

- Node.js >= 14.0.0
- Internet connection for API requests

## 🤝 Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

1. Fork the project
2. Create your feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

## ⚠️ Disclaimer

This project is for educational purposes only. Please respect TikTok's Terms of Service and only download content you have permission to download. The authors are not responsible for any misuse of this software.

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🙏 Acknowledgments

- Thanks to the SnapTik service for providing the underlying functionality
- Built with ❤️ using Node.js, Axios, and Cheerio

## 📞 Support

If you have any questions or need help, please open an issue on GitHub.

---

**⭐ If this project helped you, please give it a star on GitHub! ⭐**