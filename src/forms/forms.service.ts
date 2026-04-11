import {
  Injectable, NotFoundException, ForbiddenException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, Between } from 'typeorm';
import { LaundryForm, FormStatus } from './entities/laundry-form.entity';
import { FormSection } from './entities/form-section.entity';
import { FormItem } from './entities/form-item.entity';
import { CatalogItem } from './entities/catalog-item.entity';
import { CreateFormDto } from './dto/create-form.dto';
import { UpdateFormDto } from './dto/update-form.dto';
import { EventsGateway } from '../events/events.gateway';

@Injectable()
export class FormsService {
  constructor(
    @InjectRepository(LaundryForm)
    private formsRepository: Repository<LaundryForm>,
    @InjectRepository(FormSection)
    private sectionsRepository: Repository<FormSection>,
    @InjectRepository(FormItem)
    private itemsRepository: Repository<FormItem>,
    @InjectRepository(CatalogItem)
    private catalogRepository: Repository<CatalogItem>,
    private eventsGateway: EventsGateway,
  ) {}

  async getStats() {
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const todayCount = await this.formsRepository.count({
      where: {
        createdAt: Between(today, new Date()),
        isActive: true,
      },
    });

    const pendingCount = await this.formsRepository.count({
      where: {
        status: FormStatus.PENDING_APPROVAL,
        isActive: true,
      },
    });

    return { today: todayCount, pending: pendingCount };
  }

  getCatalog(): Promise<CatalogItem[]> {
    return this.catalogRepository.find({
      order: { category: 'ASC', displayOrder: 'ASC' },
    });
  }

  async create(createFormDto: CreateFormDto, userId: string): Promise<LaundryForm> {
    const form = this.formsRepository.create({
      company: { id: createFormDto.companyId } as any,
      date: createFormDto.date,
      pocketCount: createFormDto.pocketCount ?? 0,
      plasticBagsSmall: createFormDto.plasticBagsSmall ?? 0,
      plasticBagsLarge: createFormDto.plasticBagsLarge ?? 0,
      notes: createFormDto.notes,
      totalTaiesMain: createFormDto.totalTaiesMain ?? 0,
      totalDrapsMain: createFormDto.totalDrapsMain ?? 0,
      status: (createFormDto.status as any) || FormStatus.DRAFT,
      createdBy: { id: userId } as any,
    });

    const savedForm = await this.formsRepository.save(form);

    for (const sectionDto of createFormDto.sections) {
      const section = this.sectionsRepository.create({
        sectionName: sectionDto.sectionName,
        filledByInitials: sectionDto.filledByInitials,
        form: savedForm,
      });
      const savedSection = await this.sectionsRepository.save(section);

      if (sectionDto.items && sectionDto.items.length > 0) {
        const items = sectionDto.items.map((itemDto) =>
          this.itemsRepository.create({
            category: itemDto.category,
            size: itemDto.size,
            isColored: itemDto.isColored ?? false,
            quantity: itemDto.quantity,
            section: savedSection,
          }),
        );
        await this.itemsRepository.save(items);
      }
    }

    if (savedForm.status === FormStatus.PENDING_APPROVAL) {
      this.eventsGateway.sendToAdmins('notification', {
        title: 'New Pending Report',
        message: `A new report from ${createFormDto.companyId} requires approval.`,
        formId: savedForm.id,
      });
    }

    return this.findOne(savedForm.id);
  }

  findAll(filters?: any): Promise<LaundryForm[]> {
    const where: any = { isActive: true };

    if (filters?.companyId) where.company = { id: filters.companyId };
    if (filters?.employeeId) where.createdBy = { id: filters.employeeId };
    if (filters?.status) where.status = filters.status;
    if (filters?.startDate && filters?.endDate) {
      where.date = Between(filters.startDate, filters.endDate);
    }

    return this.formsRepository.find({
      where,
      relations: ['company', 'createdBy', 'approvedBy', 'sections', 'sections.items'],
    });
  }

  async findOne(id: string): Promise<LaundryForm> {
    const form = await this.formsRepository.findOne({
      where: { id, isActive: true },
      relations: ['company', 'createdBy', 'approvedBy', 'sections', 'sections.items'],
    });
    if (!form) throw new NotFoundException(`Form #${id} not found`);
    return form;
  }

  async update(id: string, updateFormDto: UpdateFormDto): Promise<LaundryForm> {
    const form = await this.findOne(id);
    if (form.status === FormStatus.APPROVED) {
      throw new ForbiddenException('Cannot edit an approved form');
    }
    if (updateFormDto.date !== undefined) form.date = updateFormDto.date;
    if (updateFormDto.pocketCount !== undefined) form.pocketCount = updateFormDto.pocketCount;
    if (updateFormDto.plasticBagsSmall !== undefined) form.plasticBagsSmall = updateFormDto.plasticBagsSmall;
    if (updateFormDto.plasticBagsLarge !== undefined) form.plasticBagsLarge = updateFormDto.plasticBagsLarge;
    if (updateFormDto.notes !== undefined) form.notes = updateFormDto.notes;
    return this.formsRepository.save(form);
  }

  async approve(id: string, managerId: string): Promise<LaundryForm> {
    const form = await this.findOne(id);
    if (form.status === FormStatus.APPROVED) {
      throw new ForbiddenException('Form is already approved');
    }
    form.status = FormStatus.APPROVED;
    form.approvedBy = { id: managerId } as any;
    return this.formsRepository.save(form);
  }

  async remove(id: string): Promise<void> {
    await this.findOne(id);
    await this.formsRepository.update(id, { isActive: false });
  }
}
