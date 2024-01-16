I have a below Angular JS code in Componenet.js file, where I have a mat-tab-group having 3 labels "General", "Tranches" and "Open in ClientLive", so recently I have migrated to Angular 15 from Angular 14, Before migration of Angular 
 14, The <mat-tab label="GENERAL"> and <mat-tab label="TRANCHES"> were lefet aligned and <mat-tab label="Open in ClientLive"> is right aligned , However, after migration to Angular 15, they all aligned equally, like one after another 
  with equal  padding, But I want to align the <mat-tab label="Open in ClientLive"> right and (<mat-tab label="GENERAL"> and <mat-tab label="TRANCHES">) are to be left, how to adjust my eithe CSS of HTML Code changes

<mat-tab-group class="opportunity-view-tabs">
                <mat-tab label="GENERAL">
                    <app-general-tab-opportunity (sentToClientLiveChange)="onSentToClientLiveChange()" [isAddMode]="isAddMode" [opportunity]="opportunity" (opportunityChange)="onOpportunityChange($event)" #generalTabOpportunity></app-general-tab-opportunity>
                </mat-tab>
                <mat-tab label="TRANCHES">
                    <app-tranche-tab></app-tranche-tab>
                </mat-tab>
                <mat-tab disabled>
                    <ng-template mat-tab-label>
                            <a [href]="clientLiveOpportunityUrl" mat-raised-button color="accent" target="_blank"
                               rel="noreferrer"
                               [disabled]="!opportunity?.sentToClientLive">Open in ClientLive
                                <mat-icon>open_in_new</mat-icon>
                            </a>
                    </ng-template>
                </mat-tab>
            </mat-tab-group>

and CSS Styles:


::ng-deep .opportunity-view-tabs .mat-mdc-tab-label:last-child {
  opacity: 1;
  min-width: 20px;
  margin-left: auto;
  padding-right: 16px;
}
