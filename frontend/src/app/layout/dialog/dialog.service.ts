import { Injectable, Type } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { filter, map } from 'rxjs/operators';
import { DialogFormComponent, DialogFormData } from './form-dialog/dialog-form.component';
import { DialogConfirmComponent, DialogConfirmData } from './confirm-dialog/dialog-confirm.component';

@Injectable({
  providedIn: 'root',
})
export class DialogService {
  constructor(private dialog: MatDialog) { }

  openForm<T>(config: {
    formComponent: Type<T>;
    title: string;
    value?: any;
    resources?: any;
    readonly?: boolean;
  }) {
    const dialogRef = this.dialog.open(DialogFormComponent, {
      width: '1500px',
      data: {
        formComponent: config.formComponent,
        title: config.title,
        value: config.value,
        resources: config.resources,
        readonly: config.readonly
      } as DialogFormData
    });
    return dialogRef.afterClosed().pipe(filter(res => !!res));
  }

  openConfirm(config: { title: string; message: string }) {
    const dialogRef = this.dialog.open(DialogConfirmComponent, {
      width: '400px',
      data: {
        title: config.title,
        message: config.message
      } as DialogConfirmData
    });
    return dialogRef.afterClosed().pipe(map(Boolean));
  }
}
