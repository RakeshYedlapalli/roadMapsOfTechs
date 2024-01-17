.p-list {
  .p-row {
    display: flex;
    justify-content: space-between;
    width: 100%;
  
    &.header {
      font-weight: bold;
      font-size: 14px;
  
      .p-col {
        align-items: flex-end;
        margin-bottom: 4px;
      }
  
      .sort {
        cursor: pointer;
      }
    }
  
    .p-col {
      flex: 1;
      display: flex;
      align-items: center;
      min-width: 0;
      box-sizing: border-box;
  
      &.expander {
        flex: 0 0 24px;
      }
  
      &:not(.expander) {
        padding-right: 10px;
      }

      app-edit-in-place-form-field {
        width: 100%;
  
        .not-editable-content {
          overflow-wrap: break-word;
        }
      }
    }
  }

  .mat-expansion-panel {
    margin-bottom: 0.5rem !important;

    .mat-expansion-panel-header {
      cursor: default;
      font-size: 14px;
      padding: 0.5rem 0;

      .mat-expansion-panel-header-title {
        margin: 0;
      }

      .mat-expansion-indicator {
        cursor: pointer;
        display: flex;
        margin: 0 8px !important;

        &::after {
            color:rgba(0, 0, 0, 0.54) !important;
        }
      }
    }  
  }
}
