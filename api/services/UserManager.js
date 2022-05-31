const jwt = require('jsonwebtoken');
const shortid = require('shortid');
const moment = require('moment');
const farmhash = require('farmhash');

const API_ERRORS = require('../constants/APIErrors');

const LOCK_INTERVAL_SEC = 120;
const LOCK_TRY_COUNT = 5;

const bcrypt = require('bcrypt');

async function checkUserExist(email) {
  try {
    return !!await User.findOne({email});
  } catch (err) {
    return err;
  }
}

async function verifyUser(email, password) {
  try {
    // return !!await User.findOne({email});

    const user = await User.findOne({email: email});
    if (!user) {return {verify: false, err: API_ERRORS.USER_NOT_FOUND};}
    if (user.locked) {return {verify: false, err: API_ERRORS.USER_LOCKED};}

    bcrypt
			.compare(password, user.encryptedPassword)
			.then(isValid => {
			  if (!isValid) {
			    updateUserLockState(user, saveErr => {
			      if (saveErr) {return {verify: false, err: saveErr};}
			    });
			    return {verify: false, err: API_ERRORS.INVALID_EMAIL_PASSWORD};
			  }
			  else {
			    UserManager._generateUserToken(user, token => {
			      return resolve({user, token});
			    });
			  }
			})
			.catch(err => {
			  return {verify: false, err: err};
			});
  } catch (err) {
    return err;
  }
}

function updateUserLockState(user, done) {
  const now = moment().utc();

  let prevFailure = null;
  if (user.lastPasswordFailure) {
    prevFailure = moment(user.lastPasswordFailure);
  }

  if (prevFailure !== null && now.diff(prevFailure, 'seconds') < LOCK_INTERVAL_SEC) {
    user.passwordFailures += 1;

    // lock if this is the 4th incorrect attempt
    if (user.passwordFailures >= LOCK_TRY_COUNT) {
      user.locked = true;
    }
  }
  else {
    // reset the failed attempts
    user.passwordFailures = 1;
  }

  user.lastPasswordFailure = now.toDate();
  console.log(user);
  user.save(done);
}

// Cuong
//const bcrypt = require('bcrypt');

// function generatePasswordHash(password) {
//   return bcrypt.genSalt(10) // 10 is default
//         .then((salt) => {
//           return bcrypt.hash(password, salt);
//         })
//         .then(hash => {
//           return Promise.resolve(hash);
//         });
// }

