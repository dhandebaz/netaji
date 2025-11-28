# Neta - Known Issues and Future Upgrades

**Status**: This document covers limitations of Fast Mode development and features that require deeper architectural changes for production scalability.

**Target for**: Future development in Autonomous Mode or with larger development cycles.

---

## 🔴 CRITICAL ISSUES REQUIRING FIXES

### 1. **Real-Time Sync Reliability (Event Bus Limitations)**
**Current Status**: Using Window.dispatchEvent for in-browser sync
**Issue**: Events only work within the same browser tab. Multi-tab sync is not supported.
**Impact**: If a user opens the app in multiple tabs, changes in one tab won't sync to other tabs.
**Solution Required**:
- [ ] Implement WebSocket server for true real-time sync across all users
- [ ] Add Server-Sent Events (SSE) for real-time updates
- [ ] Database change triggers to broadcast updates to all connected clients
- [ ] Test with 100+ concurrent users

**Code Locations**:
- `services/eventBus.ts` - Current event bus using window.dispatchEvent
- `services/dataService.ts` - dataSyncEvents object (lines 47-54)
- `pages/Home.tsx` - Consumer of events (line 18)

---

### 2. **Politician Data Storage - Scalability Bottleneck**
**Current Status**: Using JSON file (`data.json`) for persistence
**Issue**: File-based storage doesn't scale past ~100k users. No concurrent write safety.
**Impact**: Data corruption risk under high load. No proper transaction handling.
**Solution Required**:
- [ ] Migrate to PostgreSQL (already in Replit infrastructure)
- [ ] Implement proper database migrations using ORM (Prisma or TypeORM)
- [ ] Add transaction support for multi-step operations
- [ ] Implement database connection pooling
- [ ] Add proper error handling and rollback mechanisms

**Code Locations**:
- `server.js` - getData() and saveData() functions (lines 30-55)
- `data.json` - Raw file storage

**Migration Steps**:
```bash
# 1. Create Replit PostgreSQL database
# 2. Set DATABASE_URL env var
# 3. Create Prisma schema for all tables
# 4. Run migrations
# 5. Add data validation layer
# 6. Test with concurrent operations
```

---

### 3. **Authentication - Not Production Ready**
**Current Status**: JWT with demo credentials and random secret
**Issues**:
- [ ] JWT_SECRET is randomly generated if not in environment (line 48 in server.js) - insecure!
- [ ] Demo credentials stored in code (admin@neta.app/admin123) - must be removed
- [ ] No password reset mechanism
- [ ] No session management or token refresh rotation
- [ ] No rate limiting on login attempts (brute force vulnerability)
- [ ] No email verification for new users

**Security Fixes Needed**:
```typescript
// server.js - Around line 48
if (!process.env.JWT_SECRET) {
  console.error('[Auth] ERROR: JWT_SECRET must be set in environment!');
  process.exit(1);
}

// Remove demo credentials from production
const users = loadFromDatabase(); // Not hardcoded
```

**Code Locations**:
- `server.js` lines 40-100 - Auth endpoints
- `context/AuthContext.tsx` - Frontend auth logic
- `.env.example` - Should document required vars

---

### 4. **AI Integration - Error Handling Gap**
**Current Status**: Multi-provider AI with fallback
**Issues**:
- [ ] No rate limiting on AI requests (expensive API calls)
- [ ] API key validation happens at request time, not startup
- [ ] No request caching (repeated queries hit API multiple times)
- [ ] No cost tracking/limiting per user
- [ ] Error messages leak provider details to frontend

**Code Locations**:
- `services/aiApiService.ts` - AI request handling
- `pages/admin/AdminAIChatbot.tsx` - AI chat component
- `server.js` lines 330-370 - AI endpoints

**Improvements**:
```typescript
// Add request caching
const aiResponseCache = new Map<string, { data: any; timestamp: number }>();
const CACHE_DURATION = 24 * 60 * 60 * 1000; // 24 hours

// Add rate limiting
import rateLimit from 'express-rate-limit';
const aiLimiter = rateLimit({
  windowMs: 60 * 1000, // 1 minute
  max: 10 // 10 requests per minute per IP
});
app.post('/api/ai/chat', aiLimiter, handleAIChat);
```

