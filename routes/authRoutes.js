const withAuth = require('../withAuth');


module.exports = (app, db) => {
    const userModel = require('../models/userModel')

    app.get('/api/checkToken', withAuth, async (req, res, next) => {

        // Warning : bug avec la recherche par email .findOne({mail}) ça me sort l'user John Doe
        const user = await userModel.findById(req._id)
        const userIdToken = req._id
        console.log('userIdToken', userIdToken)
        const userIdFromDb = user._id.toString()
        console.log('userIdFromDb', userIdFromDb)

        if(userIdToken !== userIdFromDb) {
          console.log('differents')
          res.json({status: 500, err: user})
        }
        else {
          console.log('egaux')
          res.json({status: 200, msg: 'token valide', user: user})
        }

    })

}