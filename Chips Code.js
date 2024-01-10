  <div class="row">
        <div class="col-md-4">
            <mat-label>PCO Name(s)</mat-label>
            <mat-form-field [appearance]="appearance">
                  <mat-chip-grid #chipGrid>
                    <mat-chip-row *ngFor="let employee of formGroup.get('pcoName').value">
                      {{employee}}
                    </mat-chip-row>
                  </mat-chip-grid>
                  <input [matChipInputFor]="chipGrid"/>
            </mat-form-field>
        </div>
        <div class="col-md-4">
            <mat-label>PCO Country(ies)</mat-label>
            <mat-form-field [appearance]="appearance">
                <mat-chip-grid #chipGrid>
                    <mat-chip-row *ngFor="let country of formGroup.get('pcoCountry').value">
                      {{country}}
                    </mat-chip-row>
                  </mat-chip-grid>
                  <input [matChipInputFor]="chipGrid"/>
            </mat-form-field>
        </div>
    </div>

    <div class="row">
        <div class="col-md-4">
            <mat-label>PAM Name(s)</mat-label>
            <mat-form-field [appearance]="appearance">
                <mat-chip-grid #chipGrid>
                    <mat-chip-row *ngFor="let employee of formGroup.get('pamName').value">
                      {{employee}}
                    </mat-chip-row>
                  </mat-chip-grid>
                  <input [matChipInputFor]="chipGrid"/>
            </mat-form-field>
        </div>
        <div class="col-md-4">
            <mat-label>PAM Country(ies)</mat-label>
            <mat-form-field [appearance]="appearance">
                <mat-chip-grid #chipGrid>
                    <mat-chip-row *ngFor="let country of formGroup.get('pamCountry').value">
                      {{country}}
                    </mat-chip-row>
                  </mat-chip-grid>
                  <input [matChipInputFor]="chipGrid"/>
            </mat-form-field>
        </div>
    </div>
