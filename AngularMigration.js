I am facing an issue in mat-chip-grid, mat-chip-row where Mdc Chip Grid empties all options when focusing out the mouse, attaching the below HTML and Component code, so as mentioned in the below I am using Anglar Expression
to read the data dynamically, HOwever, when I select the data from dropdown it works find but when I focus out the mouse then it empties the data and shows a blank one, what could be the issue causing this error?, what are the possible reasons?
So when I debug client.clientLiveReference is coming as undefined when I focus out the mouse
HTML :
===========

<div class="col-md-3">
            <mat-icon class="icon">lightbulb</mat-icon>
            <mat-label>Client Name(s)</mat-label>
            <mat-form-field #formfieldClientNames [appearance]="appearance">
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
                              [ngClass]="{'thirdparty-lead': i === 0}"
                              [matChipInputAddOnBlur]="false" (blur)="checkClientName($event.target.value)"
                              >
                        {{client.clientLiveReference }} - {{client.name}}
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


Component:

import {
    AfterViewInit,
    ChangeDetectorRef,
    Component,
    ElementRef,
    HostListener,
    Input,
    OnChanges,
    OnInit,
    SimpleChanges,
    ViewChild
} from '@angular/core';
import {UntypedFormGroup} from '@angular/forms';
import {CommercialClient, Opportunity, Service, Thirdparty, RTSCounterparty} from '../../../../api/apiclient';
import {GenericComponent} from '@ldt/common/generic.component';
import _ from 'lodash';
import {MatAutocompleteSelectedEvent} from '@angular/material/autocomplete';
import {COMMA, ENTER} from '@angular/cdk/keycodes';
import {debounceTime, distinctUntilChanged, filter} from 'rxjs/operators';
import {ReferentialService} from '@ldt/services/referential.service';
import {BehaviorSubject, Observable} from 'rxjs';
import {environment} from "../../../../environments/environment";
import {CdkDragDrop, DropListOrientation, moveItemInArray} from "@angular/cdk/drag-drop";
import {MatChipListbox} from "@angular/material/chips";
import {MatFormField} from "@angular/material/form-field";
import {DragAndDropService, DragDropItem} from "@ldt/services/drag-and-drop.service";

@Component({
    selector: 'app-client-sponsor-section',
    templateUrl: './client-sponsor-section.component.html',
    styleUrls: ['./client-sponsor-section.component.scss']
})
export class ClientSponsorSectionComponent extends GenericComponent implements OnInit, OnChanges, AfterViewInit {
    COMPONENT_NAME = ClientSponsorSectionComponent.name;
    @Input() formGroup: UntypedFormGroup;
    @Input() opportunity: Opportunity;
    @ViewChild('clientNamesInput', {static: true}) clientNamesInput: ElementRef<HTMLInputElement>;
    @ViewChild('sponsorNamesInput', {static: true}) sponsorNamesInput: ElementRef<HTMLInputElement>;
    @ViewChild('cpyBorrowerNamesInput', {static: true}) cpyBorrowerNamesInput: ElementRef<HTMLInputElement>;
    @ViewChild('cphBorrowerNameInput', {static: true}) cphBorrowerNameInput: ElementRef<HTMLInputElement>;
    @ViewChild('guarantorNameInput', {static: true}) guarantorNameInput: ElementRef<HTMLInputElement>;
    @ViewChild('ecaNameInput', {static: true}) ecaNameInput: ElementRef<HTMLInputElement>;
    clientNamesInputLoading = false;
    sponsorNamesInputLoading = false;
    guarantorNamesInputLoading = false;
    ecaNamesInputLoading = false;
    cpyBorrowerNamesInputLoading = false;
    isClientNameError = false;
    isSponsorNameError = false;
    startByClient = true;
    isCpyBorrowerNameError = false;
    subSectors = [];
    commercialClients: CommercialClient[] = [];
    sponsorNames: CommercialClient[] = [];
    separatorKeysCodes: number[] = [ENTER, COMMA];
    cpyBorrowers: Thirdparty[] = [];
    cpyBorrowersOriginal: Thirdparty[] = [];
    guarantorsList: Thirdparty[] = [];
    ecasList: Thirdparty[] = [];
    /**
     * ViewChildren for Drag&Drop behavior
     */
    @ViewChild('chipListSponsorNames')
    chipListSponsorNames: MatChipListbox;
    @ViewChild('formfieldSponsorNames')
    formfieldSponsorNames: MatFormField;
    @ViewChild('chipListClientNames')
    chipListClientNames: MatChipListbox;
    @ViewChild('formfieldClientNames')
    formfieldClientNames: MatFormField;

