const User = require('../models/user');
const place = require('../models/place');
const Gas_station = require('../models/gas_stations')
const Fuel = require('../models/fuel')
const Admin = require('../models/admin')
const Message = require('../models/message')
const Step = require('../models/step')
class MainController{

    async testing(req, res) {
        try {
          await Step.updateMany({}, { $set: { comments_id: [] } });
      res.send('Steps deleted successfully');
        } catch (error) {
          console.error(error);
          res.status(500).send('Error deleting steps');
        }
    }

    async main_page_logout(req,res){

        try {
            req.session.destroy((err) => {
                if (err) {
                    return res.send('Error logging out');
                }
                res.status(200).json({ status: 'success'});
            });
        } catch (error) {
            console.error('Error:', error);
            res.status(500)
        }
      
    }
    // [GET] /api
    async main_page_data(req, res) {
        let loginUserId
        let session_userId_query = req.session.user_id
        console.log("session id: ")
        console.log(session_userId_query)
        let loginUserInformation;
        let messages;
        const users = await User.find();
        users.forEach(async (user) => {
            if (user.loginOnce == true) {
              console.log("reach here");
              console.log(user);
              loginUserId = user._id;
              await User.updateOne({ _id: user._id }, { $set: { loginOnce: false } });
            }
          });

        if (loginUserId === undefined && session_userId_query === undefined) {
          console.log("reach here")
          res.json({ status: 'no_userId' });
          return;
        }
        console.log(loginUserId)
      
        if (loginUserId !== undefined) {
          loginUserInformation = await User.findById(loginUserId).lean();
          messages = await Message.find({ user_id: loginUserId }).lean();
        } else {
          loginUserInformation = await User.findById(session_userId_query).lean();
          messages = await Message.find({ user_id: session_userId_query }).lean();
        }
      
        const responseData = {
          login_user: loginUserInformation,
          messages: messages
        };
        res.json(responseData);
      }

    // [GET] /main
    main_page(req,res){
        res.render('home', { layout: false  });
    }

}

module.exports = new MainController