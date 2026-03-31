import multer from "multer";
import path from "path";
import fs from "fs";

// Ensure existence of uploads directory
if (!fs.existsSync("uploads")) {
    fs.mkdirSync("uploads");
}

// Storage config
const storage = multer.diskStorage({
    destination: function (req, file, cb) {
        cb(null, "uploads/");
    },

    filename: function (req, file, cb) {
        const uniqueName = Date.now() + path.extname(file.originalname);
        cb(null, uniqueName);
    },
});



// File filter (only pdf/doc/docx)
const fileFilter = (req, file, cb) => {
    const allowedTypes = ["application/pdf", "application/msword", "application/vnd.openxmlformats-officedocument.wordprocessingml.document"];

    if (allowedTypes.includes(file.mimetype)) {
        cb(null, true);
    } else {
        cb(new Error("Only PDF/DOC/DOCX allowed"), false);
    }
};

const upload = multer({
    storage,
    fileFilter,
});

export default upload;