    constructor(private referentialService: ReferentialService, private ldtService: Service,
                private cdr: ChangeDetectorRef, public dragAndDropService: DragAndDropService) {
        super();
        this.formQuerySelectors = 'input, textarea, select, mat-select, mat-chip-list';
    }

    ngAfterViewInit(): void {
        this.dragAndDropService.viewItems.set(this.COMPONENT_NAME, [
            {
                fieldName: 'clientName',
                formField: this.formfieldClientNames,
                chipList: this.chipListClientNames,
                orientation: new BehaviorSubject<DropListOrientation>("horizontal")
            },
            {
                fieldName: 'sponsorName',
                formField: this.formfieldSponsorNames,
                chipList: this.chipListSponsorNames,
                orientation: new BehaviorSubject<DropListOrientation>("horizontal")
            }
        ]);

        this.dragAndDropService.viewItems.get(this.COMPONENT_NAME).forEach((elt: DragDropItem) => {
            this.formGroup.get(elt.fieldName).valueChanges.subscribe(_ => {
                this.dragAndDropService.chooseOrientation(this.COMPONENT_NAME, elt.fieldName);
            })
        });
    }

    @HostListener('window:resize', ['$event'])
    onResize(_) {
        this.dragAndDropService.viewItems.get(this.COMPONENT_NAME).forEach((elt: DragDropItem) => {
            this.dragAndDropService.chooseOrientation(this.COMPONENT_NAME, elt.fieldName);
        });
    }

    ngOnInit(): void {
        this.addSubscription(this.referentialService.subsectors$.subscribe((list: any[]) => this.subSectors = list));
        this.formGroup.get('clientNameInput').valueChanges
            .pipe(debounceTime(600),
                distinctUntilChanged(),
                filter(value => value != null && (value instanceof String || typeof value === 'string')))
            .subscribe((inputValue) => {
                this.getCommercialClients(inputValue);
            });
        this.formGroup.get('sponsorNameInput').valueChanges
            .pipe(debounceTime(600),
                distinctUntilChanged(),
                filter(value => value != null && (value instanceof String || typeof value === 'string')))
            .subscribe((inputValue) => {
                this.getSponsorNames(inputValue);
            });
        this.formGroup.get('cpyBorrowerNamesInput').valueChanges
            .pipe(distinctUntilChanged(),
                filter(value => value != null && (value instanceof String || typeof value === 'string')))
            .subscribe((inputValue) => {
                this.getCpyBorrowers(inputValue);
            });
        this.formGroup.get('guarantorNameInput').valueChanges
            .pipe(debounceTime(600),
                distinctUntilChanged(),
                filter(value => value != null && (value instanceof String || typeof value === 'string')))
            .subscribe((inputValue) => {
                this.getGuarantors(inputValue);
            });
        this.formGroup.get('ecaNameInput').valueChanges
            .pipe(debounceTime(600),
                distinctUntilChanged(),
                filter(value => value != null && (value instanceof String || typeof value === 'string')))
            .subscribe((inputValue) => {
                this.getEcas(inputValue);
            });
    }

    ngOnChanges(changes: SimpleChanges) {
        if (changes.opportunity && changes.opportunity.previousValue !== changes.opportunity.currentValue) {
            this.opportunity = changes.opportunity.currentValue;
            this.updateAndPopulateFields();
        }
    }

    get appearance() {
        return this.formGroup.disabled ? 'outline' : 'fill';
    }

