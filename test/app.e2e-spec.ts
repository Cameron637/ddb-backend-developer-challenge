import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication } from '@nestjs/common';
import * as request from 'supertest';
import { AppModule } from '../src/app.module';
import { Connection } from 'mongoose';
import { getConnectionToken } from '@nestjs/mongoose';
import * as briv from '../data/briv.json';

describe('AppController (e2e)', () => {
  let app: INestApplication;
  let connection: Connection;

  const expectedResponse = {
    _id: 'briv',
    total: briv.hitPoints,
    current: briv.hitPoints,
    temporary: 0,
    defenses: {
      [briv.defenses[0].type]: briv.defenses[0].defense,
      [briv.defenses[1].type]: briv.defenses[1].defense,
    },
  };

  const defaultDealDamageDto = {
    damage: [
      {
        amount: 14,
        type: 'piercing',
      },
    ],
  };

  const populateDb = () =>
    request(app.getHttpServer()).put('/hp/briv').send(briv);

  const dealDamage = () =>
    request(app.getHttpServer())
      .post('/hp/briv/deal-damage')
      .send(defaultDealDamageDto);

  beforeEach(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleFixture.createNestApplication();
    connection = moduleFixture.get<Connection>(getConnectionToken());
    await app.init();
  });

  afterEach(async () => {
    await connection.dropCollection('hps');
    await connection.close();
    await app.close();
  });

  it('/ (GET)', () => {
    return request(app.getHttpServer())
      .get('/')
      .expect(200)
      .expect('Hello World!');
  });

  describe('/hp/:id (PUT)', () => {
    const url = '/hp/briv';

    it('returns the created/updated object on success', () => {
      return request(app.getHttpServer())
        .put(url)
        .send(briv)
        .expect(200)
        .expect((res) =>
          expect(res.body).toEqual(expect.objectContaining(expectedResponse)),
        );
    });

    it('fails validation and responds with a 400 when given an invalid request body', () => {
      return request(app.getHttpServer()).put(url).send({}).expect(400);
    });
  });

  describe('/hp/:id (GET)', () => {
    const url = '/hp/briv';

    it('returns HP information for the character with the given id', async () => {
      await populateDb();

      return request(app.getHttpServer())
        .get(url)
        .expect(200)
        .expect((res) =>
          expect(res.body).toEqual(expect.objectContaining(expectedResponse)),
        );
    });

    it('returns a 404 response when hp information does not exist for the given id', () => {
      return request(app.getHttpServer()).get('/hp/test').expect(404);
    });
  });

  describe('/hp/:id/deal-damage (POST)', () => {
    const url = '/hp/briv/deal-damage';

    it('calculates damage and returns updated hp information', async () => {
      await populateDb();

      return request(app.getHttpServer())
        .post(url)
        .send(defaultDealDamageDto)
        .expect(200)
        .expect((res) =>
          expect(res.body).toEqual(
            expect.objectContaining({ ...expectedResponse, current: 11 }),
          ),
        );
    });

    it('returns a 404 response when given an invalid id', () => {
      return request(app.getHttpServer())
        .post('/hp/test/deal-damage')
        .send(defaultDealDamageDto)
        .expect(404);
    });

    it('fails validation and responds with a 400 when given an invalid request body', async () => {
      await populateDb();
      return request(app.getHttpServer()).post(url).send({}).expect(400);
    });
  });

  describe('/hp/:id/heal (POST)', () => {
    const url = '/hp/briv/heal';
    const dto = { amount: 10 };

    it('calculates healing and returns updated hp information', async () => {
      await populateDb();
      await dealDamage();

      return request(app.getHttpServer())
        .post(url)
        .send(dto)
        .expect(200)
        .expect((res) =>
          expect(res.body).toEqual(
            expect.objectContaining({ ...expectedResponse, current: 21 }),
          ),
        );
    });

    it('returns a 404 response when given an invalid id', () => {
      return request(app.getHttpServer())
        .post('/hp/test/heal')
        .send(dto)
        .expect(404);
    });

    it('fails validation and responds with a 400 when given an invalid request body', async () => {
      await populateDb();
      return request(app.getHttpServer()).post(url).send({}).expect(400);
    });
  });

  describe('/hp/:id/add-temporary-hit-points (POST)', () => {
    const url = '/hp/briv/add-temporary-hit-points';
    const dto = { amount: 10 };

    it('calculates temporary hit points and returns updated hp information', async () => {
      await populateDb();

      return request(app.getHttpServer())
        .post(url)
        .send(dto)
        .expect(200)
        .expect((res) =>
          expect(res.body).toEqual(
            expect.objectContaining({ ...expectedResponse, temporary: 10 }),
          ),
        );
    });

    it('returns a 404 response when given an invalid id', () => {
      return request(app.getHttpServer())
        .post('/hp/test/add-temporary-hit-points')
        .send(dto)
        .expect(404);
    });

    it('fails validation and responds with a 400 when given an invalid request body', async () => {
      await populateDb();
      return request(app.getHttpServer()).post(url).send({}).expect(400);
    });
  });
});
