import { Component, Inject, OnInit, ViewChild, ViewContainerRef, ComponentRef, Type } from '@angular/core';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';

export interface DialogFormData {
  formComponent: Type<any>;
  title: string;
  value?: any;
  resources?: any;
  readonly?: boolean;
}

@Component({
  selector: 'app-dialog-form',
  standalone: false,
  templateUrl: './dialog-form.component.html',
  styleUrls: ['./dialog-form.component.scss']
})
export class DialogFormComponent implements OnInit {
  @ViewChild('formContainer', { read: ViewContainerRef, static: true })
  formContainer!: ViewContainerRef;

  formInstance!: ComponentRef<any>;

  constructor(
    private dialogRef: MatDialogRef<DialogFormComponent>,
    @Inject(MAT_DIALOG_DATA) public data: DialogFormData
  ) { }

  ngOnInit(): void {
    this.formContainer.clear();
    this.formInstance = this.formContainer.createComponent(this.data.formComponent);

    if (this.data.value) {
      Object.assign(this.formInstance.instance, { data: this.data.value });
    }

    if (this.data.resources) {
      Object.assign(this.formInstance.instance, { resources: this.data.resources });
    }

    if (this.data.readonly && this.formInstance.instance.setFormReadOnly) {
      this.formInstance.instance.setFormReadOnly(this.data.readonly);
    }
  }

  salvar(): void {
    if (this.formInstance.instance.form?.valid) {
      this.dialogRef.close(this.formInstance.instance.form.value);
    }
  }

  cancelar(): void {
    this.dialogRef.close(null);
  }

  isSaveDisabled(): boolean {
    return this.formInstance?.instance.form?.invalid ?? true;
  }
}