    getCommercialClients(name: string) {
        if (this.formGroup.get('sponsorName').value === null || this.formGroup.get('sponsorName')?.value?.length === 0
            || (this.startByClient && this.formGroup.get('sponsorName')?.value?.length > 0)) {
            this.startByClient = true;
            if (name !== null && name?.trim().length >= 3) {
                this.clientNamesInputLoading = true;
                this.addSubscription(this.ldtService.commercialClientByName(name)
                    .subscribe((searchedList: CommercialClient[]) => {
                        this.commercialClients = this.sortSearchedCommercialClients(searchedList, name);
                        this.clientNamesInputLoading = false;
                    }));
            } else {
                this.commercialClients = [];
            }
        } else {
            this.commercialClients = this.formGroup.get('sponsorName')?.value?.reduce((accumulator, value) => accumulator.concat(_.concat(value.subCommercialClients || [])), [])
                .filter((value, index, self) => self.indexOf(value) === index)
                .filter((client: CommercialClient) => client.name.toLowerCase().includes(name.toLowerCase()));
        }
    }

    removeClientName(client: CommercialClient): void {
        const clientNames = this.formGroup.get('clientName').value;
        this.formGroup.get('clientName').setValue(_.without(clientNames, client));
        if (this.formGroup.get('clientName').value.length === 0) {
            this.startByClient = false;
            this.commercialClients = this.formGroup.get('sponsorName').value.reduce((accumulator, value) => accumulator.concat(_.concat(value.subCommercialClients || [])), [])
                .filter((value, index, self) => self.indexOf(value) === index);
        }
        this.formGroup.get('cpyBorrowers')?.value?.filter((cpyBorrower: Thirdparty) =>
            client.cpys.map(thirdparty => thirdparty.ricosId).includes(cpyBorrower.ricosId))
            .forEach(thirdparty => this.removeCpyBorrowerName(thirdparty));
        this.updateAndPopulateFields();
    }

    selectedClientName(event: MatAutocompleteSelectedEvent): void {
        const selectedClient: CommercialClient = event.option.value;
        console.log("Selected Client is ->", selectedClient);
        
        this.clientNamesInputLoading = true;
        const clientNames = _.concat((this.formGroup.get('clientName').value || []), selectedClient);
        this.formGroup.get('clientName').setValue(clientNames);
        this.clientNamesInput.nativeElement.value = '';
        this.isClientNameError = false;
        this.addSubscription(this.ldtService.commercialClientByIds('client', selectedClient.clientLiveReference)
            .subscribe((res: CommercialClient[]) => {
                const client = res[0];
                this.formGroup.get('clientName').value.pop();
                this.formGroup.get('clientName').setValue(_.concat((this.formGroup.get('clientName').value || []), client));
                if (this.startByClient) {
                    const sponsorNames = _.concat((this.formGroup.get('sponsorName').value || []), client.rootCommercialClient);
                    this.formGroup.get('sponsorName').setValue(sponsorNames.filter((element, i, array) => {
                        return array.indexOf(array.find(d => !!element && d.clientLiveReference === element.clientLiveReference)) === i;
                    }));
                    this.commercialClients = [];
                } else {
                    this.commercialClients = this.formGroup.get('sponsorName')?.value?.reduce((accumulator, value) => accumulator.concat(_.concat(value.subCommercialClients || [])), [])
                        .filter((value, index, self) => self.indexOf(value) === index);
                }
                this.updateAndPopulateFields();
                this.clientNamesInputLoading = false;
            }));
    }

    checkClientName(clientName: string) {
        this.isClientNameError = !this.isClientNameOk(clientName);
    }

    getSponsorNames(name: string) {
        if (this.formGroup.get('clientName').value === null || this.formGroup.get('clientName')?.value?.length === 0) {
            this.startByClient = false;
        }
        if (name !== null && name?.trim().length >= 3) {
            this.sponsorNamesInputLoading = true;
            this.addSubscription(this.ldtService.commercialClientByName(name)
                .subscribe((searchedList: CommercialClient[]) => {
                    this.sponsorNames = this.sortSearchedCommercialClients(searchedList, name);
                    this.sponsorNamesInputLoading = false;
                }));
        } else {
            this.sponsorNames = [];
        }
    }

