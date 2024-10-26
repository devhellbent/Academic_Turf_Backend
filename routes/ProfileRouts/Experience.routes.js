const express = require("express");
const router = express.Router()
const db = require('../../models')
const Experience = db.experience;


router.post('/', async (req, res) => {
    const { jobtitle, company, description, startDate, endDate, userId } = req.body;
    if (!jobtitle || !company || !userId) {
        return res.status(400).json({ message: "JobTitle , Company , UserID are required" });

    }
    try {
        const experience = await Experience.create({
            jobtitle,
            company,
            description,
            startDate,
            endDate,
            userId
        })
        res.status(201).json(experience)
    } catch (error) {
        res.status(500).json({ message: "Error creating experience", error: error.message })
    }

})


router.get('/', async (req, res) => {
    try {
        const experience = await Experience.findAll();
        res.status(200).json(experience)
    } catch (error) {
        res.status(500).json({ message: "Error fetching Experience", error: error.message })
    }
})

router.get('/user/:userId', async (req, res) => {
    const { userId } = req.params;
    try {
        const experience = await Experience.findAll({
            where: {
                userId: userId,
            }
        })
        if (!experience || experience.length === 0) {
            return res.status(200).json({ message: "There is no certificate for this user " })
        }
        res.status(200).json(experience)

    } catch (error) {
        res.status(500).json({ message: "Error fetching Experience ", error: error.message })
    }
})


router.put('/:id', async (req, res) => {
    try {
        const { jobtitle, company, description, startDate, endDate, userId } = req.body;

        const experience = await Experience.findByPk(req.params.id)

        if (!experience) {
            return res.status(404).json({ message: "Experience not Found" })
        }
        await experience.update({
            jobtitle,
            company, description,
            startDate,
            endDate,
            userId
        });
        res.status(200).json(experience)

    } catch (error) {
        res.status(500).json({ message: "Error updating Experience" })

    }
})



router.delete('/:id', async (req, res) => {
    try {
        const experience = await Experience.findByPk(req.params.id)
        if (!experience) {
            return res.status(404).json({ message: "Experience Not Found" })
        }
        await experience.destroy();
        res.status(200).json({ message: "Experience Deleted Successfully" })
    } catch (error) {
        res.status(500).json({ message: "Error deleting Experience", error: error.message })
    }
})


module.exports = router;