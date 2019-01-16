import {Component, Inject, OnInit} from '@angular/core';
import {AbstractControl, FormArray, FormBuilder, FormGroup, ValidationErrors, Validators} from '@angular/forms';
import {MAT_DIALOG_DATA, MatDialogRef, MatSnackBar} from '@angular/material';
import {LoaderService} from '../../Common/Loader';
import {AdminService} from '../../Admin/admin.service';
import {GlobalValidators} from '../../Common/Validators/globalValidators';
import {ContactService} from '../../Contact/contact.service';

@Component({
  selector: 'app-add-contact-dialog',
  templateUrl: './add-contact-dialog.component.html',
  styleUrls: ['./add-contact-dialog.component.css']
})
export class AddContactDialogComponent implements OnInit {

  contactForm: FormGroup;
  existing = false;

  constructor(
    private fb: FormBuilder,
    private dialogRef: MatDialogRef<AddContactDialogComponent>,
    public loaderService: LoaderService,
    private adminService: AdminService,
    private contactService: ContactService,
    private matSnack: MatSnackBar,
    @Inject(MAT_DIALOG_DATA) public data: any
  ) {
    this.createContactsForm();
    if (data) {
      this.existing = true;
      this.contactForm.patchValue(data);
      this.email.clearAsyncValidators();
      this.email.updateValueAndValidity();
    }
  }

  ngOnInit() {
  }
  close() {
    this.dialogRef.close();
  }

  createContactsForm() {
    this.contactForm = this.fb.group({
      _id: [null],
      title: ['', Validators.required],
      name: ['', Validators.required],
      surname: ['', Validators.required],
      cell: ['', [Validators.required, GlobalValidators.cellRegex]],
      email: ['', [GlobalValidators.validEmail], this.shouldBeUnique.bind(this)],
      type: ['', Validators.required]
    });
  }
  get title() {
    return this.contactForm.get('title');
  }
  get name() {
    return this.contactForm.get('name');
  }
  get surname() {
    return this.contactForm.get('surname');
  }
  get cell() {
    return this.contactForm.get('cell');
  }
  get email() {
    return this.contactForm.get('email');
  }
  get type() {
    return this.contactForm.get('type');
  }
  submitContact() {
    if (this.contactForm.valid) {
      this.contactService.createContact(this.contactForm.value)
        .subscribe(res => {
          if (res) {
            this.matSnack.open('Contact added successfully');
            this.dialogRef.close(res);
          } else {
            const sb = this.matSnack.open('Contact not created successful', 'retry');
            sb.onAction().subscribe(() => {
              this.submitContact();
            });
          }
        }, err => {
          const sb = this.matSnack.open('Contact not created successful', 'retry');
          sb.onAction().subscribe(() => {
            this.submitContact();
          });
          console.log(err);
        });
    }
  }
  updateContact() {
    if (this.contactForm.valid) {
      this.contactService.updateContact(this.contactForm.value)
        .subscribe(res => {
          if (res) {
            this.matSnack.open('Contact updated successfully');
            this.dialogRef.close(res);
          } else {
            const sb = this.matSnack.open('Contact not updated successful', 'retry');
            sb.onAction().subscribe(() => {
              this.updateContact();
            });
          }
        }, err => {
          const sb = this.matSnack.open('Contact not updated successful', 'retry');
          sb.onAction().subscribe(() => {
            this.updateContact();
          });
          console.log(err);
        });
    }
  }
  onEmailChange() {
    console.log('email update');
    if (this.existing) {
      if (this.email.value !== this.data.email) {
        this.email.setAsyncValidators(this.shouldBeUnique.bind(this));
        this.email.updateValueAndValidity();
      } else {
        this.email.clearAsyncValidators();
        this.email.updateValueAndValidity();
      }
    }
  }

  shouldBeUnique(control: AbstractControl): Promise<ValidationErrors> | null {
    const q = new Promise((resolve, reject) => {
      setTimeout(() => {
        this.contactService.getContactByEmail(control.value).subscribe((res) => {
          if (!res) {
            resolve(null);
          } else {
            resolve({'emailNotUnique': true});
          }
        });
      }, 100);
    });
    return q;
  }
}