    removeSponsorName(sponsor: CommercialClient): void {
        const sponsorNames = this.formGroup.get('sponsorName').value;
        this.formGroup.get('sponsorName').setValue(_.without(sponsorNames, sponsor));
        if (!this.startByClient) {
            this.commercialClients = this.formGroup.get('sponsorName').value
                .reduce((accumulator, value) => accumulator.concat(_.concat(value.subCommercialClients || [])), [])
                .filter((value, index, self) => self.indexOf(value) === index);
        }
        this.formGroup.get('clientName').setValue(this.formGroup.get('clientName')?.value?.filter(client => client.rootCommercialClient.clientLiveReference !== sponsor.clientLiveReference));
        this.formGroup.get('cpyBorrowers')?.value?.filter((cpyBorrower: Thirdparty) => sponsor.cpys.map(thirdparty => thirdparty.ricosId).includes(cpyBorrower.ricosId))
            .forEach(thirdparty => this.removeCpyBorrowerName(thirdparty));
        this.updateAndPopulateFields();
    }

    selectedSponsorName(event: MatAutocompleteSelectedEvent): void {
        const selectedSponsor: CommercialClient = event.option.value;
        this.sponsorNamesInputLoading = true;
        const sponsorNames = _.concat((this.formGroup.get('sponsorName').value || []), event.option.value);
        this.formGroup.get('sponsorName').setValue(sponsorNames);
        this.sponsorNamesInput.nativeElement.value = '';
        this.sponsorNames = [];
        this.isSponsorNameError = false;
        this.addSubscription(this.ldtService.commercialClientByIds('sponsor', selectedSponsor.clientLiveReference)
            .subscribe((res: CommercialClient[]) => {
                const sponsor = res[0];
                this.formGroup.get('sponsorName').value.pop();
                this.formGroup.get('sponsorName').setValue(_.concat((this.formGroup.get('sponsorName').value || []), sponsor));
                if (!this.startByClient) {
                    this.commercialClients = this.formGroup.get('sponsorName').value.reduce((accumulator, v) => accumulator.concat(_.concat(v.subCommercialClients  || [])), [])
                        .filter((value, index, self) => self.indexOf(value) === index);
                }
                this.sponsorNamesInputLoading = false;
                this.updateAndPopulateFields();
            }));
    }

    checkSponsorName(clientName: string) {
        this.isSponsorNameError = !this.isSponsorNameOk(clientName);
    }

    removeCpyBorrowerName(cpyBorrower: Thirdparty): void {
        const selectedCpyBorrowers = _.without(this.formGroup.get('cpyBorrowers').value, cpyBorrower);
        this.formGroup.get('cpyBorrowers').setValue(selectedCpyBorrowers);
        if (selectedCpyBorrowers.length === 0) {
            this.formGroup.get('cphBorrower')?.setValue(null);
            this.cphBorrowerNameInput.nativeElement.value = '';
        } else {
            const cphOfFirstCpyBorrower = selectedCpyBorrowers[0].cph;
            if (cphOfFirstCpyBorrower) {
                this.formGroup.get('cphBorrower')?.setValue(cphOfFirstCpyBorrower);
                this.cphBorrowerNameInput.nativeElement.value = cphOfFirstCpyBorrower.ricosId + ' - ' + cphOfFirstCpyBorrower.longName;
            } else {
                this.formGroup.get('cphBorrower')?.setValue(null);
                this.cphBorrowerNameInput.nativeElement.value = '';
            }
        }
    }

    selectedCpyBorrowerName(event: MatAutocompleteSelectedEvent): void {
        const cpyBorrower: Thirdparty = event.option.value;
        const cpyBorrowerNames = _.concat((this.formGroup.get('cpyBorrowers').value || []), cpyBorrower);
        this.formGroup.get('cpyBorrowers').setValue(cpyBorrowerNames);
        this.cpyBorrowerNamesInput.nativeElement.value = '';
        this.cpyBorrowers = this.cpyBorrowersOriginal;
        this.isCpyBorrowerNameError = false;
        this.setCphBorrower(cpyBorrower);
    }

