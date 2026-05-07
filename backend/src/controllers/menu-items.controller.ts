import {
  Count,
  CountSchema,
  Filter,
  FilterExcludingWhere,
  repository,
  Where,
} from '@loopback/repository';
import {
  post,
  param,
  get,
  getModelSchemaRef,
  patch,
  put,
  del,
  requestBody,
  response,
} from '@loopback/rest';
import {MenuItems} from '../models';
import {MenuItemsRepository} from '../repositories';
import multer from 'multer';
import path from 'path';
import {inject} from '@loopback/core';
import {RestBindings, Request} from '@loopback/rest';
// multer config (with extension)
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, 'public/uploads');
  },
  filename: (req, file, cb) => {
    const ext = path.extname(file.originalname); // .jpg / .png
   cb(null, Date.now() + '-' + file.originalname);
  },
});

const upload = multer({storage});

export class MenuItemsController {
  constructor(
    @repository(MenuItemsRepository)
    public menuItemsRepository : MenuItemsRepository,
  ) {}

  @post('/menu-items')
  @response(200, {
    description: 'MenuItems model instance',
    content: {'application/json': {schema: getModelSchemaRef(MenuItems)}},
  })
  async create(
    @requestBody({
      content: {
        'application/json': {
          schema: getModelSchemaRef(MenuItems, {
            title: 'NewMenuItems',
            exclude: ['id'],
          }),
        },
      },
    })
    menuItems: Omit<MenuItems, 'id'>,
  ): Promise<MenuItems> {
    return this.menuItemsRepository.create(menuItems);
  }

  @get('/menu-items/count')
  @response(200, {
    description: 'MenuItems model count',
    content: {'application/json': {schema: CountSchema}},
  })
  async count(
    @param.where(MenuItems) where?: Where<MenuItems>,
  ): Promise<Count> {
    return this.menuItemsRepository.count(where);
  }

  @get('/menu-items')
  @response(200, {
    description: 'Array of MenuItems model instances',
    content: {
      'application/json': {
        schema: {
          type: 'array',
          items: getModelSchemaRef(MenuItems, {includeRelations: true}),
        },
      },
    },
  })
  async find(
    @param.filter(MenuItems) filter?: Filter<MenuItems>,
  ): Promise<MenuItems[]> {
    return this.menuItemsRepository.find(filter);
  }

  @patch('/menu-items')
  @response(200, {
    description: 'MenuItems PATCH success count',
    content: {'application/json': {schema: CountSchema}},
  })
  async updateAll(
    @requestBody({
      content: {
        'application/json': {
          schema: getModelSchemaRef(MenuItems, {partial: true}),
        },
      },
    })
    menuItems: MenuItems,
    @param.where(MenuItems) where?: Where<MenuItems>,
  ): Promise<Count> {
    return this.menuItemsRepository.updateAll(menuItems, where);
  }

  @get('/menu-items/{id}')
  @response(200, {
    description: 'MenuItems model instance',
    content: {
      'application/json': {
        schema: getModelSchemaRef(MenuItems, {includeRelations: true}),
      },
    },
  })
  async findById(
    @param.path.string('id') id: string,
    @param.filter(MenuItems, {exclude: 'where'}) filter?: FilterExcludingWhere<MenuItems>
  ): Promise<MenuItems> {
    return this.menuItemsRepository.findById(id, filter);
  }

  @patch('/menu-items/{id}')
  @response(204, {
    description: 'MenuItems PATCH success',
  })
  async updateById(
    @param.path.string('id') id: string,
    @requestBody({
      content: {
        'application/json': {
          schema: getModelSchemaRef(MenuItems, {partial: true}),
        },
      },
    })
    menuItems: MenuItems,
  ): Promise<void> {
    await this.menuItemsRepository.updateById(id, menuItems);
  }

  @put('/menu-items/{id}')
  @response(204, {
    description: 'MenuItems PUT success',
  })
  async replaceById(
    @param.path.string('id') id: string,
    @requestBody() menuItems: MenuItems,
  ): Promise<void> {
    await this.menuItemsRepository.replaceById(id, menuItems);
  }

  @del('/menu-items/{id}')
  @response(204, {
    description: 'MenuItems DELETE success',
  })
  async deleteById(@param.path.string('id') id: string): Promise<void> {
    await this.menuItemsRepository.deleteById(id);
  }


 



  @post('/menu-items-with-image')
  async createWithImage(
    @requestBody.file() request: Request,
    @inject(RestBindings.Http.RESPONSE) response: any,
  ) {
    return new Promise((resolve, reject) => {
      upload.single('file')(request, response, async (err: any) => {
        if (err) return reject(err);

        const file = request.file;

        if (!file) {
          return reject(new Error('Image not uploaded'));
        }

        try {
          // get other fields from form-data
          const {name, price,id} = request.body;

          const menuItem = await this.menuItemsRepository.create({
            name,
            price,
            id,
            image_url: `/uploads/${file.filename}`,
          });

          resolve(menuItem);
        } catch (e) {
          reject(e);
        }
      });
    });
  }
  @get('/item-image')
async findAll() {
  const items = await this.menuItemsRepository.find();

  return items.map(item => ({
    ...item,
    image_url: item.image_url
      ? `http://localhost:3000${item.image_url}`
      : null,
  }));
}
}







