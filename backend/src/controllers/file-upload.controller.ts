// Copyright IBM Corp. 2020. All Rights Reserved.
// Node module: @loopback/example-file-transfer
// This file is licensed under the MIT License.
// License text available at https://opensource.org/licenses/MIT

import {inject} from '@loopback/core';
import {
  param,
  post,
  Request,
  requestBody,
  Response,
  RestBindings
} from '@loopback/rest';
import * as fs from 'fs';
import * as path from 'path';
import {FILE_UPLOAD_SERVICE} from '../keys';
import {FileUploadHandler} from '../types';
/**
 * A controller to handle file uploads using multipart/form-data media type
 */
//@authenticate('jwt')
export class FileUploadController {
  /**
   * Constructor
   * @param handler - Inject an express request handler to deal with the request
   */
  constructor(
    @inject(FILE_UPLOAD_SERVICE) private handler: FileUploadHandler,
  ) { }
  @post('/files', {
    responses: {
      200: {
        content: {
          'application/json': {
            schema: {
              type: 'object',
            },
          },
        },
        description: 'Files and fields',
      },
    },
  })
  async fileUpload(
    @requestBody.file()
    request: Request,
    @inject(RestBindings.Http.RESPONSE) response: Response,
  ): Promise<object> {
    return new Promise<object>((resolve, reject) => {
      this.handler(request, response, (err: unknown) => {
        if (err) reject(err);
        else {
          resolve(FileUploadController.getFilesAndFields(request));
        }
      });
    });
  }


  /////
  @post('/containers/{folder}/{filename}', {
    responses: {
      200: {
        content: {
          'application/json': {
            schema: {
              type: 'object',
            },
          },
        },
        description: 'Files and fields',
      },
    },
  })
  async fileUploadV1(
    @requestBody.file()
    request: Request,
    @param.path.string('folder') folder: string,
    @param.path.string('filename') filename: string,
    @inject(RestBindings.Http.RESPONSE) response: Response,
  ): Promise<object> {
    return new Promise<object>((resolve, reject) => {
      request.params.folder = folder
      request.params.filename = filename

      this.handler(request, response, (err: unknown) => {
        //console.log("requst at upload---",request)
        if (err) {
          reject(err);
        }
        else {
          resolve(FileUploadController.getFilesAndFields(request));
        }
      });
    });
  }

  @post('/filesV2', {
    responses: {
      200: {
        content: {
          'application/json': {
            schema: {
              type: 'object',
            },
          },
        },
        description: 'Files and fields',
      },
    },
  })
  async fileUploadV2(
    @requestBody.file()
    request: Request,
    @param.query.string('folder') folder: string,
    @param.query.string('filename') filename: string,
    @inject(RestBindings.Http.RESPONSE) response: Response,
  ): Promise<object> {
    return new Promise<object>((resolve, reject) => {
      request.params.folder = folder
      request.params.filename = filename

      this.handler(request, response, (err: unknown) => {
        //console.log("requst at upload---",request)
        if (err) {
          reject(err);
        }
        else {
          resolve(FileUploadController.getFilesAndFields(request));
        }
      });
    });
  }
  ////end

  /**
   * Get files and fields for the request
   * @param request - Http request
   */
  private static getFilesAndFields(request: Request) {
    const uploadedFiles = request.files;
    const mapper = (f: globalThis.Express.Multer.File) => ({
      fieldname: f.fieldname,
      originalname: f.originalname,
      encoding: f.encoding,
      mimetype: f.mimetype,
      size: f.size,
    });
    let files: object[] = [];
    if (Array.isArray(uploadedFiles)) {
      files = uploadedFiles.map(mapper);
    } else {
      for (const filename in uploadedFiles) {
        files.push(...uploadedFiles[filename].map(mapper));
      }
    }
    return {files, fields: request.body};
  }

  /**
   * Custom method to handle base64 image upload.
   */
  @post('/uploadBase64', {
    responses: {
      200: {
        content: {
          'application/json': {
            schema: {
              type: 'object',
            },
          },
        },
        description: 'Upload file from base64 encoded data',
      },
    },
  })
  async uploadBase64(
    @requestBody({
      description: 'Base64 encoded image data',
      required: true,
      content: {
        'application/json': {
          schema: {
            type: 'object',
            properties: {
              base64Image: {type: 'string'},
              filename: {type: 'string'},
              folder: {type: 'string'},
            },
          },
        },
      },
    })
    body: {
      base64Image: string;
      filename: string;
      folder: string;
    },
    @inject(RestBindings.Http.RESPONSE) response: Response,
  ): Promise<object> {
    const {base64Image, filename, folder} = body;



    if (!base64Image) {
      throw new Error('Base64 image data is missing');
    }

    // Extract MIME type and base64 data
    const [metadata, data] = base64Image.split(',');
    const mimeType = metadata.match(/:(.*?);/)?.[1] || 'application/octet-stream'; // Fallback MIME type

    // Map MIME type to file extension
    const mimeToExt: any = {
      'image/jpeg': 'jpg',
      'image/png': 'png',
      'image/gif': 'gif',
      // Add more MIME types as needed
    };


    // Determine file extension based on MIME type
    const extension = mimeToExt[mimeType] || 'bin'; // Default to 'bin' if unknown MIME type

    // Use user-provided filename or generate a unique one
    const finalFilename = `${path.basename(filename, path.extname(filename))}.${extension}`;


    // Decode base64 image
    const buffer = Buffer.from(data.replace(/\n/g, ''), 'base64');

    // Create a temporary file path
    const tempFilePath = path.join(__dirname, filename);

    // Write the buffer to a file
    fs.writeFileSync(tempFilePath, buffer);

    // Prepare a simulated `Request` object for `fileUploadV2`
    const fakeRequest = {
      ...response.req,
      files: [{
        fieldname: 'file',
        originalname: finalFilename,
        encoding: '7bit',
        mimetype: mimeType, // Adjust this based on the image type
        size: buffer.length,
        buffer,  // The buffer from the base64 image
      }],
      params: {folder, filename},
    } as unknown as Request;
    console.log(fakeRequest.files)
    // Call the existing fileUploadV2 method
    return this.fileUploadV2(fakeRequest, folder, filename, response);
  }

