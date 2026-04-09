const User = require('../models/User');
const ActivityLog = require('../models/ActivityLog');
const asyncHandler = require('../middleware/asyncHandler');
const { clearUsersCache } = require('../middleware/responseCache');

const parseNumber = (value) => {
  if (value === undefined || value === null) return undefined;
  if (typeof value === 'string' && value.trim() === '') return undefined;
  const parsed = Number(value);
  return Number.isNaN(parsed) ? undefined : parsed;
};

const escapeRegex = (value) => String(value).replace(/[.*+?^${}()|[\]\\]/g, '\\$&');

const logActivity = async ({ action, user }) => {
  await ActivityLog.create({
    action,
    userRef: user?._id || null,
    userName: user?.name || 'Unknown User',
    details: `${action} operation performed for ${user?.email || 'N/A'}`
  });
};

const buildUserFilter = (query) => {
  const {
    name,
    email,
    age,
    ageOperator,
    ageFrom,
    ageTo,
    minAge,
    maxAge,
    hobbies,
    bio
  } = query;

  const filter = {};

  if (name) {
    filter.name = { $regex: name, $options: 'i' };
  }

  if (email) {
    filter.email = email.toLowerCase();
  }

  const parsedAge = parseNumber(age);
  const parsedAgeFrom = parseNumber(ageFrom);
  const parsedAgeTo = parseNumber(ageTo);

  if (ageOperator) {
    if (ageOperator === 'gt' && parsedAgeFrom !== undefined) {
      filter.age = { $gt: parsedAgeFrom };
    }

    if (ageOperator === 'lt' && parsedAgeFrom !== undefined) {
      filter.age = { $lt: parsedAgeFrom };
    }

    if (ageOperator === 'eq' && parsedAgeFrom !== undefined) {
      filter.age = parsedAgeFrom;
    }

    if (ageOperator === 'between' && parsedAgeFrom !== undefined && parsedAgeTo !== undefined) {
      const lower = Math.min(parsedAgeFrom, parsedAgeTo);
      const upper = Math.max(parsedAgeFrom, parsedAgeTo);
      filter.age = { $gte: lower, $lte: upper };
    }

    if (ageOperator === 'outside_between' && parsedAgeFrom !== undefined && parsedAgeTo !== undefined) {
      const lower = Math.min(parsedAgeFrom, parsedAgeTo);
      const upper = Math.max(parsedAgeFrom, parsedAgeTo);
      filter.$or = [{ age: { $lt: lower } }, { age: { $gt: upper } }];
    }
  } else if (parsedAge !== undefined) {
    filter.age = parsedAge;
  } else {
    const parsedMinAge = parseNumber(minAge);
    const parsedMaxAge = parseNumber(maxAge);
    if (parsedMinAge !== undefined || parsedMaxAge !== undefined) {
      filter.age = {};
      if (parsedMinAge !== undefined) filter.age.$gte = parsedMinAge;
      if (parsedMaxAge !== undefined) filter.age.$lte = parsedMaxAge;
    }
  }

  if (hobbies) {
    const hobbiesArray = String(hobbies)
      .split(',')
      .map((item) => item.trim())
      .filter(Boolean);

    if (hobbiesArray.length > 0) {
      filter.hobbies = { $in: hobbiesArray };
    }
  }

  if (bio) {
    filter.$text = { $search: bio };
  }

  return filter;
};

const createUser = asyncHandler(async (req, res) => {
  const { name, email, age, hobbies, bio, userId } = req.body;

  const user = await User.create({
    name,
    email,
    age,
    hobbies,
    bio,
    userId
  });

  await logActivity({ action: 'CREATE', user });
  clearUsersCache();

  res.status(201).json(user);
});

const getUsers = asyncHandler(async (req, res) => {
  const {
    name,
    email,
    age,
    ageOperator,
    ageFrom,
    ageTo,
    minAge,
    maxAge,
    hobbies,
    bio,
    page = 1,
    limit = 10,
    sortBy = 'createdAt',
    order = 'desc'
  } = req.query;

  const filter = buildUserFilter(req.query);

  const pageNumber = Math.max(parseInt(page, 10) || 1, 1);
  const pageSize = Math.min(Math.max(parseInt(limit, 10) || 10, 1), 100);

  const sortDirection = order === 'asc' ? 1 : -1;
  const sort = { [sortBy]: sortDirection };

  const [users, total] = await Promise.all([
    User.find(filter)
      .sort(sort)
      .skip((pageNumber - 1) * pageSize)
      .limit(pageSize),
    User.countDocuments(filter)
  ]);

  const highlightedUsers = users.map((user) => {
    const plainUser = user.toObject();
    if (name) {
      const regex = new RegExp(`(${escapeRegex(name)})`, 'ig');
      plainUser.highlightedName = plainUser.name?.replace(regex, '<mark>$1</mark>') || plainUser.name;
    }
    return plainUser;
  });

  res.json({
    total,
    page: pageNumber,
    limit: pageSize,
    totalPages: Math.ceil(total / pageSize),
    users: highlightedUsers
  });
});