module.exports = {

  /**
	 * Generates JWT token
	 * TODO Promisify
	 * @param user
	 * @param done
	 * @returns {*}
	 * @private
	 */
  _generateUserToken: function (user) {

    // Password hash helps to invalidate token when password is changed
    const passwordHash = farmhash.hash32(user.encryptedPassword);

    const payload = {
      id: user.id,
      pwh: passwordHash
    };

    return jwt.sign(
			payload,
			sails.config.custom.jwt_secret,
			{
			  expiresIn: '24h'	// 24 hours
			}
    );
  },


  /**
	 * Generate user
	 * @returns {Promise}
	 * @param user
	 */
  _generateUser(user) {
    return new Promise((resolve, reject) => {
      User
				.create(user)
				.exec((createErr, data) => {
				  console.log('_generateUser', data);
				  if (createErr) {return reject(createErr);}
				  return resolve(data);
				});
    });
  },


  /**
	 * Validates user password
	 * @param email
	 * @param password
	 * @returns {Promise}
	 */
  validatePassword(email, password) {
    return new Promise((resolve, reject) => {
      User
				.findOne({email: email})
				.exec((err, user) => {
				  if (err) {return reject(err);}
				  if (!user) {return reject(API_ERRORS.USER_NOT_FOUND);}
				  if (user.locked) {return reject(API_ERRORS.USER_LOCKED);}
				  // Cuong them vao
				   bcrypt.compare(password, user.encryptedPassword)
				  							.then(isValid=> {
												  if (isValid) {
													return resolve({isValid: true, user});
												  }
												  else {
													{return reject(API_ERRORS.INVALID_PASSWORD);}
												  }
											  });
				//   if (generatePasswordHash(password)==user.encryptedPassword) {return reject(API_ERRORS.INVALID_PASSWORD);}
				//   //
				//   return resolve({isValid: true, user});
				});
    });
  },


  /**
	 * Creates a new user
	 * @param values
	 * @returns {Promise}
	 */
  createUser: async (values) => {
    const email = values.email;
    if (await checkUserExist(email)) {return {success: false, err: API_ERRORS.EMAIL_IN_USE};}

    try {
      const user = await User.create(values).fetch();
      if (!user) {return {success: false, err: API_ERRORS.SERVER_ERROR};}

      const token = UserManager._generateUserToken(user);
      if (!token) {return {success: false, err: API_ERRORS.SERVER_ERROR};}

      // EmailService.sendWelcome(email);
      return {success: true, data: {user, token}};
    } catch (err) {
      return {success: false, err: err.message};
    }
  },


  /**
	 * Authenticates user by a JWT token.
	 *
	 * Uses in JWT Policy
	 * @see api/policies/jwtAuth.js
	 *
	 * @param token
	 * @returns {Promise}
	 */
  authenticateUserByToken: function (token) {
    return new Promise((resolve, reject) => {
      jwt.verify(token, sails.config.custom.jwt_secret, {}, (err, tokenData) => {
        if (err) {return reject(err);} // JWT parse error

        User
					.findOne({id: tokenData.id})
					.exec((err, user) => {
					  if (err) {return reject(err);} // Query error
					  if (!user) {return reject(API_ERRORS.USER_NOT_FOUND);}
					  if (user.locked) {return reject(API_ERRORS.USER_LOCKED);}

					  const passwordHash = farmhash.hash32(user.encryptedPassword);
					  if (tokenData.pwh !== passwordHash) { // Old token, built with inactive password
					    return reject(API_ERRORS.INACTIVE_TOKEN);
					  }
					  return resolve(user);
					});
      });
    });
  },


  /**
	 * Authenticates user by email and password.
	 * @param email
	 * @param password
	 * @returns {Promise}
	 */
  authenticateUserByPassword: function (email, password) {
    return new Promise((resolve, reject) => {
      UserManager
				.validatePassword(email, password)
				.then(({isValid, user}) => {
				  bcrypt.compare(password, user.encryptedPassword)
						.then(isValid => {
						  if (!isValid) {
						    console.log('Authentica::::', user);
						    try {
						      updateUserLockState(user, saveErr => {
						        if (saveErr) {return reject(saveErr);}
								  });
						    } catch (error) {

						    }

						    return reject(API_ERRORS.INVALID_EMAIL_PASSWORD);
						  }
						  else {
						    const token = UserManager._generateUserToken(user);
						    return resolve({user, token});
						  }
						})
						.catch(reject);
				})
				.catch(reject);
    });
  },


  /**
	 * Generates password reset token
	 * @param email
	 * @returns {Promise}
	 */
  generateResetToken: function (email) {
    return new Promise((resolve, reject) => {
      User
				.findOne({email})
				.exec((err, user) => {
				  if (err) {return reject(err);} // Query error
				  if (!user) {return reject(API_ERRORS.USER_NOT_FOUND);}

				  const resetToken = shortid.generate();
				  user.resetToken = resetToken;
				  user.save(saveErr => {
				    if (saveErr) {return reject(saveErr);}

				    EmailService.sendResetToken(email, resetToken);
				    resolve();
				  });
				});
    });
  },


  /**
	 * Changes password
	 * @param email
	 * @param currentPassword
	 * @param newPassword
	 * @returns {Promise}
	 */
  changePassword: function (email, currentPassword, newPassword) {
    return new Promise((resolve, reject) => {
      UserManager
				.validatePassword(email, currentPassword)
				.then(({isValid, user}) => {
				  if (!isValid) {
				    return reject(API_ERRORS.INVALID_PASSWORD);
				  }
				  else {
				    User
							.setPassword(user, newPassword)
							.then(async (patchedUser) => {
							  patchedUser.resetToken = null;
							  patchedUser.passwordFailures = 0;
							  patchedUser.lastPasswordFailure = null;
							  //changePasswordUser.save();
							 let updatedUser = await User.updateOne({id: patchedUser.id}).set({encryptedPassword: patchedUser.encryptedPassword});

							  //   UserManager._generateUserToken(updatedUser, token => {
							  //     resolve(token);
							  //   });
							  const token = UserManager._generateUserToken(updatedUser);
						      return resolve({updatedUser, token});
							})
							.catch(reject);
				  }
				})
				.catch(reject);
    });
  },

  /**
	 * update User
	 * @param user
	 * @param newPassword
	 * @param updateInfo
	 * @returns {Promise}
	 */
  updateUser: function (user, newPassword, updateInfo = {}) {
    return new Promise((resolve, reject) => {
      if(newPassword) {
        User.setPassword(user, newPassword).then(async (patchedUser) => {
          patchedUser.resetToken = null;
          patchedUser.passwordFailures = 0;
		  patchedUser.lastPasswordFailure = null;
		  let updatedata =  Object.assign({
            encryptedPassword: patchedUser.encryptedPassword
		  }, updateInfo);
          let updatedUser = await User.updateOne({id: patchedUser.id}).set(updatedata);
          const token = UserManager._generateUserToken(updatedUser);
          return resolve({updatedUser, token});
        }).catch(reject);
      } else {
        User.updateOne({id: user.id}).set(updateInfo).then(
			updatedUser => {
			  return resolve({updatedUser});
			}
        ).catch(reject);
	  }
    });
  },

  /**
	 * Resets password to a new one by reset token.
	 * @param email
	 * @param resetToken
	 * @param newPassword
	 * @returns {Promise}
	 */
  resetPasswordByResetToken: function (email, resetToken, newPassword) {
    return new Promise((resolve, reject) => {
      User
				.findOne({email, resetToken})
				.exec((err, user) => {
				  if (err) {return reject(err);} // Query error
				  if (!user) {return reject(API_ERRORS.USER_NOT_FOUND);}

				  // TODO Check reset token validity

				  user
						.setPassword(newPassword)
						.then(() => {
						  user.resetToken = null;
						  user.passwordFailures = 0;
						  user.lastPasswordFailure = null;
						  user.save();

						  resolve();
						})
						.catch(reject);
				});
    });
  }
};
