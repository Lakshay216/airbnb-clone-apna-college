const user = require('../models/user.js');

//signup route
module.exports.signUp =async(req,res,next)=>{
    try{
        let {username,email,password} = req.body;
        let newUser = new user({username,email});
        let registerdUser = await user.register(newUser,password);
        console.log(registerdUser); 
        req.login(registerdUser,(err)=>{
            if(err){
                next(err);
            }
            req.flash('success','welcome to Air-Bnb');
        res.redirect('/listings');
        })
    }catch(e){
      req.flash('error',e.message);
      res.redirect('/signup')
    }
}

//login route
module.exports.login =  async(req,res)=>{
    req.flash('success','welcome back to airbnb');
   const reqUrl = res.locals.redirectUrl || '/listings'
    res.redirect(reqUrl);
}
module.exports.logOut = (req,res)=>{
    req.logOut((err)=>{
        if(err){
            next(err);
        }
        req.flash('success','you are now logged out');
        res.redirect('/listings');
    })
}
