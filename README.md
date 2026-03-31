# ResumeBuilder
#hello world

🔹 Core
express → backend framework
mongoose → MongoDB
cors → allow frontend requests
dotenv → env variables
🔹 Auth
bcryptjs → hash password
jsonwebtoken → JWT auth
🔹 File Handling
multer → upload resume
pdf-parse → parse PDF
mammoth → parse DOCX
🔹 Extra (you are using this)
cookie-parser → handle cookies


FastAPI:

The Big Picture: How they work together
Multer (Node.js) sends a PDF file to your FastAPI endpoint.

python-multipart allows FastAPI to receive that file.

spaCy reads the text within that file and extracts the "Good Stuff" (Name, Email, Skills).

Uvicorn keeps the whole process running smoothly on your Mac.


File Upload
   ↓
multer saves file
   ↓
fileParser extracts text
   ↓
Node sends text → FastAPI
   ↓
FastAPI extracts:
   skills, experience, projects, etc.
   ↓
Node saves into MongoDB