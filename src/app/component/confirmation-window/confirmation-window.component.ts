import {Component, Inject, Input} from '@angular/core';
import {MAT_DIALOG_DATA, MatDialogRef} from "@angular/material/dialog";

@Component({
  selector: 'app-confirmation-window',
  templateUrl: './confirmation-window.component.html',
  styleUrls: ['./confirmation-window.component.css']
})
export class ConfirmationWindowComponent {

  /** The text shown to the user. Defaults to "Are you sure?". */
  @Input() text = 'Are you sure?';

  /** Text for the confirmation button. Defaults to "yes". */
  @Input() confirmationText = 'Yes';

  /**
   * The icon that will be used in the confirmation button. By default, no icon will be used.
   * For a list, see: https://www.angularjswiki.com/angular/angular-material-icons-list-mat-icon-list/
   */
  @Input() confirmationIcon: string | undefined;

  /**
   * The color used for the confirmation button. Defaults to "primary".
   */
  @Input() confirmationColor: 'primary' | 'accent' | 'warn' = 'primary';
  @Input() cancelText = 'Cancel';

  constructor(public dialogRef: MatDialogRef<ConfirmationWindowComponent>,
              @Inject(MAT_DIALOG_DATA) public data: { text: string, confirmationText: string, confirmationIcon: string | undefined,
              confirmationColor: 'primary' | 'accent' | 'warn', cancelText: string}) {
    this.text = data.text || 'Are you sure?';
    this.confirmationText = data.confirmationText || 'Yes';
    this.confirmationIcon = data.confirmationIcon;
    this.confirmationColor = data.confirmationColor || 'primary';
    this.cancelText = data.cancelText || 'Cancel';
  }

}