---

## 🟡 MAJOR FEATURES FOR NEXT VERSION

### 5. **External Database Support (cPanel Deployment)**
**Current Status**: Hardcoded to use Replit's PostgreSQL
**Requirement**: User's original requirement - "work on shared hosting with external database"
**Status**: NOT IMPLEMENTED YET
**Impact**: App cannot deploy on cPanel/shared hosting

**Solution Required**:
- [ ] Add database abstraction layer to support multiple databases:
  - PostgreSQL (current)
  - MySQL (for cPanel/shared hosting)
  - SQLite (for lightweight deployments)
- [ ] Create database configuration system in `services/databaseAdapter.ts`
- [ ] Implement connection string parsing
- [ ] Test with 3+ database engines

**Implementation**:
```typescript
// services/databaseAdapter.ts
interface DatabaseAdapter {
  connect(): Promise<void>;
  query(sql: string, params: any[]): Promise<any>;
  transaction(callback: () => Promise<void>): Promise<void>;
}

export function getAdapter(): DatabaseAdapter {
  const dbType = process.env.DATABASE_TYPE || 'postgres';
  switch(dbType) {
    case 'mysql': return new MySQLAdapter();
    case 'sqlite': return new SQLiteAdapter();
    default: return new PostgreSQLAdapter();
  }
}
```

---

### 6. **User Authentication & Role-Based Access Control**
**Current Status**: Basic JWT with hardcoded roles
**Missing Features**:
- [ ] User registration/signup flow
- [ ] Email verification
- [ ] Password reset mechanism
- [ ] Two-factor authentication (2FA)
- [ ] OAuth2 support (Google, GitHub login)
- [ ] User profile management
- [ ] Proper session management with refresh tokens

**Code Locations**:
- `context/AuthContext.tsx` - Frontend auth (very basic)
- `server.js` - Backend auth endpoints

---

### 7. **Admin Panel - Limited Functionality**
**Current Status**: UI is complete but backend integration incomplete
**Missing**:
- [ ] Real-time notifications about user activities
- [ ] Batch operations (delete multiple, bulk update)
- [ ] Advanced filtering and search
- [ ] Export data to CSV/Excel
- [ ] Audit logs for all admin actions
- [ ] Role-specific dashboards (Developer, Analyst roles)

---

### 8. **Data Persistence & Backup Strategy**
**Current Status**: Single file (`data.json`), no backups
**Missing**:
- [ ] Automatic daily backups
- [ ] Backup encryption
- [ ] Disaster recovery plan
- [ ] Data versioning/rollback capability
- [ ] Database replication for high availability

---

### 9. **API Documentation & Versioning**
**Current Status**: Endpoints exist but no formal documentation
**Missing**:
- [ ] OpenAPI/Swagger documentation
- [ ] API rate limiting per user/IP
- [ ] Pagination for large datasets
- [ ] API versioning strategy (v1, v2, etc.)
- [ ] Deprecation warnings for old endpoints

---

### 10. **Testing Framework**
**Current Status**: No automated tests
**Missing**:
- [ ] Unit tests for services (Jest)
- [ ] Integration tests for API endpoints
- [ ] E2E tests for user flows (Cypress/Playwright)
- [ ] Load testing (simulate 1000+ concurrent users)
- [ ] Security testing (OWASP compliance)

---

### 11. **Monitoring & Logging**
**Current Status**: Console logs only
**Missing**:
- [ ] Centralized logging (Winston, Bunyan)
- [ ] Error tracking (Sentry)
- [ ] Performance monitoring (APM)
- [ ] Health check endpoints
- [ ] Database query performance monitoring

---

### 12. **Frontend Performance Optimization**
**Current Status**: Build size is good (53KB gzipped) but room for improvement
**Missing**:
- [ ] Code splitting by route
- [ ] Image optimization and lazy loading
- [ ] Virtual scrolling for large lists
- [ ] Service worker for offline support
- [ ] CSS optimization (unused selectors removal)

---

## 🟢 QUICK WINS (Low Effort, High Impact)

### Add These in Next Iteration:

