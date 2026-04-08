import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, Between } from 'typeorm';
import { LaundryForm } from '../forms/entities/laundry-form.entity';
import { FormItem } from '../forms/entities/form-item.entity';

@Injectable()
export class ReportsService {
  constructor(
    @InjectRepository(LaundryForm)
    private formsRepository: Repository<LaundryForm>,
    @InjectRepository(FormItem)
    private itemsRepository: Repository<FormItem>,
  ) {}

  async getCompanyTotals(companyId: string, startDate?: string, endDate?: string) {
    const where: any = { company: { id: companyId } };
    
    if (startDate && endDate) {
      where.date = Between(startDate, endDate);
    }

    const forms = await this.formsRepository.find({
      where,
      relations: ['sections', 'sections.items'],
    });

    const report = {
      companyId,
      totalForms: forms.length,
      totals: {
        standard: 0,
        colored: 0,
        standardItems: {} as Record<string, number>,
        coloredItems: {} as Record<string, number>,
        sheetSizes: {
          SIMPLE: 0,
          DOUBLE: 0,
          QUEEN: 0,
          KING: 0,
        },
        plasticBags: {
          small: 0,
          large: 0,
          total: 0,
        },
        pockets: 0,
      },
    };

    for (const form of forms) {
      report.totals.pockets += form.pocketCount;
      report.totals.plasticBags.small += form.plasticBagsSmall;
      report.totals.plasticBags.large += form.plasticBagsLarge;

      for (const section of form.sections) {
        for (const item of section.items) {
          const qty = item.quantity;
          if (item.isColored) {
            report.totals.colored += qty;
            report.totals.coloredItems[item.category] = (report.totals.coloredItems[item.category] || 0) + qty;
          } else {
            report.totals.standard += qty;
            report.totals.standardItems[item.category] = (report.totals.standardItems[item.category] || 0) + qty;
          }

          if (item.size) {
            report.totals.sheetSizes[item.size] += qty;
          }
        }
      }
    }

    report.totals.plasticBags.total = report.totals.plasticBags.small + report.totals.plasticBags.large;

    return report;
  }
}