    checkCpyBorrowerName(cpyBorrowerName: string) {
        this.isCpyBorrowerNameError = !this.isCpyBorrowerNameOk(cpyBorrowerName);
    }

    searchCounterpartyByLongname(ricosId: string): Observable<RTSCounterparty[]> {
        return this.ldtService.rtscounterpartyCpySearch(ricosId, 'longname');
    }

    loadCounterpartyByRicosId(ricosId: string): Observable<RTSCounterparty[]> {
        return this.ldtService.rtscounterpartyCphSearch(ricosId, 'ricosid');
    }

    getEcas(name: string) {
        if (name?.trim().length >= 3) {
            this.ecaNamesInputLoading = true;
            this.addSubscription(this.searchCounterpartyByLongname(name)
                .subscribe((res: RTSCounterparty[]) => {
                    this.ecasList = this.mapRTSCounterparties(res);
                    this.ecaNamesInputLoading = false;
                }));
        } else {
            this.ecasList = [];
        }
    }

    selectedEca(event: MatAutocompleteSelectedEvent) {
        const eca: Thirdparty = event.option.value;
        if (eca.cph) {
            this.loadCounterpartyByRicosId(eca.cph.ricosId).subscribe(cph => {
                eca.cph = this.mapRTSCounterPartytoDto(cph[0]);
                const ecas = _.concat((this.formGroup.get('ecas').value || []), eca);
                this.formGroup.get('ecas').setValue(ecas);
                this.ecaNameInput.nativeElement.value = '';
            });
        } else {
            const guarantors = _.concat((this.formGroup.get('ecas').value || []), eca);
            this.formGroup.get('ecas').setValue(guarantors);
            this.ecaNameInput.nativeElement.value = '';
        }
    }

    removeEca(eca: Thirdparty) {
        const ecas = this.formGroup.get('ecas').value;
        this.formGroup.get('ecas').setValue(_.without(ecas, eca));
    }

    getGuarantors(name: string) {
        if (name?.trim().length >= 3) {
            this.guarantorNamesInputLoading = true;
            this.addSubscription(this.searchCounterpartyByLongname(name)
                .subscribe((res: RTSCounterparty[]) => {
                    this.guarantorsList = this.mapRTSCounterparties(res);
                    this.guarantorNamesInputLoading = false;
                }));
        } else {
            this.guarantorsList = [];
        }
    }

    selectedGuarantor(event: MatAutocompleteSelectedEvent) {
        const guarantor: Thirdparty = event.option.value;
        if (guarantor.cph?.ricosId) {
            this.loadCounterpartyByRicosId(guarantor.cph.ricosId).subscribe(cph => {
                guarantor.cph = this.mapRTSCounterPartytoDto(cph[0]);
                const guarantors = _.concat((this.formGroup.get('guarantors').value || []), guarantor);
                this.formGroup.get('guarantors').setValue(guarantors);
                this.guarantorNameInput.nativeElement.value = '';
            });
        } else {
            const guarantors = _.concat((this.formGroup.get('guarantors').value || []), guarantor);
            this.formGroup.get('guarantors').setValue(guarantors);
            this.guarantorNameInput.nativeElement.value = '';
        }
    }

    removeGuarantor(guarantor: Thirdparty) {
        const guarantors = this.formGroup.get('guarantors').value;
        this.formGroup.get('guarantors').setValue(_.without(guarantors, guarantor));
    }

    private getCpyBorrowers(name: string) {
        this.cpyBorrowers = this.cpyBorrowersOriginal
            .filter((cpyBorrower: Thirdparty) => cpyBorrower.longName.toLowerCase().includes(name.toLowerCase()));
        if (this.cpyBorrowers.length === 0 && name?.trim().length >= 3) {
            this.cpyBorrowerNamesInputLoading = true;
            this.addSubscription(this.searchCounterpartyByLongname(name)
                .subscribe((res: RTSCounterparty[]) => {
                    this.cpyBorrowers = this.mapRTSCounterparties(res);
                    this.cpyBorrowerNamesInputLoading = false;
                }));
        }
    }

