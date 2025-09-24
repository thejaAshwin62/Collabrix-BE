# Collabrix Backend

A powerful real-time collaborative document editing platform built with Node.js, Express, MongoDB, and WebSocket technology. This backend provides secure document management, user authentication, and real-time collaboration features.

## 🚀 Features

### **Core Features**

- **Real-time Collaborative Editing**: WebSocket-based real-time document synchronization using Yjs
- **User Authentication**: JWT-based secure authentication system
- **Document Management**: Full CRUD operations for documents with permissions
- **User Presence**: Real-time user presence tracking and cursor synchronization
- **Access Control**: Role-based document permissions (owner, edit, view)
- **Activity Tracking**: Complete audit trail of user activities
- **Document Sharing**: Secure document sharing with customizable permissions

### **Technical Features**

- **Persistent Storage**: LevelDB for document persistence with MongoDB for metadata
- **WebSocket Integration**: Real-time collaboration using y-websocket
- **RESTful API**: Clean API endpoints following REST conventions
- **CORS Support**: Cross-origin resource sharing for frontend integration
- **Environment Configuration**: Secure environment variable management

## 🏗️ Architecture

```
├── config/
│   └── mongoose/
│       └── database.js          # MongoDB connection configuration
├── controllers/
│   ├── authController.js        # Authentication logic
│   └── docController.js         # Document management logic
├── middleware/
│   └── authMiddleware.js        # JWT authentication middleware
├── models/
│   ├── DocsModel.js            # Document schema
│   └── UserModel.js            # User schema with preferences
├── persistence/
│   └── leveldb.js              # LevelDB configuration for Yjs
├── routes/
│   ├── authRouter.js           # Authentication routes
│   └── DocsRouter.js           # Document management routes
├── utils/
│   ├── jwt.js                  # JWT utility functions
│   └── websocket-utils.js      # WebSocket connection utilities
├── index.js                    # Main server entry point with WebSocket
├── server.js                   # Express app configuration
└── package.json                # Dependencies and scripts
```

## 🛠️ Technology Stack

- **Runtime**: Node.js
- **Framework**: Express.js
- **Database**: MongoDB (with Mongoose ODM)
- **Real-time**: WebSocket with Yjs CRDT
- **Persistence**: LevelDB (y-leveldb)
- **Authentication**: JWT (JSON Web Tokens)
- **Security**: bcryptjs for password hashing
- **Development**: Nodemon, Morgan logging

## 📋 Prerequisites

- **Node.js** (v16 or higher)
- **MongoDB** (v4.4 or higher)
- **npm** or **yarn**

## 🚀 Quick Start

### 1. Clone the Repository

```bash
git clone https://github.com/thejaAshwin62/Collabrix-BE.git
cd Collabrix-BE
```

### 2. Install Dependencies

```bash
npm install
```

### 3. Environment Setup

Create a `.env` file in the root directory:

```env
# Server Configuration
PORT=5000
NODE_ENV=development

# Database Configuration
MONGO_URI=mongodb://localhost:27017/collabrix
# For MongoDB Atlas:
# MONGO_URI=mongodb+srv://<username>:<password>@cluster.mongodb.net/collabrix

# JWT Configuration
JWT_SECRET=your_super_secure_jwt_secret_key_here
JWT_EXPIRE=7d

# Optional: Additional Configuration
CORS_ORIGIN=http://localhost:3000
```

### 4. Start MongoDB

Make sure MongoDB is running on your system:

```bash
# For macOS with Homebrew:
brew services start mongodb/brew/mongodb-community

# For Linux:
sudo systemctl start mongod

# For Windows:
net start MongoDB
```

### 5. Run the Server

```bash
# Development mode with auto-reload
npm run dev

# Production mode
npm start
```

The server will start on `http://localhost:5000` with WebSocket support.

## 📚 API Documentation

### Authentication Endpoints

#### Register User

```http
POST /api/v1/auth/register
Content-Type: application/json

{
  "username": "johndoe",
  "email": "john@example.com",
  "password": "securepassword",
  "name": "John Doe"
}
```

#### Login User

```http
POST /api/v1/auth/login
Content-Type: application/json

{
  "email": "john@example.com",
  "password": "securepassword"
}
```

#### Get User Profile

```http
GET /api/v1/auth/profile
Authorization: Bearer <JWT_TOKEN>
```

### Document Endpoints

#### Create Document

```http
POST /api/v1/docs/create
Authorization: Bearer <JWT_TOKEN>
Content-Type: application/json

{
  "title": "My Document",
  "content": "Initial content"
}
```

#### Get User Documents

```http
GET /api/v1/docs/user-documents
Authorization: Bearer <JWT_TOKEN>
```

#### Get Document by ID

```http
GET /api/v1/docs/:documentId
Authorization: Bearer <JWT_TOKEN>
```

#### Update Document

```http
PUT /api/v1/docs/:documentId
Authorization: Bearer <JWT_TOKEN>
Content-Type: application/json

{
  "title": "Updated Title",
  "content": "Updated content"
}
```

#### Share Document

