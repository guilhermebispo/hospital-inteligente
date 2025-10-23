import { Component, Inject } from '@angular/core';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';

export interface DialogConfirmData {
  title: string;
  message: string;
}

@Component({
  selector: 'app-dialog-confirm',
  standalone: false,
  templateUrl: './dialog-confirm.component.html',
  styleUrls: ['./dialog-confirm.component.scss']
})
export class DialogConfirmComponent {
  constructor(
    private dialogRef: MatDialogRef<DialogConfirmComponent>,
    @Inject(MAT_DIALOG_DATA) public data: DialogConfirmData
  ) {}

  cancelar(): void {
    this.dialogRef.close(false);
  }

  confirmar(): void {
    this.dialogRef.close(true);
  }
}
