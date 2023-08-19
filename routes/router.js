const express = require("express");
const router = new express.Router();
const Products = require("../models/productsSchema");
const User = require("../models/userSchema");
const bcrypt = require("bcryptjs");
const authenticate = require("../middleware/authenticate");

// router.get("/",(req,res)=>{
//     res.send("this is testing routes");
// });

// get the products data

router.get("/getproducts", async (req, res) => {
    try {
        const producstdata = await Products.find();
       // console.log(producstdata + "data mila hain");
        res.status(201).json(producstdata);
    } catch (error) {
        console.log("error" + error.message);
    }
});

// register data
router.post("/register", async (req, res) => {
     // console.log(req.body);
    const { fname, email, mobile, password, cpassword } = req.body;

    if (!fname || !email || !mobile || !password || !cpassword) {
        res.status(422).json({ error: "fill all details" });
        console.log("data not available");
    };

    try {

        const preuser = await User.findOne({ email: email });

        if (preuser) {
            res.status(422).json({ error: "This email already exist" });
        } else if (password !== cpassword) {
            res.status(422).json({ error: "password are not matching" });;
        } else {

            const finaluser = new User({
                fname, email, mobile, password, cpassword
            });

            // yaha pe hasing krenge

            const storedata = await finaluser.save();
            // console.log(storedata + "user successfully added");
            res.status(201).json(storedata);
        }

    } catch (error) {
        console.log("error for registratoin time" + error.message);
        res.status(422).send(error);
    }

});

// login data
router.post("/login", async (req, res) => {
    // console.log(req.body);
    const { email, password } = req.body;

    if (!email || !password) {
        res.status(400).json({ error: "fill the details" });
    }

    try {

        const userlogin = await User.findOne({ email: email });
       // console.log(userlogin);
        if (userlogin) {
            const isMatch = await bcrypt.compare(password, userlogin.password);
            console.log(isMatch);


            if (!isMatch) {
                res.status(400).json({ error: "invalid crediential pass" });
            } else {
                //token generate
                const token = await userlogin.generatAuthtoken();
                console.log(token);

                res.cookie("ecommerce", token, {
                    expires: new Date(Date.now() + 2589000),
                    httpOnly: true
                });
                res.status(201).json(userlogin);
            }

        } else {
            res.status(400).json({ error: "user does not exist" });
        }

    } catch (error) {
        res.status(400).json({ error: "invalid crediential pass" });
        console.log("error for login time" + error.message);
    }
});

// get individual data

router.get("/getproductsone/:id", async (req, res) => {

    try {
        const { id } = req.params;
       // console.log(id);

        const individual = await Products.findOne({ id: id });
       // console.log(individual + "individual mila hai");

        res.status(201).json(individual);
    } catch (error) {
        res.status(400).json(error);
    }
});


// adding the data into cart
router.post("/addcart/:id", authenticate, async (req, res) => {

    try {
        console.log("perfect 6");
        const { id } = req.params;
        const cart = await Products.findOne({ id: id });
        console.log(cart + "cart milta hain");

        const Usercontact = await User.findOne({ _id: req.userID });
        console.log(Usercontact + "user milta hain");


        if (Usercontact) {
            const cartData = await Usercontact.addcartdata(cart);

            await Usercontact.save();
            console.log(cartData + " thse save wait kr");
            console.log(Usercontact + "userjode save");
            res.status(201).json(Usercontact);
        }
    } catch (error) {
        console.log(error);
    }
});


// get cart details
router.get("/cartdetails", authenticate, async (req, res) => {
    try {
        const buyuser = await User.findOne({ _id: req.userID });
      //  console.log(buyuser + "you can buy now");
        res.status(201).json(buyuser);
    } catch (error) {
        console.log(error + "error for buy now");
    }
});



// get valid user
router.get("/validuser", authenticate, async (req, res) => {
    try {
        const validuserone = await User.findOne({ _id: req.userID });
       // console.log(validuserone + "valid user");
        res.status(201).json(validuserone);
    } catch (error) {
        console.log(error + "error for valid user");
    }
});

// for userlogout

router.get("/logout", authenticate, async (req, res) => {
    try {
        req.rootUser.tokens = req.rootUser.tokens.filter((curelem) => {
            return curelem.token !== req.token
        });

        res.clearCookie("ecommerce", { path: "/" });
        req.rootUser.save();
        res.status(201).json(req.rootUser.tokens);
        console.log("user logout");

    } catch (error) {
        console.log(error + "jwt provide then logout");
    }
});

// remove items from the cart

router.get("/remove/:id", authenticate, async (req, res) => {
    try {
        const { id } = req.params;

        req.rootUser.carts = req.rootUser.carts.filter((current) => {
            return current.id != id
        });

        req.rootUser.save();
        res.status(201).json(req.rootUser);
        console.log("items remove");

    } catch (error) {
        console.log(error + "provide jwt then remove");
        res.status(400).json(error);
    }
});


module.exports = router;