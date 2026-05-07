// import {BootMixin} from '@loopback/boot';
// import {ApplicationConfig} from '@loopback/core';
// import {
//   RestExplorerBindings,
//   RestExplorerComponent,
// } from '@loopback/rest-explorer';
// import {RestApplication} from '@loopback/rest';
// import path from 'path';
// import fs from 'fs';
// import {MySequence} from './sequence';
// import {ServiceMixin} from '@loopback/service-proxy';
// import {RepositoryMixin} from '@loopback/repository';
// import multer from 'multer';
// import { FILE_UPLOAD_SERVICE } from './keys';
// import { STORAGE_DIRECTORY } from './keys';



// export class Lb4Application extends BootMixin(
//   ServiceMixin(
//     RepositoryMixin(RestApplication),
//   ),
// ) {
//   constructor(options: ApplicationConfig = {}) {
//     super(options);
  
//     // this.static('/uploads', path.join(__dirname, '../public/uploads'));
//     // Set up the custom sequence
//     this.sequence(MySequence);
//     let storagedestination = path.join(__dirname, '../public/uploads');

//     // Set up default home page
//     this.static('/', path.join(__dirname, '../public'));
//     this.bind(STORAGE_DIRECTORY).to(storagedestination);

//     // Customize @loopback/rest-explorer configuration here
//     this.configure(RestExplorerBindings.COMPONENT).to({
//       path: '/explorer',
//     });
//     this.component(RestExplorerComponent);

//     this.projectRoot = __dirname;
//     // Customize @loopback/boot Booter Conventions here
//     this.bootOptions = {
//       controllers: {
//         // Customize ControllerBooter Conventions here
//         dirs: ['controllers'],
//         extensions: ['.controller.js'],
//         nested: true,
//       },
//     };
//   }
//   protected configureFileUpload(storagedestination?: string) {
//     //console.log("destination", destination)
//     // Upload files to `dist/.sandbox` by default
//     // destination = destination ?? path.join(__dirname, '../.sandbox');
//     //destination = destination ?? path.join(__dirname, '../uploads/');
//     storagedestination = storagedestination ?? '../public/uploads';

//     // destination = destination ?? '/opt/node/wisestorage/'
//     //this.bind(STORAGE_DIRECTORY).to(destination);
//     const multerOptions: multer.Options = {
//       storage: multer.diskStorage({
//         destination: (req, file, cb) => {

//           //console.log("__dirname", __dirname)
//           // checking and creating uploads folder where files will be uploaded
//           //var dirPath = path.join(__dirname, '../.sandbox/') + req.query.container

//           var dirPath =
//             storagedestination + req.params.folder;
//           //console.log('configureFileUpload -> dirPath', dirPath);
//           cb(null, dirPath + '/');
//         },
//         // Use the original file name as is
//         filename: (req, file, cb) => {
//           // cb(null, file.originalname);
//           //cb(null, `${req.params.filename}.${file.originalname.split('.').pop()}`);
//           cb(null, `${req.params.filename}`);
//         },
//       }),
//     };
//     // Configure the file upload service with multer options
//     this.configure(FILE_UPLOAD_SERVICE).to(multerOptions);
//   }
// }
// import {BootMixin} from '@loopback/boot';
// import {ApplicationConfig} from '@loopback/core';
// import {
//   RestExplorerBindings,
//   RestExplorerComponent,
// } from '@loopback/rest-explorer';
// import {RepositoryMixin} from '@loopback/repository';
// import {RestApplication} from '@loopback/rest';
// import {ServiceMixin} from '@loopback/service-proxy';
// import path from 'path';
// import {MySequence} from './sequence';

// export {ApplicationConfig};

// export class Wiselb42Application extends BootMixin(
//   ServiceMixin(RepositoryMixin(RestApplication)),
// ) {
//   constructor(options: ApplicationConfig = {}) {
//     super(options);

//     // Set up the custom sequence
//     this.sequence(MySequence);

//     // Set up default home page
//     this.static('/', path.join(__dirname, '../public'));

//     // Customize @loopback/rest-explorer configuration here
//     this.configure(RestExplorerBindings.COMPONENT).to({
//       path: '/explorer',
//     });
//     this.component(RestExplorerComponent);

//     this.projectRoot = __dirname;
//     // Customize @loopback/boot Booter Conventions here
//     this.bootOptions = {
//       controllers: {
//         // Customize ControllerBooter Conventions here
//         dirs: ['controllers'],
//         extensions: ['.controller.js'],
//         nested: true,
//       },
//     };
//   }
// }




import {BootMixin} from '@loopback/boot';
import {ApplicationConfig} from '@loopback/core';
import {RepositoryMixin} from '@loopback/repository';
import {RestApplication, RestBindings, RestMiddlewareGroups} from '@loopback/rest';
import {
  RestExplorerBindings,
  RestExplorerComponent,
} from '@loopback/rest-explorer';
import {ServiceMixin} from '@loopback/service-proxy';
import fs from 'fs';
import multer from 'multer';
import path from 'path';
import {FILE_UPLOAD_SERVICE, STORAGE_DIRECTORY} from './keys';

import {MySequence} from './sequence';
import { rateLimitMiddleware } from './middleware/rate-limit.middleware';
import {jwtAuthMiddleware} from './middleware/jwt-auth.middleware';
import {OrderHistoryController} from './controllers/order-history.controller';