    private isClientNameOk(clientName: string): boolean {
        if (clientName.trim() !== '') {
            return this.commercialClients.map(sponsor => sponsor.name).includes(clientName);
        }
        return true;
    }

    private setCphBorrower(cpyBorrower: Thirdparty): void {
        const selectedCpyBorrowers = this.formGroup.get('cpyBorrowers').value;
        if (selectedCpyBorrowers.length === 1 && !!cpyBorrower.cph) {
            const cph = cpyBorrower.cph;
            this.formGroup.get('cphBorrower')?.setValue(cph);
            this.cphBorrowerNameInput.nativeElement.value = cph.ricosId + ' - ' + cph.longName;
        }
    }

    private isCpyBorrowerNameOk(cpyBorrowerName: string): boolean {
        if (cpyBorrowerName.trim() !== '') {
            return this.cpyBorrowers.map(cpy => cpy.longName).includes(cpyBorrowerName);
        }
        return true;
    }

    private isSponsorNameOk(clientName: string): boolean {
        if (clientName.trim() !== '') {
            return this.sponsorNames.map(sponsor => sponsor.name).includes(clientName);
        }
        return true;
    }

    private updateAndPopulateFields() {
        const clients = this.getClients();
        console.log("Clients data are -> ", clients);
        
        const pco = clients.filter(client => client.primaryCoverageOfficer !== null).map(client => client.primaryCoverageOfficer.firstname + ' ' + client.primaryCoverageOfficer.lastname);
        const pam = clients.filter(client => client.primaryAccountManager !== null).map(client => client.primaryAccountManager.firstname + ' ' + client.primaryAccountManager.lastname);
        const sector = this.getSector();
        const pcoCountry = clients.filter(client => client.primaryCoverageOfficer !== null && client.primaryCoverageOfficer?.positions[0]?.address)
            .map(client => client.primaryCoverageOfficer.positions[0].address.country.label);
        const pamCountry = clients.filter(client => client.primaryAccountManager !== null && client.primaryAccountManager?.positions[0]?.address)
            .map(client => client.primaryAccountManager.positions[0].address.country.label);
        this.formGroup.get('pcoName').setValue([...new Set(pco)]);
        this.formGroup.get('pamName').setValue([...new Set(pam)]);
        this.formGroup.get('pcoCountry').setValue([...new Set(pcoCountry)]);
        this.formGroup.get('pamCountry').setValue([...new Set(pamCountry)]);
        this.formGroup.get('sector').setValue([...new Set(sector)]);
        this.updateCpyBorrowers();
        this.updateCphBorrower();
    }

    private getClients() {
        let clients: CommercialClient[] = [];
        if (this.formGroup.get('clientName').value && this.formGroup.get('clientName').value.length > 0 &&
            (this.formGroup.get('clientName').value.filter(client => client.primaryCoverageOfficer !== null).length !== 0 ||
                this.formGroup.get('clientName').value.filter(client => client.primaryAccountManager !== null).length !== 0)) {
            clients = this.formGroup.get('clientName').value;
        } else if (this.formGroup.get('sponsorName').value && this.formGroup.get('sponsorName').value.length > 0) {
            clients = this.formGroup.get('sponsorName').value;
        }
        return clients;
    }

    private getSector() {
        return this.formGroup.get('clientName').value && this.formGroup.get('clientName').value.length > 0 &&
        this.formGroup.get('clientName').value.filter(client => client.sector !== null).length > 0 ?
            this.formGroup.get('clientName').value.filter(client => client.sector !== null).map(client => client.sector?.name) :
            this.formGroup.get('sponsorName').value.filter(client => client.sector !== null).map(client => client.sector?.name);
    }

    private updateCphBorrower() {
        if (this.formGroup.get('cpyBorrowers')?.value?.length > 0) {
            const firstCpyBorrower = this.formGroup.get('cpyBorrowers').value[0];
            if (firstCpyBorrower.cph) {
                this.formGroup.get('cphBorrower')?.setValue(firstCpyBorrower.cph);
                this.cphBorrowerNameInput.nativeElement.value = firstCpyBorrower.cph.ricosId + ' - ' + firstCpyBorrower.cph.longName;
            }
        }
    }

