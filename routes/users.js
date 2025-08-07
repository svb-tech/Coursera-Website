const { Router } = require("express");
const userRouter = Router();
const { z } = require("zod");
const bcrypt = require("bcrypt");
const { userModel, purchaseModel, courseModel } = require("../db");
const jwt = require("jsonwebtoken")
const {jwtSecretofUser}=require("../config");
const { userMiddleware } = require("../middleware/user");



userRouter.post('/signup', async function (req, res) {
     console.log("✅ Signup API Hit");
     console.log("✅ Signup API Hit", req.body);

    const requiresBody = z.object({
        email: z.string().email(),
        password: z.string(),
        firstName: z.string(),
        lastName: z.string()
    })

    const parsedDatawithSuccess = requiresBody.safeParse(req.body);
    if (!parsedDatawithSuccess.success) {
        return res.status(400).json({
            message: "Incorrect format",
            error: parsedDatawithSuccess.error
        })
    }

    const { email, password, firstName, lastName } = parsedDatawithSuccess.data;

    try {
        const existUser = await userModel.findOne({ email });
        if (existUser) {
            return res.status(409).json({
                message: "User already exist. Please use another email."
            })
        }
        const hashedpassword = await bcrypt.hash(password, 5);

        await userModel.create({
            email,
            password: hashedpassword,
            firstName,
            lastName
        }
        );

        return res.status(201).json({
            message: "Signup Successful"
        });
    }
    catch (error) {
        console.error("Signup Error:", error);
        return res.status(500).json({
            message: "Internal server Error"
        })
    }
});

userRouter.post('/signin', async function (req, res) {

    const { email, password } = req.body;

    const user = await userModel.findOne({
        email: email
    })

    if (!user) {
        return res.status(401).json({
            message: "User doesn't exist."
        })
    }

    const realpassword = await bcrypt.compare(password, user.password);
    if (realpassword) {
        const token = jwt.sign({
            id: user._id.toString()
        }, jwtSecretofUser);
        res.json({
            token: token
        })

    }
    else {
        res.status(403).json({
            message: "Incorrect details."
        })

    }

});
userRouter.get('/purchases', userMiddleware, async function (req, res) {
    const userId = req.userId;

    if (!userId) {
        return res.status(400).json({ message: 'User  ID is required' });
    }

    try {
        const purchases = await purchaseModel.find({ userId });

        if (purchases.length === 0) {
            return res.status(404).json({ message: 'No purchases found' });
        }
       const courseData=await courseModel.find({
        _id:purchases.map(x=>x.courseId)
       })
        res.status(200).json({ purchases ,
            courseData
        });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Internal server error' });
    }
});


module.exports = userRouter;

// module.exports = userRouter; 