export class Lb4Application extends BootMixin(
  ServiceMixin(RepositoryMixin(RestApplication)),
) {
  constructor(options: ApplicationConfig = {}) {
    super(options);
 
    // Set up the custom sequence
    this.sequence(MySequence);

this.controller(OrderHistoryController);
    this.middleware(rateLimitMiddleware, {
      group: 'rateLimit',
      upstreamGroups: RestMiddlewareGroups.PARSE_PARAMS,
      downstreamGroups: RestMiddlewareGroups.INVOKE_METHOD,
    });

    this.middleware(jwtAuthMiddleware, {
      group: 'jwtAuth',
      upstreamGroups: 'rateLimit',
      downstreamGroups: RestMiddlewareGroups.INVOKE_METHOD,
    });

    // Set up default home page
    this.static('/', path.join(__dirname, '../public'));

    // Customize @loopback/rest-explorer configuration here
    this.configure(RestExplorerBindings.COMPONENT).to({
      path: '/explorer',
    });
    this.component(RestExplorerComponent);
    this.configureFileUpload(options.fileStorageDirectory);
    let storageDestination = 'D:\\loopback\\uploads';
    //let storageDestination = 'C:/Users/CRIS/Desktop/uploads'
    this.bind(RestBindings.ERROR_WRITER_OPTIONS).to({debug: false});
    this.bind(STORAGE_DIRECTORY).to(storageDestination);
    this.setupBinding();

    


    this.projectRoot = __dirname;
    // Customize @loopback/boot Booter Conventions here
    this.bootOptions = {
      controllers: {
        // Customize ControllerBooter Conventions here
        dirs: ['controllers'],
        extensions: ['.controller.js'],
        nested: true,
      },
    };
  }

  setupBinding() {
    //throw new Error('Method not implemented.');
    //this.bind('service.hasher').toClass(BcryptHasher);
    //this.bind('services.user.service').toClass(MyUserService);
    //this.bind('authentication.jwt.secret').to('');
    //this.bind('authentication.jwt.expiresIn').to('7h');
    //this.bind('services.jwt.service').toClass(JWTService);
    //this.bind('CURRENT_USER').to({
    //  name: "NR",
    //  orgslNO: "CR"
    //});
    //this.bind(RestBindings.SequenceActions.REJECT).toProvider(CustomRejectProvider);
   
   
    // var key = "-----BEGIN PUBLIC KEY-----\r\n";
    // key += "MIIBIjANBgkqhkiG9w0BAQEFAAOCAQ8AMIIBCgKCAQEApLUByBCh94oMXBJMceoe\r\n";
    // key += "JuoLt8+VyOq2Nd/nY7xmuLFkRGLiniXlt/hPBTUuKXgU6qCteMPwF0CAAAvvBlab\r\n";
    // key += "QNsWYXaPCY2VNv2GYBDTF4mxNF75FImFAl/R8QlzuDvU0NiBjQjHXk6yVdDhgQec\r\n";
    // key += "nXyqHBEIsJuJyHVtimo7xsBDkryUqRLLOZvXvgpH6oftQ5c4fHCv6Zo6R8y1mXlm\r\n";
    // key += "1BcMneLEsr3zpnM2HUYKwdHTKfpUq93s4YQ54YXzh2KMhkFCFtxyItIHXEEAIUsx\r\n";
    // key += "ZxLB2Hi+uvEhdPy7gFW0BiBDGWHNM0EZ88ZAH4EUg/0qL/b+bkIIF/uGyMejMfqS\r\n";
    // key += "4QIDAQAB\r\n";
    // key += "-----END PUBLIC KEY-----";

    //console.log("key----", key)
   

    //this.bind(AuthenticationBindings.STRATEGY).toClass(CustomJWTAuthenticationStrategy);
    //this.bind(TokenServiceBindings.TOKEN_SECRET).to('')
    //this.bind('TOKEN_SECRET').to('');
  }

  protected configureFileUpload(destination?: string) {
    //console.log("destination", destination)
    // Upload files to `dist/.sandbox` by default
    // destination = destination ?? path.join(__dirname, '../.sandbox');
    //destination = destination ?? path.join(__dirname, '../uploads/');
    //destination = destination ?? 'C:/Users/CRIS/Desktop/uploads/'

    const storageDestination = destination ?? 'D:\\loopback\\uploads';
    // this.bind(STORAGE_DIRECTORY).to(destination);
    const multerOptions: multer.Options = {
      storage: multer.diskStorage({
        // destination: (req, file, cb) => {
        //   console.log('req',req.params)

          //console.log("__dirname", __dirname)
          // checking and creating uploads folder where files will be uploaded
          //var dirPath = path.join(__dirname, '../.sandbox/') + req.query.container

        //   var dirPath =
        //     destination ;
        //   //console.log('configureFileUpload -> dirPath', dirPath);
        //   // cb(null, dirPath + '/');
        // },
        destination: (req, file, cb) => {
          const folder = req.params?.folder || 'default';
          const dirPath = path.join(storageDestination, folder);
          console.log('req body',req.params)
          if (!fs.existsSync(dirPath)) {
            fs.mkdirSync(dirPath, {recursive: true});
          }

          cb(null, dirPath);
        },

        filename: (req, file, cb) => {
          const name =
            req.params?.filename ||
            Date.now() + path.extname(file.originalname);

          cb(null, name);
        },
        // Use the original file name as is
            // filename: (req, file, cb) => {
            //   cb(null, file.originalname);
            //   cb(null, `${req.params.filename}.${file.originalname.split('.').pop()}`);
            //   cb(null, `${req.params.filename}`);
            // },
      }),
    };
    // Configure the file upload service with multer options
    this.configure(FILE_UPLOAD_SERVICE).to(multerOptions);
  }
}