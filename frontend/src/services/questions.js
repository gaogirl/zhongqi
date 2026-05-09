import api from './api';

const questionsAPI = {
  list: (params) => api.get('/questions', { params }),
  practice: (params) => api.get('/questions/practice', { params }),
  check: (answers) => api.post('/questions/check', answers),
  create: (data) => api.post('/questions', data),
  update: (id, data) => api.patch(`/questions/${id}`, data),
  remove: (id) => api.delete(`/questions/${id}`),
  importExcel: (formData) => api.post('/questions/import', formData, {
    headers: { 'Content-Type': 'multipart/form-data' },
  }),
  downloadTemplate: () => api.get('/questions/template', { responseType: 'blob' }),
};

export default questionsAPI;
