const express = require('express');
const {
  createUser,
  getUsers,
  getUsersPerformance,
  getRecommendations,
  getAnalytics,
  exportUsersCsv,
  getActivityLogs,
  updateUser,
  deleteUser
} = require('../controllers/userController');
const { cacheGetUsers } = require('../middleware/responseCache');

const router = express.Router();

router.get('/recommendations', getRecommendations);
router.get('/analytics', getAnalytics);
router.get('/performance', getUsersPerformance);
router.get('/export/csv', exportUsersCsv);
router.get('/logs', getActivityLogs);

router.route('/').post(createUser).get(cacheGetUsers(), getUsers);
router.route('/:id').put(updateUser).delete(deleteUser);

module.exports = router;