```http
POST /api/v1/docs/:documentId/share
Authorization: Bearer <JWT_TOKEN>
Content-Type: application/json

{
  "email": "collaborator@example.com",
  "permission": "edit" // or "view"
}
```

#### Get User Activity

```http
GET /api/v1/docs/user-activity?limit=10&offset=0
Authorization: Bearer <JWT_TOKEN>
```

### WebSocket Connection

#### Real-time Collaboration

```javascript
// Connect to document WebSocket
const ws = new WebSocket(`ws://localhost:5000/${documentId}?token=${jwtToken}`);

// Handle connection events
ws.onopen = () => console.log("Connected to document");
ws.onmessage = (event) => {
  // Handle Yjs document updates and presence
};
```

## 🔧 Configuration

### Environment Variables

| Variable      | Description               | Default       | Required |
| ------------- | ------------------------- | ------------- | -------- |
| `PORT`        | Server port               | `5000`        | No       |
| `NODE_ENV`    | Environment mode          | `development` | No       |
| `MONGO_URI`   | MongoDB connection string | -             | Yes      |
| `JWT_SECRET`  | JWT signing secret        | -             | Yes      |
| `JWT_EXPIRE`  | JWT expiration time       | `7d`          | No       |
| `CORS_ORIGIN` | CORS allowed origin       | `*`           | No       |

### MongoDB Schema

#### User Model

```javascript
{
  username: String (unique),
  email: String (unique),
  password: String (hashed),
  name: String,
  preferences: {
    theme: String,
    language: String,
    // ... additional preferences
  },
  stats: {
    documentsCreated: Number,
    collaborations: Number,
    // ... activity stats
  }
}
```

#### Document Model

```javascript
{
  title: String,
  content: String,
  owner: ObjectId (User),
  permissions: [{
    user: ObjectId (User),
    permission: String ('view' | 'edit'),
    grantedAt: Date,
    grantedBy: ObjectId (User)
  }],
  isPublic: Boolean,
  lastModified: Date
}
```

## 🔄 Development

### Available Scripts

```bash
# Start development server with auto-reload
npm run dev

# Start production server
npm start

# Start only backend server
npm run dev:server

# Start only frontend client (if applicable)
npm run dev:client

# Start both backend and frontend concurrently
npm run dev:all
```

### Development Workflow

1. Make your changes
2. Test with Postman/Thunder Client or frontend
3. Check logs in the terminal
4. WebSocket connections are logged with document IDs

### Testing WebSocket Connection

```javascript
// Test WebSocket endpoint
GET http://localhost:5000/api/v1/ws-info

// Response:
{
  "message": "WebSocket server is running",
  "websocketUrl": "ws://localhost:5000",
  "usage": "Connect to ws://localhost:PORT/document-id?token=JWT_TOKEN"
}
```

## 🚀 Deployment

### Production Deployment

#### 1. Environment Setup

```bash
# Set production environment variables
export NODE_ENV=production
export MONGO_URI="your-production-mongodb-uri"
export JWT_SECRET="your-production-jwt-secret"
export PORT=5000
```

#### 2. Build and Start

```bash
npm install --production
npm start
```

### Docker Deployment (Optional)

```dockerfile
FROM node:18-alpine
WORKDIR /app
COPY package*.json ./
RUN npm install --production
COPY . .
EXPOSE 5000
CMD ["npm", "start"]
```

### Cloud Deployment Options

- **Heroku**: Easy deployment with MongoDB Atlas
- **Digital Ocean**: App Platform with managed MongoDB
- **AWS**: EC2 with DocumentDB or MongoDB Atlas
- **Railway**: Simple deployment with database add-ons

## 🛡️ Security

### Implemented Security Features

- **Password Hashing**: bcryptjs with salt rounds
- **JWT Authentication**: Secure token-based authentication
- **Input Validation**: Mongoose schema validation
- **CORS Protection**: Configurable CORS policies
- **Environment Variables**: Secure configuration management

### Security Best Practices

- Use strong JWT secrets (256-bit minimum)
- Enable HTTPS in production
- Implement rate limiting (recommended)
- Regular dependency updates
- MongoDB connection with authentication

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

### Code Style

- Use ES6+ modules
- Follow Express.js best practices
- Implement proper error handling
- Add JSDoc comments for functions
- Use meaningful variable names

## 📝 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🐛 Troubleshooting

### Common Issues

#### MongoDB Connection Error

```bash
# Check if MongoDB is running
brew services list | grep mongodb  # macOS
sudo systemctl status mongod       # Linux
```

#### WebSocket Connection Failed

- Verify JWT token is valid
- Check document permissions
- Ensure WebSocket server is running on correct port

#### CORS Issues

- Update `CORS_ORIGIN` in `.env` file
- Check frontend URL matches CORS configuration

### Debug Mode

```bash
# Enable debug logging
DEBUG=* npm run dev
```

## 📞 Support

For support, please open an issue on GitHub or contact the development team.

---

**Made with ❤️ by [thejaAshwin62](https://github.com/thejaAshwin62)**

**Collabrix** - Collaborative Document Editing Platform
