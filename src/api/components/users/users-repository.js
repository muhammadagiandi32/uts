const { User } = require('../../../models');

/**
 * Get a list of users
 * @returns {Promise}
 */
async function getUsers(offset, limit, sortQuery, searchQuery) {
  let sortCriteria = {};
  let searchCriteria = {};

  // Cek apakah ada query sort
  if (sortQuery) {
    const [field, order] = sortQuery.split(':');
    // Pastikan field name adalah email atau name
    if (field === 'email' || field === 'name') {
        sortCriteria[field] = order && order.trim() === 'asc' ? 1 : -1;
    }
  }

  // Cek apakah ada query search
  if (searchQuery) {
    const [field, key] = searchQuery.split(':');
    // Pastikan field name adalah email atau name
    if (field === 'email' || field === 'name') {
      searchCriteria[field] = { $regex: key, $options: 'i' };
    }
  }
  
  // Dapatkan total pengguna
  const totalUsers = await User.countDocuments(searchCriteria);

  // Hitung total halaman
  const totalPages = Math.ceil(totalUsers / limit);

  // Dapatkan pengguna untuk halaman dan batas yang diberikan
  const users = await User.find(searchCriteria).skip(offset).limit(limit).sort(sortCriteria);

  // Buat respons sesuai dengan format yang diinginkan
  const response = {
    page_number: Math.ceil(offset / limit) + 1,
    page_size: limit,
    count: users.length,
    total_pages: totalPages,
    has_previous_page: offset > 0,
    has_next_page: offset + limit < totalUsers,
    data: users.map(user => ({
      id: user.id,
      name: user.name,
      email: user.email,
    }))
  };

  return response;
  
  // const users = await User.find(searchCriteria).skip(offset).limit(limit).sort(sortCriteria);
  // return users;
}

/**
 * Get user detail
 * @param {string} id - User ID
 * @returns {Promise}
 */
async function getUser(id) {
  return User.findById(id);
}

/**
 * Create new user
 * @param {string} name - Name
 * @param {string} email - Email
 * @param {string} password - Hashed password
 * @returns {Promise}
 */
async function createUser(name, email, password) {
  return User.create({
    name,
    email,
    password,
  });
}

/**
 * Update existing user
 * @param {string} id - User ID
 * @param {string} name - Name
 * @param {string} email - Email
 * @returns {Promise}
 */
async function updateUser(id, name, email) {
  return User.updateOne(
    {
      _id: id,
    },
    {
      $set: {
        name,
        email,
      },
    }
  );
}

/**
 * Delete a user
 * @param {string} id - User ID
 * @returns {Promise}
 */
async function deleteUser(id) {
  return User.deleteOne({ _id: id });
}

/**
 * Get user by email to prevent duplicate email
 * @param {string} email - Email
 * @returns {Promise}
 */
async function getUserByEmail(email) {
  return User.findOne({ email });
}

/**
 * Update user password
 * @param {string} id - User ID
 * @param {string} password - New hashed password
 * @returns {Promise}
 */
async function changePassword(id, password) {
  return User.updateOne({ _id: id }, { $set: { password } });
}

module.exports = {
  getUsers,
  getUser,
  createUser,
  updateUser,
  deleteUser,
  getUserByEmail,
  changePassword,
};
