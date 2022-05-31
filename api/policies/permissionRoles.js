/**
 * Permission Roles Policy
 *
 * @module      :: Policy
 * @description :: Policy to filter data via authorization token
 * @docs        :: http://sailsjs.org/#!/documentation/concepts/Policies
 *
 */

const API_ERRORS = require('../constants/APIErrors');
const TOKEN_RE = /^Bearer$/i;

module.exports = function (req, res, next) {
	// let token = null;
	//
	// if (req.headers && req.headers.authorization) {
	// 	const parts = req.headers.authorization.split(' ');
	// 	if (parts.length === 2) {
	// 		const scheme = parts[0];
	// 		const credentials = parts[1];
	//
	// 		if (TOKEN_RE.test(scheme)) {
	// 			token = credentials;
	// 		}
	// 	}
	// } else {
	// 	return res.badRequest(Utils.jsonErr('No Authorization header was found'));
	// }
	//
	// if (!token) {
	// 	return res.badRequest(Utils.jsonErr('Format is "Authorization: Bearer [token]"'));
	// }

	console.log('Permission Roles Policy')
	console.log(req.options.action.split('/'))
/*
	// req.options.where.in = req.session.user.id;
	switch (req.options.action.split('/')[1]) {
		case 'find':
			if(req.userInfo.userType !== 'SuperAdmin' && req.userInfo.userType !== 'Government')
				return res.badRequest(Utils.jsonErr(API_ERRORS.ROLE_RESTRICT))
			break
		default:
			break
	}*/
	next()

	// UserManager
	// 	.authenticateUserByToken(token)
	// 	.then(user => {
	// 		// req.userInfo = user.customToJSON();
	// 		req.userInfo = user;
	// 		next();
	// 	})
	// 	.catch(err => {
	// 		switch (err) {
	// 			case API_ERRORS.INACTIVE_TOKEN:
	// 			case API_ERRORS.USER_NOT_FOUND:
	// 			case API_ERRORS.USER_LOCKED:
	// 			default:
	// 				return res.badRequest(Utils.jsonErr('Invalid token'));
	// 		}
	// 	});
};

