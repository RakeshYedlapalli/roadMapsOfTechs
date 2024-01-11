 <div class="col-md-3">
            <mat-icon class="icon">lightbulb</mat-icon>
            <mat-label>Client Name(s)</mat-label>
            <mat-form-field #formfieldClientNames [appearance]="appearance">
                <mat-label>Client Name(sss)</mat-label>
                <mat-chip-grid #chipListClientNames aria-describedby="Client Name(s)" formControlName="clientName"
                               cdkDropList
                               [ngClass]="{'mat-chip-list-wrapper-vertical': (dragAndDropService.getOrientation(COMPONENT_NAME,'clientName') | async) === 'vertical' && formGroup.enabled}"
                               [cdkDropListOrientation]="dragAndDropService.getOrientation(COMPONENT_NAME,'clientName') | async"
                               (cdkDropListDropped)="dropClientNames($event)"
                >
                    <mat-chip-row style="cursor: pointer"
                              cdkDrag
                              [cdkDragDisabled]="formGroup.get('clientName').disabled"
                              *ngFor="let client of formGroup.get('clientName').value; let i = index"
                              (click)="redirectToClientLiveClientUrl(client.clientLiveReference)"
                              [selectable]="true"
                              [removable]="true"
                              (removed)="removeClientName(client)"
                              [ngClass]="{'thirdparty-lead': i === 0}">
                        {{client.clientLiveReference}} - {{client.name}}
                        <mat-icon matChipRemove>cancel</mat-icon>
                    </mat-chip-row>
                    <input matInput #clientNamesInput formControlName="clientNameInput"
                           [matAutocomplete]="clientNamesAuto"
                           [matChipInputFor]="chipListClientNames" [matChipInputSeparatorKeyCodes]="separatorKeysCodes"
                           [matChipInputAddOnBlur]="false" (blur)="checkClientName($event.target.value)">
                    <div *ngIf="clientNamesInputLoading" class="spinner">
                        <mat-spinner diameter="20"></mat-spinner>
                    </div>
                </mat-chip-grid>
                <mat-icon *ngIf="formGroup.enabled" matSuffix>search</mat-icon>
                <mat-autocomplete #clientNamesAuto="matAutocomplete" (optionSelected)="selectedClientName($event)" [panelWidth]="'auto'">
                    <mat-option class="mat-autocomplete-option"
                                *ngFor="let client of commercialClients | filterExclude:formGroup.get('clientName').value:'clientLiveReference'"
                                [value]="client">
                        <small>{{client.clientLiveReference}} - {{client.name}}</small>
                    </mat-option>
                </mat-autocomplete>
                <mat-hint *ngIf="isClientNameError">
                    <span class="form-error">Invalid client name</span>
                </mat-hint>
            </mat-form-field>
        </div>