    private updateCpyBorrowers() {
        const allClients: CommercialClient[] = [...this.formGroup.get('sponsorName').value || [], ...this.formGroup.get('clientName').value || []];
        this.cpyBorrowersOriginal = allClients.map(client => client.cpys).reduce(_.concat, [])
            .filter(thirdparty => thirdparty && thirdparty.isActive)
            .filter((element, i, array) => {
                return array.indexOf(array.find(d => !!element && d.ricosId === element.ricosId)) === i;
            });
        this.cpyBorrowers = [...this.cpyBorrowersOriginal];
        if (!this.formGroup.disabled) {
            if ((this.formGroup.get('clientName').value?.length === 0)
                && (this.formGroup.get('sponsorName').value?.length === 0)) {
                this.formGroup.get('cpyBorrowers').disable();
                this.formGroup.get('cpyBorrowerNamesInput').disable();
            } else {
                this.formGroup.get('cpyBorrowers').enable();
                this.formGroup.get('cpyBorrowerNamesInput').enable();
            }
        }
    }

    private mapRTSCounterparties(rtsCounterparties: RTSCounterparty[]): Thirdparty[] {
        return rtsCounterparties.map(rtsCpy => this.mapRTSCounterPartytoDto(rtsCpy));
    }

    private mapRTSCounterPartytoDto(rtsCpy: RTSCounterparty): Thirdparty {
        const thirdparty: Thirdparty = {
            ricosId: rtsCpy.ricosId,
            legalName: rtsCpy.legalName,
            shortName: rtsCpy.shortName,
            residenceCountryIsoCode2: rtsCpy.countryOfNationality,
            thirdpartyType: rtsCpy.entityType
        };
        if (rtsCpy.cphRicosId) {
            thirdparty.cph = {ricosId: rtsCpy.cphRicosId, longName: rtsCpy.cphLongName};
        }
        return thirdparty;
    }

    private sortSearchedCommercialClients(searchedList: CommercialClient[], name: string) {
        const clientsStartWithName: CommercialClient[] = searchedList.filter(client => client.name.toLowerCase().startsWith(name.toLowerCase()));
        const clientsContainsName: CommercialClient[] = searchedList.filter(client => !client.name.toLowerCase().startsWith(name.toLowerCase()));
        return _.concat(clientsStartWithName, clientsContainsName);
    }

    redirectToClientLiveClientUrl(clientId: string) {
        window.open(environment.clientLiveConf.basePath + environment.clientLiveConf.clientView.path + environment.clientLiveConf.clientView.params.replace('{0}', clientId), '_blank');
    }

    dropClientNames(event: CdkDragDrop<Thirdparty[]>) {
        if (event.currentIndex === 0) {
            let movingCommercialClient = this.formGroup.get('clientName').value[event.previousIndex];
            let array = _.cloneDeep(this.formGroup.get('sponsorName').value);
            moveItemInArray(array, array.findIndex(elt => elt.clientLiveReference === movingCommercialClient?.rootCommercialClient?.clientLiveReference), 0)
            this.formGroup.get('sponsorName').patchValue(array);
        }
        this.dragAndDropService.dropElt(this.formGroup, event, this.commercialClients, 'clientName');
    }

    dropSponsorNames(event: CdkDragDrop<Thirdparty[]>) {
        if (event.currentIndex === 0) {
            let movingSponsorName = this.formGroup.get('sponsorName').value[event.previousIndex];
            let array = _.cloneDeep(this.formGroup.get('clientName').value);
            moveItemInArray(array, array.findIndex(elt => elt?.rootCommercialClient?.clientLiveReference === movingSponsorName.clientLiveReference), 0)
            this.formGroup.get('clientName').patchValue(array);
        }
        this.dragAndDropService.dropElt(this.formGroup, event, this.sponsorNames, 'sponsorName');
    }
}


