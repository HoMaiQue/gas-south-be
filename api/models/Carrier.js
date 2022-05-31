/**
 * Carrier.js
 *
 * @description :: A model definition represents a database table/collection.
 * @docs        :: https://sailsjs.com/docs/concepts/models-and-orm/models
 */

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

    email: {
      type: 'string',
      required: true,
      unique: true
    },

    avatar: {
      type: 'string'
    },

    phone: {
      type: 'string',
    },

    address: {
      type: 'string',
    },

    role: {
      type: 'string',
      defaultsTo: 'user'
    },

    locked: {
      type: 'boolean',
      defaultsTo: false
    },

    passwordFailures: {
      type: 'number',
      defaultsTo: 0
    },

    lastPasswordFailure: {
      type: 'string',
      columnType: 'datetime'
    },

    allowReport: {
      type: 'boolean',
      defaultsTo: true
    },

    resetToken: {
      type: 'string'
    },

    // userType: {
    //   type: 'string',
    //   isIn: ['SuperAdmin', 'Government', 'Factory', 'Region', 'Station', 'Fixer', 'General', 'Agency', 'Normal'],
    //   defaultsTo: 'Normal'
    // },

    // userRole: {
    //   type: 'string',
    //   isIn: ['SuperAdmin', 'Owner', 'Staff', 'Deliver', 'Inspector'],
    //   defaultsTo: 'SuperAdmin'
    // },

    LAT: {
      type: 'number'
    },
    LNG: {
      type: 'number'
    },

    encryptedPassword: {
      type: 'string'
    },

    staffs: {
      collection: 'user'
    },

    relations: {
      collection: 'user'
    },

    

    code: {
      type: 'string',
      required: true,
      unique: true
    },

    name: {
      type: 'string',
      required: true,
    },

    driverNumber: {
      type: 'string',
    },

    userId: {
      model: 'user'
    },

    // ---
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
    playerID: {
      type: 'string'
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
  
  
    /**
       * Encrypt password before creating a User
       * @param values
       * @param next
       */
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
  
  

};