const getUsersPerformance = asyncHandler(async (req, res) => {
  const {
    page = 1,
    limit = 10,
    sortBy = 'createdAt',
    order = 'desc'
  } = req.query;

  const filter = buildUserFilter(req.query);

  const pageNumber = Math.max(parseInt(page, 10) || 1, 1);
  const pageSize = Math.min(Math.max(parseInt(limit, 10) || 10, 1), 100);
  const sortDirection = order === 'asc' ? 1 : -1;
  const sort = { [sortBy]: sortDirection };

  const explain = await User.collection
    .find(filter)
    .sort(sort)
    .skip((pageNumber - 1) * pageSize)
    .limit(pageSize)
    .explain('executionStats');

  res.json({
    message: 'Query performance metrics generated successfully',
    pagination: {
      page: pageNumber,
      limit: pageSize
    },
    executionStats: {
      totalKeysExamined: explain.executionStats?.totalKeysExamined ?? 0,
      totalDocsExamined: explain.executionStats?.totalDocsExamined ?? 0,
      executionTimeMillis: explain.executionStats?.executionTimeMillis ?? 0
    }
  });
});

const getRecommendations = asyncHandler(async (req, res) => {
  const topHobbies = await User.aggregate([
    { $unwind: '$hobbies' },
    { $group: { _id: { $toLower: '$hobbies' }, count: { $sum: 1 } } },
    { $sort: { count: -1 } },
    { $limit: 8 },
    { $project: { _id: 0, hobby: '$_id', count: 1 } }
  ]);

  res.json({ recommendations: topHobbies });
});

const getAnalytics = asyncHandler(async (req, res) => {
  const [hobbies, ages] = await Promise.all([
    User.aggregate([
      { $unwind: '$hobbies' },
      { $group: { _id: { $toLower: '$hobbies' }, count: { $sum: 1 } } },
      { $sort: { count: -1 } },
      { $limit: 10 },
      { $project: { _id: 0, hobby: '$_id', count: 1 } }
    ]),
    User.aggregate([
      {
        $bucket: {
          groupBy: '$age',
          boundaries: [0, 10, 20, 30, 40, 50, 60, 70, 80, 121],
          default: 'unknown',
          output: { count: { $sum: 1 } }
        }
      }
    ])
  ]);

  const ageDistribution = ages
    .filter((item) => item._id !== 'unknown')
    .map((item) => {
      const start = item._id;
      const end = start === 80 ? 120 : start + 9;
      return {
        range: `${start}-${end}`,
        count: item.count
      };
    });

  res.json({
    hobbies,
    ageDistribution
  });
});

const exportUsersCsv = asyncHandler(async (req, res) => {
  const filter = buildUserFilter(req.query);
  const users = await User.find(filter).sort({ createdAt: -1 });

  const rows = [
    ['name', 'email', 'age', 'hobbies', 'bio', 'userId', 'createdAt'].join(',')
  ];

  users.forEach((user) => {
    const row = [
      user.name,
      user.email,
      user.age ?? '',
      (user.hobbies || []).join('|'),
      user.bio || '',
      user.userId,
      user.createdAt ? user.createdAt.toISOString() : ''
    ]
      .map((value) => `"${String(value).replace(/"/g, '""')}"`)
      .join(',');

    rows.push(row);
  });

  res.setHeader('Content-Type', 'text/csv');
  res.setHeader('Content-Disposition', 'attachment; filename="users-export.csv"');
  res.send(rows.join('\n'));
});

const getActivityLogs = asyncHandler(async (req, res) => {
  const limit = Math.min(Math.max(parseInt(req.query.limit, 10) || 50, 1), 200);
  const logs = await ActivityLog.find({}).sort({ createdAt: -1 }).limit(limit);
  res.json({ logs });
});

const updateUser = asyncHandler(async (req, res) => {
  const { id } = req.params;

  const updatedUser = await User.findByIdAndUpdate(id, req.body, {
    new: true,
    runValidators: true
  });

  if (!updatedUser) {
    res.status(404);
    throw new Error('User not found');
  }

  await logActivity({ action: 'UPDATE', user: updatedUser });
  clearUsersCache();

  res.json(updatedUser);
});

const deleteUser = asyncHandler(async (req, res) => {
  const { id } = req.params;

  const deletedUser = await User.findByIdAndDelete(id);

  if (!deletedUser) {
    res.status(404);
    throw new Error('User not found');
  }

  await logActivity({ action: 'DELETE', user: deletedUser });
  clearUsersCache();

  res.json({ message: 'User deleted successfully' });
});

module.exports = {
  createUser,
  getUsers,
  getUsersPerformance,
  getRecommendations,
  getAnalytics,
  exportUsersCsv,
  getActivityLogs,
  updateUser,
  deleteUser
};
