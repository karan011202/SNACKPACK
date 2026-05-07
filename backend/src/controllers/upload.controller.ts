import {
  post,
  requestBody,
  RestBindings,
  Request,
} from '@loopback/rest';
import {inject} from '@loopback/core';
import multer from 'multer';
import path from 'path';
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, 'public/uploads');
  },
  filename: (req, file, cb) => {
    const ext = path.extname(file.originalname); // .jpg / .png
   cb(null, Date.now() + '-' + file.originalname);
  },
});
// storage config
const upload = multer({
  storage: storage,
});

export class UploadController {
  @post('/upload')
  async uploadFile(
    @requestBody.file() request: Request,
    @inject(RestBindings.Http.RESPONSE) response: any,
  ) {
    return new Promise((resolve, reject) => {
      upload.single('file')(request, response, (err: any) => {
        if (err) return reject(err);

        const file = request.file;
        if (!file) {
  return reject(new Error('File not uploaded'));
}

        resolve({
          url: `/uploads/${file.filename}`,
        });
      });
    });
  }
}