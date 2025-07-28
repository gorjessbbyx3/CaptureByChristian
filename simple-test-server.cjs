const express = require('express');
const path = require('path');
const fs = require('fs');

const app = express();

// Enable CORS
app.use((req, res, next) => {
  res.header('Access-Control-Allow-Origin', '*');
  res.header('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
  res.header('Access-Control-Allow-Headers', 'Content-Type, Authorization');
  if (req.method === 'OPTIONS') {
    res.sendStatus(200);
  } else {
    next();
  }
});

app.use(express.json());

// Serve built static files with proper MIME types
app.use(express.static(path.join(__dirname, 'dist', 'public'), {
  setHeaders: (res, path) => {
    if (path.endsWith('.js')) {
      res.setHeader('Content-Type', 'application/javascript');
    } else if (path.endsWith('.css')) {
      res.setHeader('Content-Type', 'text/css');
    }
  }
}));

// Mock API endpoints
app.get('/api/services', (req, res) => {
  res.json([
    {
      id: 1,
      name: "Wedding Photography",
      price: "2500",
      description: "Complete wedding photography package",
      addOns: [
        { id: "1", name: "Extra Hour", price: 200 },
        { id: "2", name: "Engagement Session", price: 300 }
      ]
    },
    {
      id: 2,
      name: "Portrait Session",
      price: "500",
      description: "Professional portrait photography",
      addOns: []
    }
  ]);
});

app.get('/api/bookings', (req, res) => {
  res.json([
    {
      id: 1,
      serviceId: 1,
      client: { name: "John & Jane Doe" },
      service: { name: "Wedding Photography" },
      date: "2024-02-15T14:00:00Z",
      location: "Honolulu, HI",
      status: "confirmed",
      totalPrice: "2500"
    }
  ]);
});

app.get('/api/clients', (req, res) => {
  res.json([
    {
      id: 1,
      name: "John Doe",
      email: "john@example.com",
      source: "Website"
    }
  ]);
});

app.get('/api/profile', (req, res) => {
  res.json({
    name: "Christian Picaso",
    bio: "Professional photographer based in Hawaii",
    phone: "(808) 555-PHOTO",
    email: "christian@picaso.photography",
    address: "Honolulu, Hawaii"
  });
});

app.get('/api/gallery', (req, res) => {
  res.json([
    {
      id: 1,
      url: "https://images.unsplash.com/photo-1519741497674-611481863552?w=800",
      title: "Wedding Photo 1",
      featured: true
    }
  ]);
});

app.post('/api/contact', (req, res) => {
  console.log('Contact form submission:', req.body);
  res.json({ success: true, message: "Message received" });
});

app.post('/api/bookings', (req, res) => {
  console.log('Booking submission:', req.body);
  res.json({ success: true, id: Date.now() });
});

app.post('/api/ai-chat', (req, res) => {
  console.log('AI Chat message:', req.body);
  res.json({
    response: "Thank you for your message! I'm here to help with your photography needs.",
    sessionId: req.body.sessionId
  });
});

app.get('/api/analytics/stats', (req, res) => {
  res.json({
    totalBookings: 25,
    totalRevenue: 50000,
    pendingBookings: 3
  });
});

// Serve the built frontend
app.get('*', (req, res) => {
  const indexPath = path.join(__dirname, 'dist', 'public', 'index.html');
  if (fs.existsSync(indexPath)) {
    res.sendFile(indexPath);
  } else {
    res.status(404).send('Frontend not built. Run npm run build first.');
  }
});

const port = 7000;
app.listen(port, () => {
  console.log(`🎉 Simple test server running on port ${port}`);
  console.log(`📱 Frontend available at http://localhost:${port}`);
});
