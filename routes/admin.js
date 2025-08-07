const { Router } = require("express");
const adminRouter = Router();
const { z } = require("zod");
const { adminModel, userModel, courseModel } = require("../db");
const bcrypt = require("bcrypt")
const jwt = require("jsonwebtoken")
const { adminMiddleware } = require("../middleware/admin")

const { jwtSecretofAdmin } = require("../config");
const admin = require("../middleware/admin");

adminRouter.post('/signup', async function (req, res) {
    const requiresBody = z.object({
        email: z.string().min(5).max(20).email(),
        password: z.string().min(5).max(20),
        firstName: z.string().min(5).max(20),
        lastName: z.string().min(5).max(20)
    })

    const parsedDatawithSuccess = requiresBody.safeParse(req.body);
    if (!parsedDatawithSuccess.success) {
        return res.status(400).json({
            message: "Incorrect Format.",
            error: parsedDatawithSuccess.error
        })
    }
    
    const { email, password, firstName, lastName } = parsedDatawithSuccess.data;
    try {
        const adminexist = await adminModel.findOne({ email });
        if (adminexist) {
            return res.status(409)({
                message: "User alreasy exist. Please try another email address."
            })

        }
        const hashedpassword = await bcrypt.hash(password, 5);

        await adminModel.create({
            email,
            password: hashedpassword,
            firstName,
            lastName
        });

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


adminRouter.post('/signin', async function (req, res) {

    const { email, password } = req.body;

    const admin = await adminModel.findOne({ email });
    if (!admin) {
        return res.status(403)({
            message: "User doesn't exists."
        })
    }

    const passswordMatch = await bcrypt.compare(password, admin.password);
    if (passswordMatch) {
        const token = jwt.sign({
            id: admin._id.toString()
        }, jwtSecretofAdmin)
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

adminRouter.post("/course", adminMiddleware, async function (req, res) {
    const adminId = req.adminId;

    const { title, description, price, imageUrl } = req.body

    const course = await courseModel.create({
        title, description, imageUrl, price, creatorId: adminId
    })
    res.json({
        message: "Course created",
        courseId: course._id
    })
});

adminRouter.put("/course", adminMiddleware, async function (req, res) {
    const adminId = req.adminId; // extracted by adminMiddleware
    const { title, description, imageUrl, price, courseId } = req.body;

    try {
        // Try to find and update course owned by this admin
        const updatedCourse = await courseModel.findOneAndUpdate(
            { _id: courseId, creatorId: adminId },  // filter
            {
                title: title,
                description: description,
                imageUrl: imageUrl,
                price: price
            },
            { new: true } // return the updated document
        );

        // If course not found or admin is not the owner
        if (!updatedCourse) {
            return res.status(403).json({
                message: "Unauthorized: You are not the creator of this course or course does not exist."
            });
        }

        // Success
        res.json({
            message: "Course updated successfully",
            courseId: updatedCourse._id,
            updatedCourse
        });

    } catch (error) {
        console.error("Error updating course:", error);
        res.status(500).json({
            message: "Internal server error",
            error: error.message
        });
    }
});


adminRouter.get("/course/bulk", adminMiddleware, async function (req, res) {
    const adminId = req.adminId;

    const course = await courseModel.find({
        creatorId: adminId
    });
    res.json({
        message: "All courses for creator",  
         course
    }
    )
});

module.exports = adminRouter;
