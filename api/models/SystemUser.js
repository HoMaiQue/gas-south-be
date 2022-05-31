
const bcrypt = require('bcrypt');

function generatePasswordHash(password) {
  return bcrypt.genSalt(10) // 10 is default
        .then((salt) => {
          return bcrypt.hash(password, salt);
        })
        .then(hash => {
          return Promise.resolve(hash);
        });
}

module.exports = {
    attributes: {
        username: {
            type: 'string'
        },

        password: {
            type: 'string'
        },

        status: {
            type: 'number',
            isIn: [1, 2 , 3]
        },

        fullname: {
            type: 'string'
        },

        birthday: {
            type: 'string',
            columnType: 'datetime',
        },

        address: {
            type: 'string',
        },

        mobile: {
            type: 'string'
        },

        email: {
            type: 'string'
        },

        sex: {
            type: 'number',
            isIn: [1, 2 , 3]
        },

        userTypeId: {
            model: 'usertype'
        },

        loginFailedCount: {
            type: 'number'
        },

        profileimage: {
            type: 'string'
        },

        isDeleted: {
            type: 'boolean',
            defaultsTo: false,
        },
      
        createdBy: {
            model: 'user',
        },
      
        updatedBy: {
            model: 'user',
        },
      
        deletedBy: {
            model: 'user',
        },
      
        createdAt: {
            type: 'string',
            columnType: 'datetime',
            autoCreatedAt: true,
        },
      
        updatedAt: {
            type: 'string',
            columnType: 'datetime',
        },
      
        deletedAt: {
            type: 'string',
            columnType: 'datetime',
        },
    },

     /**
     * Validates user password with stored password hash
     * @param password
     * @returns {Promise}
     */
  validatePassword: function (password) {
    return bcrypt.compare(password, this.toObject().encryptedPassword);
  },


  /**
     * Set user password
     * @param password
     * @returns {Promise}
     */
  setPassword: function (user, password) {
    return generatePasswordHash(password)
            .then(hash => {
              user.encryptedPassword = hash;
              return user;
            });
    //return user;
  },

    // setPasswordHash: function (password) {
    //     return bcrypt.genSalt(10) // 10 is default
    //     .then((salt) => {
    //         return bcrypt.hash(password, salt);
    //     })
    //     .then(hash => {
    //         return Promise.resolve(hash);
    //     });
    // },

    // validatePassword: function (confirmpassword, password) {
    //     return bcrypt.compare(confirmpassword, password);
    // },
    
    beforeCreate: function (values, next) {
        generatePasswordHash(values.password)
                .then(hash => {
                  delete(values.password);
                  values.encryptedPassword = hash;
                  next();
                })
                .catch(err => {
                  /* istanbul ignore next */
                  next(err);
                });
      }
}