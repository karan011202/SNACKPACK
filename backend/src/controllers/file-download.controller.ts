// Copyright IBM Corp. 2020. All Rights Reserved.
// Node module: @loopback/example-file-transfer
// This file is licensed under the MIT License.
// License text available at https://opensource.org/licenses/MIT

// import {authenticate} from '@loopback/authentication';
import {inject} from '@loopback/core';
import {
  get,
  HttpErrors,
  oas,
  param,
  Response,
  RestBindings
} from '@loopback/rest';
import fs from 'fs';
import path from 'path';
import {promisify} from 'util';
import {STORAGE_DIRECTORY} from '../keys';

const readdir = promisify(fs.readdir);

/**
 * A controller to handle file downloads using multipart/form-data media type
 */

export class FileDownloadController {
  constructor(@inject(STORAGE_DIRECTORY) private storageDirectory: string) { }
  @get('/files', {
    responses: {
      200: {
        content: {
          // string[]
          'application/json': {
            schema: {
              type: 'array',
              items: {
                type: 'string',
              },
            },
          },
        },
        description: 'A list of files',
      },
    },
  })
  async listFiles() {
    const files = await readdir(this.storageDirectory);
    return files;
  }

  @get('/files/{filename}')
  @oas.response.file()
  downloadFile(
    @param.path.string('filename') fileName: string,
    @inject(RestBindings.Http.RESPONSE) response: Response,
  ) {
    const file = this.validateFileName(fileName);
    response.download(file, fileName);
    return response;
  }
  //////

  @get('/files/{folder}/{filename}')
  @oas.response.file()
  downloadFileFromFolder(
    @param.path.string('folder') folder: string,
    @param.path.string('filename') fileName: string,
    @inject(RestBindings.Http.RESPONSE) response: Response,
  ) {

    //const newfileName = path.join("files", `/${folder}/`);
    const file = this.validateFileNameV1(folder, fileName);
    //let storageDestination = path.join('C:/Users/CRIS/Desktop/uploads/incoming/test1.pdf')
    response.download(file, fileName);

    return response;
  }
  @get('/filesV1')
  @oas.response.file()
  downloadFileFromFolderV1(
    @param.query.string('folder') folder: string,
    @param.query.string('filename') fileName: string,
    @inject(RestBindings.Http.RESPONSE) response: Response,
  ) {

    const file = this.validateFileNameV1(folder, fileName);


    response.download(file, fileName);

    return response





  }


  ////
  /**
   * Validate file names to prevent them goes beyond the designated directory
   * @param fileName - File name
   */
  private validateFileName(fileName: string) {
    const resolved = path.resolve(this.storageDirectory, fileName);
    if (resolved.startsWith(this.storageDirectory)) return resolved;
    // The resolved file is outside sandbox
    throw new HttpErrors.BadRequest(`Invalid file name: ${fileName}`);
  }




  ////
  /**
   * Validate file names to prevent them goes beyond the designated directory
   * @param fileName - File name
   */
  private validateFileNameV1(folderName: string, fileName: string) {
    console.log("inside validate")
    const resolved = path.resolve(this.storageDirectory, folderName, fileName);
    console.log("inside validate1")
    console.log('resolved --->', resolved)
    if (resolved.startsWith(path.join(this.storageDirectory, folderName))) return resolved;
    // The resolved file is outside sandbox
    throw new HttpErrors.BadRequest(`Invalid file name: ${fileName}`);
  }


  // @get('/downloadBase64/{folder}/{filename}', {
  //   responses: {
  //     200: {
  //       content: {
  //         'application/json': {
  //           schema: {
  //             type: 'object',
  //             properties: {
  //               dataUri: {type: 'string'},
  //             },
  //           },
  //         },
  //       },
  //       description: 'Download file and return as Data URI',
  //     },
  //   },
  // })
  // async downloadBase64(
  //   @param.path.string('folder') folder: string,
  //   @param.path.string('filename') filename: string,
  //   @inject(RestBindings.Http.RESPONSE) response: Response,
  // ): Promise<object> {
  //   // Define the storage folder path
  //   //const storageLocation = 'C:/Users/Dell/Desktop/uploads';
  //   const storageLocation = '/opt/node/wisestorage'
  //   const filePath = path.join(storageLocation, folder, filename);

  //   // Ensure the file exists
  //   if (!fs.existsSync(filePath)) {
  //     return {
  //       error: 'File does not exist.',
  //     };
  //   }

  //   // Read the file from the filesystem
  //   const fileBuffer = fs.readFileSync(filePath);

  //   // Map file extensions to MIME types
  //   const extToMime: {[key: string]: string} = {
  //     'jpg': 'image/jpeg',
  //     'jpeg': 'image/jpeg',
  //     'png': 'image/png',
  //     'gif': 'image/gif',
  //     'pdf': 'application/pdf',
  //   };

  //   // Extract the file extension
  //   const extension = path.extname(filename).substring(1); // remove the dot (.)
  //   const mimeType = extToMime[extension] || 'application/octet-stream'; // Fallback to 'octet-stream'

  //   // Convert the file to a Base64 Data URI
  //   const base64Data = fileBuffer.toString('base64');
  //   const dataUri = `data:${mimeType};base64,${base64Data}`;

  //   // Return the Data URI as a response
  //   return {
  //     message: 'File downloaded successfully!',
  //     dataUri,
  //   };
  // }
 


}