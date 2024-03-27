import { Test, TestingModule } from '@nestjs/testing';
import { HpController } from './hp.controller';
import { HpService } from './hp.service';
import { CreateOrUpdateHpDto } from './dto/create-or-update-hp.dto';
import { Hp } from './schemas/hp.schema';
import * as briv from '../../data/briv.json';
import { getModelToken } from '@nestjs/mongoose';
import type { DamageType, DefenseType } from '../constants';
import type { DealDamageDto } from './dto/deal-damage.dto';
import type { HealDto } from './dto/heal.dto';
import type { AddTemporaryHitPointsDto } from './dto/add-temporary-hit-points.dto';

describe('HpController', () => {
  const dto = briv as CreateOrUpdateHpDto;
  let hpController: HpController;
  let saveMock = jest.fn();
  let databaseMock: Record<string, HpModelMock> = {};

  class HpModelMock {
    _id: string;
    total: number;
    current: number;
    temporary = 0;
    defenses: Record<DamageType, DefenseType>;
    save: jest.Mock;
    static findById = jest.fn((id: string) => databaseMock[id]);

    constructor(params: {
      _id: string;
      total: number;
      current: number;
      defenses: Record<DamageType, DefenseType>;
    }) {
      this._id = params._id;
      this.total = params.total;
      this.current = params.current;
      this.defenses = params.defenses;
      this.save = saveMock;

      this.save.mockImplementation(() => {
        databaseMock[params._id] = this;
        return this;
      });
    }
  }

  const defaultDealDamageDto: DealDamageDto = {
    damage: [
      {
        type: 'piercing',
        amount: 14,
      },
    ],
  };

  const defaultHealDto: HealDto = { amount: 10 };

  const defaultAddTemporaryHitPointsDto: AddTemporaryHitPointsDto = {
    amount: 10,
  };

  beforeEach(async () => {
    const app: TestingModule = await Test.createTestingModule({
      controllers: [HpController],
      providers: [
        HpService,
        { provide: getModelToken(Hp.name), useValue: HpModelMock },
      ],
    }).compile();

    hpController = app.get<HpController>(HpController);
    saveMock = jest.fn();
    databaseMock = {};
  });

  describe(':id', () => {
    it('should return a created or updated HP resource with the given id on PUT', async () => {
      const response = await hpController.createOrUpdate('briv', dto);
      expect(databaseMock['briv']).toEqual(response);
      expect(saveMock).toHaveBeenCalled();
      expect(response._id).toBe('briv');
      expect(response.total).toBe(briv.hitPoints);
      expect(response.current).toBe(briv.hitPoints);
      expect(response.temporary).toBe(0);

      dto.defenses.forEach(({ type, defense }) => {
        expect(response.defenses[type] === defense);
      });
    });

    it('should fail with an invalid DTO object', () => {
      expect(
        async () =>
          await hpController.createOrUpdate('briv', {} as CreateOrUpdateHpDto),
      ).rejects.toThrow();

      expect(databaseMock['briv']).toBeUndefined();
    });

    it('should find an object with the given id on GET', async () => {
      await hpController.createOrUpdate('briv', dto);
      const response = await hpController.findById('briv');
      expect(response).toEqual(databaseMock['briv']);
    });

    it('should respond with a 404 error if given id not found on GET', async () => {
      expect(async () => await hpController.findById('briv')).rejects.toThrow();
    });
  });

  describe(':id/deal-damage', () => {
    it('should update current hp', async () => {
      await hpController.createOrUpdate('briv', dto);

      const response = await hpController.dealDamage(
        'briv',
        defaultDealDamageDto,
      );

      expect(response.current).toBe(11);
    });

    it('should take defenses into account', async () => {
      await hpController.createOrUpdate('briv', dto);

      const response = await hpController.dealDamage('briv', {
        damage: [
          {
            type: 'fire',
            amount: 10,
          },
          {
            type: 'slashing',
            amount: 10,
          },
        ],
      });

      expect(response.current).toBe(20);
    });

    it('should take temporary hit points into account', async () => {
      await hpController.createOrUpdate('briv', dto);

      await hpController.addTemporaryHitPoints(
        'briv',
        defaultAddTemporaryHitPointsDto,
      );

      const response = await hpController.dealDamage(
        'briv',
        defaultDealDamageDto,
      );

      expect(response.temporary).toBe(0);
      expect(response.current).toBe(21);
    });
  });

  describe(':id/heal', () => {
    it('should update current hp', async () => {
      await hpController.createOrUpdate('briv', dto);
      await hpController.dealDamage('briv', defaultDealDamageDto);
      const response = await hpController.heal('briv', defaultHealDto);
      expect(response.current).toBe(21);
    });

    it('should not allow to heal beyond total', async () => {
      await hpController.createOrUpdate('briv', dto);
      await hpController.dealDamage('briv', defaultDealDamageDto);
      const response = await hpController.heal('briv', { amount: 20 });
      expect(response.current).toBe(response.total);
      expect(response.current).toBe(25);
    });

    it('should not heal temporary hit points', async () => {
      await hpController.createOrUpdate('briv', dto);
      await hpController.addTemporaryHitPoints('briv', { amount: 15 });
      await hpController.dealDamage('briv', defaultDealDamageDto);
      const response = await hpController.heal('briv', { amount: 14 });
      expect(response.temporary).toBe(1);
    });
  });

  describe(':id/add-temporary-hit-points', () => {
    it('should not be additive and always take the higher value', async () => {
      await hpController.createOrUpdate('briv', dto);

      const firstResponse = await hpController.addTemporaryHitPoints(
        'briv',
        defaultAddTemporaryHitPointsDto,
      );

      expect(firstResponse.temporary).toBe(10);

      const secondResponse = await hpController.addTemporaryHitPoints('briv', {
        amount: 15,
      });

      expect(secondResponse.temporary).toBe(15);
    });
  });
});