  // @authenticate('jwt')
//   @post('/uploadBase64C', {
//     responses: {
//       200: {
//         content: {
//           'application/json': {
//             schema: {
//               type: 'object',
//             },
//           },
//         },
//         description: 'Upload file from base64 encoded data',
//       },
//     },
//   })
//   async uploadBase64C(
//     @requestBody({
//       description: 'Base64 encoded file data',
//       required: true,
//       content: {
//         'application/json': {
//           schema: {
//             type: 'object',
//             properties: {
//               base64Image: {type: 'string'},
//               filename: {type: 'string'},
//               folder: {type: 'string'},
//             },
//             required: ['base64Image', 'filename', 'folder'],
//           },
//         },
//       },
//     })
//     body: {
//       base64Image: string;
//       filename: string;
//       folder: string;
//     },
//     @inject(RestBindings.Http.RESPONSE) response: Response,
//   ): Promise<object> {
//     const {base64Image, filename, folder} = body;

//     // Validate input
//     if (!base64Image || !filename || !folder) {
//       return {
//         error: 'Missing base64Image, filename, or folder.',
//       };
//     }

//     // Validate base64 format for Data URI
//     if (!base64Image.startsWith('data:') || !base64Image.includes(',')) {
//       return {
//         error: 'Invalid base64 Data URI format.',
//       };
//     }

//     // Extract MIME type and base64 data
//     const [metadata, data] = base64Image.split(',');
//     const mimeType = metadata.match(/data:(.*?);base64/)?.[1];

//     if (!mimeType) {
//       return {
//         error: 'Invalid or unsupported MIME type in Data URI.',
//       };
//     }

//     // Validate the MIME type against allowed types (images and PDFs)
//     const allowedMimeTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/gif', 'application/pdf'];
//     if (!allowedMimeTypes.includes(mimeType)) {
//       return {
//         error: `Unsupported MIME type. Allowed types: ${allowedMimeTypes.join(', ')}.`,
//       };
//     }

//     // Map MIME type to file extension
//     const mimeToExt: {[key: string]: string} = {
//       'image/jpeg': 'jpg',
//       'image/jpg': 'jpg', // Treat both jpeg and jpg as jpg
//       'image/png': 'png',
//       'image/gif': 'gif',
//       'application/pdf': 'pdf',
//     };
//     const extension = mimeToExt[mimeType] || 'bin'; // Fallback to 'bin'

//     // Decode base64 data to a buffer
//     const buffer = Buffer.from(data, 'base64');

//     // Validate file size (e.g., max 5MB)
//     const maxSizeInBytes = 5 * 1024 * 1024; // 5MB
//     if (buffer.length > maxSizeInBytes) {
//       return {
//         error: 'File size exceeds the 5MB limit.',
//       };
//     }

//     // Define the storage folder path
//     const storageLocation = 'C:/Users/Dell/Desktop/uploads';
//     //const storageLocation = '/opt/node/wisestorage'
//     const uploadFolder = path.join(storageLocation, folder);

//     // Ensure the folder exists
//     if (!fs.existsSync(uploadFolder)) {
//       fs.mkdirSync(uploadFolder, {recursive: true});
//     }

//     // Construct the final file path
//     const finalFilename = `${path.basename(filename, path.extname(filename))}.${extension}`;
//     const filePath = path.join(uploadFolder, finalFilename);

//     // Validate file path length and prevent path traversal
//     if (filePath.length > 255) {
//       return {
//         error: 'File path too long.',
//       };
//     }
//     if (!filePath.startsWith(uploadFolder)) {
//       return {
//         error: 'Invalid folder path.',
//       };
//     }

//     // Write the file to the filesystem
//     fs.writeFileSync(filePath, buffer);

//     // Return a success response with the file path
//     return {
//       message: 'File uploaded successfully!',
//       filename: finalFilename,
//       //path: filePath,
//     };
//   }


}