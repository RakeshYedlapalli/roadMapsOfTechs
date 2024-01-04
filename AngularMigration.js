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
