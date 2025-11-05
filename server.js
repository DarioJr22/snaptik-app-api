const express = require('express');
const cors = require('cors');
const SnapTikClient = require('./src/index');

const app = express();
const port = process.env.PORT || 3000;

// Railway-specific: Trust proxy for proper IP detection
app.set('trust proxy', 1);

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Initialize SnapTik client
const snapTikClient = new SnapTikClient();

// Health check endpoint
app.get('/', (req, res) => {
  res.json({
    status: 'success',
    message: 'SnapTik API Server is running!',
    version: '1.0.0',
    endpoints: {
      download: 'POST /download - Download TikTok video/photos',
      info: 'POST /info - Get TikTok media information',
      stream: 'GET /stream - Stream video directly'
    }
  });
});

// Download endpoint - returns video info and download URLs
app.post('/download', async (req, res) => {
  try {
    const { url } = req.body;

    if (!url) {
      return res.status(400).json({
        status: 'error',
        message: 'TikTok URL is required'
      });
    }

    // Validate TikTok URL
    if (!isValidTikTokUrl(url)) {
      return res.status(400).json({
        status: 'error',
        message: 'Please provide a valid TikTok URL'
      });
    }

    console.log(`Processing URL: ${url}`);
    
    const result = await snapTikClient.process(url);

    // Format response based on content type
    const response = {
      status: 'success',
      data: {
        type: result.type,
        url: result.url,
        oembed_url: result.data.oembed_url,
        sources: result.data.sources.map((source, index) => ({
          index: source.index,
          url: source.url,
          quality: index === 0 ? 'HD' : index === 1 ? 'Standard' : 'Alternative'
        }))
      }
    };

    // Add photos data for slideshows
    if (result.type === 'slideshow' && result.data.photos) {
      response.data.photos = result.data.photos.map((photo, photoIndex) => ({
        index: photoIndex,
        sources: photo.sources.map((source, sourceIndex) => ({
          index: source.index,
          url: source.url,
          quality: sourceIndex === 0 ? 'Original' : 'Thumbnail'
        }))
      }));
    }

    res.json(response);

  } catch (error) {
    console.error('Download error:', error);
    res.status(500).json({
      status: 'error',
      message: 'Failed to process TikTok URL',
      error: error.message
    });
  }
});

// Info endpoint - returns only media information without download URLs
app.post('/info', async (req, res) => {
  try {
    const { url } = req.body;

    if (!url) {
      return res.status(400).json({
        status: 'error',
        message: 'TikTok URL is required'
      });
    }

    if (!isValidTikTokUrl(url)) {
      return res.status(400).json({
        status: 'error',
        message: 'Please provide a valid TikTok URL'
      });
    }

    const result = await snapTikClient.process(url);

    res.json({
      status: 'success',
      data: {
        type: result.type,
        url: result.url,
        oembed_url: result.data.oembed_url,
        sources_count: result.data.sources.length,
        photos_count: result.type === 'slideshow' ? result.data.photos?.length : 0
      }
    });

  } catch (error) {
    console.error('Info error:', error);
    res.status(500).json({
      status: 'error',
      message: 'Failed to get TikTok info',
      error: error.message
    });
  }
});

// Stream endpoint - directly streams the video
app.get('/stream', async (req, res) => {
  try {
    const { url, quality = '0' } = req.query;

    if (!url) {
      return res.status(400).json({
        status: 'error',
        message: 'TikTok URL is required as query parameter'
      });
    }

    if (!isValidTikTokUrl(url)) {
      return res.status(400).json({
        status: 'error',
        message: 'Please provide a valid TikTok URL'
      });
    }

    const result = await snapTikClient.process(url);

    if (result.type !== 'video') {
      return res.status(400).json({
        status: 'error',
        message: 'URL does not contain a video'
      });
    }

    const qualityIndex = parseInt(quality) || 0;
    const source = result.data.sources[qualityIndex] || result.data.sources[0];

    console.log(`Streaming video from: ${source.url}`);

    // Stream the video
    const videoResponse = await source.download({
      responseType: 'stream'
    });

    // Set appropriate headers
    res.setHeader('Content-Type', 'video/mp4');
    res.setHeader('Content-Disposition', 'inline');
    
    // Pipe the video stream to response
    videoResponse.data.pipe(res);

  } catch (error) {
    console.error('Stream error:', error);
    res.status(500).json({
      status: 'error',
      message: 'Failed to stream video',
      error: error.message
    });
  }
});

// URL validation helper
function isValidTikTokUrl(url) {
  const tiktokRegex = /^https?:\/\/(www\.)?(tiktok\.com|vm\.tiktok\.com)/i;
  return tiktokRegex.test(url);
}

// Error handling middleware
app.use((error, req, res, next) => {
  console.error('Unhandled error:', error);
  res.status(500).json({
    status: 'error',
    message: 'Internal server error'
  });
});

// 404 handler
app.use('*', (req, res) => {
  res.status(404).json({
    status: 'error',
    message: 'Endpoint not found'
  });
});

// Start server
app.listen(port, () => {
  console.log(`🚀 SnapTik API Server running on port ${port}`);
  console.log(`📡 Health check: http://localhost:${port}/`);
  console.log(`📥 Download endpoint: http://localhost:${port}/download`);
  console.log(`📋 Info endpoint: http://localhost:${port}/info`);
  console.log(`🎬 Stream endpoint: http://localhost:${port}/stream`);
});

module.exports = app;