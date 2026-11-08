const request = require('supertest');
const app = require('../src/app');
require('./setup');

describe('Document API & IDOR Security', () => {
  let token1;
  let user1Id;
  let token2;
  let user2Id;

  beforeEach(async () => {
    // Create User 1
    const res1 = await request(app).post('/api/auth/register').send({
      name: 'User One',
      email: 'user1@example.com',
      password: 'Password123!',
    });
    token1 = res1.body.data.token;
    user1Id = res1.body.data.user.id;

    // Create User 2
    const res2 = await request(app).post('/api/auth/register').send({
      name: 'User Two',
      email: 'user2@example.com',
      password: 'Password123!',
    });
    token2 = res2.body.data.token;
    user2Id = res2.body.data.user.id;
  });

  describe('Document CRUD', () => {
    it('should allow user to create a new document', async () => {
      const res = await request(app)
        .post('/api/documents')
        .set('Authorization', `Bearer ${token1}`)
        .field('documentType', 'PASSPORT')
        .field('documentName', 'My Indian Passport')
        .field('documentNumber', 'Z1234567')
        .field('expiryDate', '2030-05-15');

      expect(res.status).toBe(201);
      expect(res.body.success).toBe(true);
      expect(res.body.data.document.documentName).toBe('My Indian Passport');
      expect(res.body.data.document.status).toBe('ACTIVE');
      expect(res.body.data.document.userId).toBe(user1Id);
    });

    it('should list only documents belonging to authenticated user', async () => {
      // User 1 creates a doc
      await request(app)
        .post('/api/documents')
        .set('Authorization', `Bearer ${token1}`)
        .field('documentType', 'PASSPORT')
        .field('documentName', 'User 1 Passport');

      // User 2 creates a doc
      await request(app)
        .post('/api/documents')
        .set('Authorization', `Bearer ${token2}`)
        .field('documentType', 'DRIVING_LICENCE')
        .field('documentName', 'User 2 License');

      // User 1 gets docs
      const res1 = await request(app)
        .get('/api/documents')
        .set('Authorization', `Bearer ${token1}`);

      expect(res1.status).toBe(200);
      expect(res1.body.data.length).toBe(1);
      expect(res1.body.data[0].documentName).toBe('User 1 Passport');
    });

    it('should archive and restore a document', async () => {
      const createRes = await request(app)
        .post('/api/documents')
        .set('Authorization', `Bearer ${token1}`)
        .field('documentType', 'PUC')
        .field('documentName', 'Vehicle PUC');

      const docId = createRes.body.data.document._id;

      // Archive
      const archiveRes = await request(app)
        .patch(`/api/documents/${docId}/archive`)
        .set('Authorization', `Bearer ${token1}`);

      expect(archiveRes.status).toBe(200);
      expect(archiveRes.body.data.document.isArchived).toBe(true);
      expect(archiveRes.body.data.document.status).toBe('ARCHIVED');

      // Restore
      const restoreRes = await request(app)
        .patch(`/api/documents/${docId}/restore`)
        .set('Authorization', `Bearer ${token1}`);

      expect(restoreRes.status).toBe(200);
      expect(restoreRes.body.data.document.isArchived).toBe(false);
      expect(restoreRes.body.data.document.status).toBe('ACTIVE');
    });
  });

  describe('IDOR / Authorization Security', () => {
    let user1DocId;

    beforeEach(async () => {
      const res = await request(app)
        .post('/api/documents')
        .set('Authorization', `Bearer ${token1}`)
        .field('documentType', 'PASSPORT')
        .field('documentName', 'Confidential User 1 Passport');

      user1DocId = res.body.data.document._id;
    });

    it('should PREVENT User 2 from reading User 1 document (IDOR Protection)', async () => {
      const res = await request(app)
        .get(`/api/documents/${user1DocId}`)
        .set('Authorization', `Bearer ${token2}`);

      expect(res.status).toBe(403);
      expect(res.body.success).toBe(false);
      expect(res.body.message).toContain('permission');
    });

    it('should PREVENT User 2 from updating User 1 document', async () => {
      const res = await request(app)
        .put(`/api/documents/${user1DocId}`)
        .set('Authorization', `Bearer ${token2}`)
        .field('documentName', 'Hacked Passport Name');

      expect(res.status).toBe(403);
      expect(res.body.success).toBe(false);
    });

    it('should PREVENT User 2 from deleting User 1 document', async () => {
      const res = await request(app)
        .delete(`/api/documents/${user1DocId}`)
        .set('Authorization', `Bearer ${token2}`);

      expect(res.status).toBe(403);
      expect(res.body.success).toBe(false);

      // Verify doc still exists for User 1
      const checkRes = await request(app)
        .get(`/api/documents/${user1DocId}`)
        .set('Authorization', `Bearer ${token1}`);
      expect(checkRes.status).toBe(200);
    });
  });
});
