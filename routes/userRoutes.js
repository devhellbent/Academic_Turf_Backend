const express = require("express");
const router = express.Router();
const multer = require("multer");
const { v4: uuidv4 } = require('uuid');
const db = require("../models");
const User = db.user;

const { initializeApp } = require("firebase/app");
const { getStorage, ref, uploadBytes, getDownloadURL } = require("firebase/storage");
require("dotenv").config();

// Firebase configuration
const firebaseConfig = {
    apiKey: process.env.REACT_APP_FIREBASE_API_KEY,
    authDomain: process.env.REACT_APP_FIREBASE_AUTH_DOMAIN,
    projectId: process.env.REACT_APP_FIREBASE_PROJECT_ID,
    storageBucket: process.env.REACT_APP_FIREBASE_STORAGE_BUCKET,
    messagingSenderId: process.env.REACT_APP_FIREBASE_MESSAGING_SENDER_ID,
    appId: process.env.REACT_APP_FIREBASE_APP_ID,
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const storageFirebase = getStorage(app);

// Multer setup for file uploads (in-memory storage)
const storage = multer.memoryStorage();
const upload = multer({ storage });

// Route for updating the profile with file upload
router.put("/users/:id/profile", upload.single('profilePicture'), async (req, res) => {
    const { id } = req.params;
    const { name, email, location, phoneNumber, designation, experienceYears } = req.body;
    let profilePictureUrl = null;

    try {
        const user = await User.findByPk(id);
        if (!user) {
            return res.status(404).json({ message: "User not found" });
        }

        if (req.file) {
            const file = req.file;
            const storageRef = ref(storageFirebase, `profile_pictures/${uuidv4()}-${file.originalname}`);
            const metadata = { contentType: file.mimetype };

            const snapshot = await uploadBytes(storageRef, file.buffer, metadata);
            profilePictureUrl = await getDownloadURL(snapshot.ref);
        }

        const updatedUser = await user.update({
            name,
            email,
            profilePicture: profilePictureUrl || user.profilePicture,
            location,
            phoneNumber,
            designation,
            experienceYears
        });

        return res.status(200).json({ message: "Profile updated successfully", updatedUser });
    } catch (error) {
        console.error("Error updating profile:", error);
        return res.status(500).json({ message: "Error updating profile", error });
    }
});


// Get Profile
router.get("/users/:id/profile", async (req, res) => {
    const { id } = req.params;

    try {
        const user = await User.findOne({
            where: { id },
            attributes: { exclude: ['loginToken', 'password'] }
        });

        if (!user) {
            return res.status(404).json({ message: "User not found" });
        }

        return res.status(200).json(user);
    } catch (error) {
        return res.status(500).json({ message: "Error fetching profile", error });
    }
});

// Get or Edit Skills
router.route("/users/:id/skills")
    .get(async (req, res) => {
        const { id } = req.params;

        try {
            const user = await User.findOne({
                where: { id },
                attributes: ['skills']
            });

            if (!user) {
                return res.status(404).json({ message: "User not found" });
            }

            return res.status(200).json({ skills: user.skills });
        } catch (error) {
            return res.status(500).json({ message: "Error fetching skills", error });
        }
    })
    .put(async (req, res) => {
        const { id } = req.params;
        const { skills } = req.body;

        try {
            const user = await User.update(
                { skills },
                { where: { id } }
            );

            if (!user[0]) {
                return res.status(404).json({ message: "User not found" });
            }

            return res.status(200).json({ message: "Skills updated successfully" });
        } catch (error) {
            return res.status(500).json({ message: "Error updating skills", error });
        }
    });

// Get Certificates
router.get("/users/:id/certificates", async (req, res) => {
    const { id } = req.params;

    try {
        const user = await User.findOne({ where: { id } });

        if (!user) {
            return res.status(404).json({ message: "User not found" });
        }

        return res.status(200).json({ certificates: user.certificates });
    } catch (error) {
        return res.status(500).json({ message: "Error fetching certificates", error });
    }
});

// Add Certificates
router.post("/users/:id/certificates", async (req, res) => {
    const { id } = req.params;
    const { certificates } = req.body;

    if (!Array.isArray(certificates) || certificates.length === 0) {
        return res.status(400).json({ message: "Invalid certificates array" });
    }

    try {
        const user = await User.findOne({ where: { id } });

        if (!user) {
            return res.status(404).json({ message: "User not found" });
        }

        const certificatesWithIds = certificates.map(cert => ({
            id: uuidv4(),
            ...cert
        }));

        const updatedCertificates = [
            ...(user.certificates || []),
            ...certificatesWithIds
        ];

        await User.update({ certificates: updatedCertificates }, { where: { id } });

        return res.status(201).json({
            message: "Certificates added successfully",
            certificates: updatedCertificates
        });
    } catch (error) {
        return res.status(500).json({ message: "Error adding certificates", error });
    }
});

// Edit Certificate
router.put("/users/:id/certificates/:certificateId", async (req, res) => {
    const { id, certificateId } = req.params;
    const updatedCertificate = req.body;

    try {
        const user = await User.findByPk(id);
        if (!user) {
            return res.status(404).json({ message: "User not found" });
        }

        let certificates = user.certificates || [];
        const certIndex = certificates.findIndex(cert => cert.id === certificateId);

        if (certIndex === -1) {
            return res.status(404).json({ message: "Certificate not found" });
        }

        certificates[certIndex] = { ...certificates[certIndex], ...updatedCertificate };
        const result = await user.update({ certificates });

        return res.status(200).json({
            message: "Certificate updated successfully",
            certificates: result.certificates
        });
    } catch (error) {
        return res.status(500).json({ message: "Error updating certificate", error });
    }
});

// Delete Certificate
router.delete("/users/:id/certificates/:certificateId", async (req, res) => {
    const { id, certificateId } = req.params;

    try {
        const user = await User.findOne({ where: { id } });

        if (!user) {
            return res.status(404).json({ message: "User not found" });
        }

        const updatedCertificates = user.certificates.filter(cert => cert.id !== certificateId);
        await User.update({ certificates: updatedCertificates }, { where: { id } });

        return res.status(200).json({
            message: "Certificate deleted successfully",
            certificates: updatedCertificates
        });
    } catch (error) {
        return res.status(500).json({ message: "Error deleting certificate", error });
    }
});

// Edit Experience
router.put("/users/:id/experience", async (req, res) => {
    const { id } = req.params;
    const { experience } = req.body;

    try {
        const user = await User.update({ experience }, { where: { id } });

        if (!user[0]) {
            return res.status(404).json({ message: "User not found" });
        }

        return res.status(200).json({ message: "Experience updated successfully" });
    } catch (error) {
        return res.status(500).json({ message: "Error updating experience", error });
    }
});

module.exports = router;
