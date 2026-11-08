import api from './api';

export const documentService = {
  async getDocuments(params = {}) {
    const res = await api.get('/documents', { params });
    return res;
  },

  async getDocumentById(id) {
    const res = await api.get(`/documents/${id}`);
    return res.data.document;
  },

  async createDocument(formData) {
    const res = await api.post('/documents', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
    return res.data.document;
  },

  async updateDocument(id, formData) {
    const res = await api.put(`/documents/${id}`, formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
    return res.data.document;
  },

  async deleteDocument(id) {
    const res = await api.delete(`/documents/${id}`);
    return res;
  },

  async archiveDocument(id) {
    const res = await api.patch(`/documents/${id}/archive`);
    return res.data.document;
  },

  async restoreDocument(id) {
    const res = await api.patch(`/documents/${id}/restore`);
    return res.data.document;
  },

  async getStats() {
    const res = await api.get('/documents/stats');
    return res.data;
  },

  async processOcr(file) {
    const formData = new FormData();
    formData.append('file', file);
    const res = await api.post('/documents/ocr', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
    return res.data;
  },
};
