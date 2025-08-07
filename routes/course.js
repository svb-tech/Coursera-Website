const { Router } = require("express");
const { userMiddleware } = require("../middleware/user");
const { purchaseModel } = require("../db");
const { courseModel } = require("../db"); // Ensure this import is present
const courseRouter = Router();
 
// iif user wants to purchase the course toh voh yeh vala route use kr ee ga 
courseRouter.post('/purchase', userMiddleware,async function(req, res) {
    const userId=req.userId;
    const courseId=req.body.courseId; // uss course ki id jo buy krna hai byi
  ///check for if user gives you paise
    await purchaseModel.create({
        userId,
        courseId
    })
    res.json("You have successfully purchased the course");
});

// tell the user about ki kon kon se course availabke hai tumhara pass

courseRouter.get('/preview',async function(req, res) {
     const course=await courseModel.find({});
    res.json({
        course
    })

});

module.exports = courseRouter; 