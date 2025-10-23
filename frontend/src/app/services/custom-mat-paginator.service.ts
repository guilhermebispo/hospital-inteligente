import { Injectable } from '@angular/core';
import { MatPaginatorIntl } from '@angular/material/paginator';
import { TranslateService } from '@ngx-translate/core';

@Injectable()
export class CustomMatPaginatorService extends MatPaginatorIntl {
  constructor(private translateService: TranslateService) {
    super();
    this.translateService.onLangChange.subscribe(() => this.updateLabels());
    this.updateLabels();
  }

  override getRangeLabel = (page: number, pageSize: number, length: number): string => {
    if (length === 0 || pageSize === 0) {
      return this.translateService.instant('paginator.rangeZero', { length });
    }
    const startIndex = page * pageSize;
    const endIndex = startIndex < length
      ? Math.min(startIndex + pageSize, length)
      : startIndex + pageSize;

    return this.translateService.instant('paginator.range', {
      start: startIndex + 1,
      end: endIndex,
      length
    });
  };

  private updateLabels(): void {
    this.itemsPerPageLabel = this.translateService.instant('paginator.itemsPerPage');
    this.nextPageLabel = this.translateService.instant('paginator.nextPage');
    this.previousPageLabel = this.translateService.instant('paginator.previousPage');
    this.firstPageLabel = this.translateService.instant('paginator.firstPage');
    this.lastPageLabel = this.translateService.instant('paginator.lastPage');
    this.changes.next();
  }
}