1. **Environment Variables Documentation**
   ```bash
   # Create .env.local in project root
   JWT_SECRET=your-secure-random-string-here
   DATABASE_URL=your-database-connection-string
   VITE_API_URL=http://localhost:3001/api
   ```

2. **Error Boundary Enhancement**
   - Add retry logic for failed API calls
   - Better error messages for users
   - Error reporting to admin panel

3. **Politician Data Validation**
   - Verify all required fields are present
   - Sanitize HTML/script content
   - Image URL validation

4. **Complaint Moderation**
   - Auto-detection of inappropriate language
   - Spam detection
   - Profanity filtering

5. **Performance Metrics**
   - Add Lighthouse CI for build quality
   - Monitor bundle size in CI/CD
   - Performance budget tracking

---

## 📋 DEPLOYMENT CHECKLIST FOR PRODUCTION

Before deploying to production, ensure:

- [ ] PostgreSQL database is set up and accessible
- [ ] JWT_SECRET is set to a secure random value (use `node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"`)
- [ ] All demo credentials are removed/replaced
- [ ] CORS is properly configured for your domain
- [ ] HTTPS is enforced
- [ ] Rate limiting is enabled on sensitive endpoints
- [ ] Logging is configured (not just console.log)
- [ ] Error tracking (Sentry) is configured
- [ ] Backups are automated
- [ ] Health check endpoint returns 200 OK
- [ ] Load testing passed (simulate 100+ concurrent users)
- [ ] Security audit completed
- [ ] GDPR compliance verified
- [ ] Terms of Service and Privacy Policy are in place

---

## 🔐 SECURITY AUDIT NEEDED

**Critical Security Items Not Addressed**:

1. **SQL Injection Prevention** - Currently using file storage, but needed for database migration
2. **CSRF Token Validation** - Not implemented on form submissions
3. **XSS Protection** - User inputs not properly sanitized
4. **Rate Limiting** - No protection against brute force or DDoS
5. **HTTPS Enforcement** - Not forced in production
6. **Secure Headers** - Missing CSP, X-Frame-Options, etc.
7. **API Authentication** - Some endpoints may not require proper auth

---

## 📊 SCALABILITY ROADMAP

### Phase 1: Foundation (Current - Q4 2024)
- ✅ Event bus system working
- ✅ Basic CRUD operations
- ✅ JWT authentication
- ⏳ **TO DO**: Database migration from JSON to PostgreSQL

### Phase 2: Stability (Q1 2025)
- [ ] WebSocket real-time sync
- [ ] Comprehensive testing
- [ ] Error handling improvements
- [ ] Performance optimization

### Phase 3: Features (Q2 2025)
- [ ] User registration/email verification
- [ ] Advanced search and filtering
- [ ] Analytics dashboard
- [ ] Mobile app (React Native)

### Phase 4: Scale (Q3 2025+)
- [ ] Microservices architecture
- [ ] Horizontal scaling with load balancing
- [ ] CDN for static assets
- [ ] Data replication and disaster recovery

---

## 💡 TECHNICAL DEBT

**Code Improvements Needed**:

1. **Type Safety**: Some `any` types in claims system (line 585-606 in dataService.ts)
2. **Error Handling**: Generic error messages, no specific error codes
3. **Code Duplication**: Similar API calls in multiple places (extract to utility)
4. **Constants**: Magic strings for event names (use enum)
5. **Unused Code**: Old scraper functions that could be cleaned up

---

## 📞 NEXT STEPS FOR PRODUCTION

1. **Week 1-2**: Database migration (JSON → PostgreSQL)
2. **Week 3-4**: Authentication system (password reset, email verification)
3. **Week 5-6**: WebSocket real-time sync
4. **Week 7-8**: Comprehensive testing and security audit
5. **Week 9**: Performance optimization and monitoring setup
6. **Week 10+**: Deploy to production

---

## 🤝 CONTRIBUTING

When implementing these improvements:
- Follow existing code patterns
- Add tests for new features
- Update documentation
- Consider performance impact
- Review security implications
- Test with production-like data volumes

---

**Last Updated**: November 27, 2025  
**Status**: Ready for external database deployment  
**Next Reviewer**: Next development team/phase  
**Estimated Effort**: 4-6 weeks for all items
