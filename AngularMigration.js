<mat-menu #menu="matMenu">
  <ng-template matMenuContent>
    <button (click)="isOpportunityView ? openOpportunityInExistingTab(dealToOpenId) : openDealInExistingTab(dealToOpenId)" mat-menu-item>
      <mat-icon>edit</mat-icon>
      Open
    </button>
    <button (click)="isOpportunityView ? openOpportunityInNewTab(dealToOpenId)  : openDealInNewTab(dealToOpenId)" mat-menu-item>
      <mat-icon>edit</mat-icon>
      Open in new tab
    </button>
  </ng-template>
</mat-menu>

Error: src/app/show-deals/show-deals.component.html:318:18 - error NG8003: No directive found with exportAs 'matMenu'.

318 <mat-menu #menu="matMenu">
