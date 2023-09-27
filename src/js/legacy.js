document.addEventListener("DOMContentLoaded", () => {
  const maxRowsCountToSetTablesInSinglePage = 2
  const firstPageRowsCount = 6;
  const otherPagesRowsCount = 13;
  const maxRowsCountBeforeSplitting = 10;

  const pageElement = createPageElement();
  const contentElement = createContentElement();

  const headerElement = document.getElementsByClassName("tables-list__header")[0];
  contentElement.appendChild(headerElement);

  const dateTableElement = document.getElementsByClassName("invoice-date-table")[0];
  contentElement.appendChild(dateTableElement);

  const soldToSellerTableElement = document.getElementsByClassName("sold-to-seller-table")[0];
  contentElement.appendChild(soldToSellerTableElement);

  const destinationTableElement = document.getElementsByClassName("from-to-table")[0];
  contentElement.appendChild(destinationTableElement);

  const orderNumberTableElement = document.getElementsByClassName("order-number-table")[0];
  contentElement.appendChild(orderNumberTableElement);

  const shipmentsTableElement = document.getElementsByClassName("shipments-table")[0];
  const itemsTableRows = shipmentsTableElement.querySelectorAll("tr"); //object
  const shipmentsTableRowsCount = itemsTableRows.length;
  const itemsTableHeader = itemsTableRows[0];
  const totalAmountTableElement = document.getElementsByClassName("total-amount-table")[0];
  const commentsTableElement = document.getElementsByClassName("comments-table")[0];

  // *********************************************************** if all rows fit the a single page(first page only)
  if (shipmentsTableRowsCount <= maxRowsCountToSetTablesInSinglePage) {
    const table = createTableElement();
    for (let i = 0; i < shipmentsTableRowsCount; i++) {
      table.appendChild(itemsTableRows[i]);
    }
    const shipmentTableWrapper = createShipmentTableWrapperElement(table);
    contentElement.appendChild(shipmentTableWrapper);
    contentElement.appendChild(totalAmountTableElement);
    contentElement.appendChild(commentsTableElement);

    pageElement.appendChild(contentElement);
    document.body.appendChild(pageElement);

    // export with summary
    if (window.data?.exportWithSummary) {
      drawSummaryTable();
    }
  } else {
    const requiredPagesNumToDrawShipmentsTable = Math.ceil(Math.abs(shipmentsTableRowsCount - firstPageRowsCount) / otherPagesRowsCount) || 1;
    // *********************************************************** for first page
    const tableInFirstPage = createTableElement();
    tableInFirstPage.appendChild(itemsTableHeader);

    let rowFirstIndex = 0; // because the index of 0 is the header and it's already inserted in the above step
    let rowLastIndex = firstPageRowsCount - 1;

    if (shipmentsTableRowsCount <= rowLastIndex) {
      rowLastIndex = shipmentsTableRowsCount - 1;
    }

    for (let i = rowFirstIndex; i <= rowLastIndex; i++) {
      tableInFirstPage.appendChild(itemsTableRows[i]);
    }

    const shipmentTableWrapper = createShipmentTableWrapperElement(tableInFirstPage);
    contentElement.appendChild(shipmentTableWrapper);
    pageElement.appendChild(contentElement);
    document.body.appendChild(pageElement);

    let currentRowIndex;

    // *********************************************************** for other pages
    for (let pageIndex = 1; pageIndex <= requiredPagesNumToDrawShipmentsTable; pageIndex++) {
      if ((rowLastIndex === shipmentsTableRowsCount || firstPageRowsCount >= shipmentsTableRowsCount) && pageIndex === 1) {
        // all table drawn in the previous page and we just need
        // to create a new page for the total amount and comments table
        const pageElement = createPageElement();
        const contentElement = createContentElement();

        contentElement.appendChild(totalAmountTableElement);
        contentElement.appendChild(commentsTableElement);
        pageElement.appendChild(contentElement);
        document.body.appendChild(pageElement);
      } else {

        rowFirstIndex = rowLastIndex + 1;
        rowLastIndex = rowLastIndex + otherPagesRowsCount; // to move the last so the first will be moved

        if (shipmentsTableRowsCount <= rowLastIndex) {
          rowLastIndex = shipmentsTableRowsCount - 1;
        }

        const pageElement = createPageElement();
        const contentElement = createContentElement();
        const table = createTableElement();

        const cloneHeader = itemsTableHeader.cloneNode(true);
        table.appendChild(cloneHeader);

        for (currentRowIndex = rowFirstIndex; currentRowIndex <= rowLastIndex; currentRowIndex++) {
          table.appendChild(itemsTableRows[currentRowIndex]);
        }

        const shipmentTableWrapper = createShipmentTableWrapperElement(table);
        contentElement.appendChild(shipmentTableWrapper);

        if (pageIndex == requiredPagesNumToDrawShipmentsTable) {
          if ((rowLastIndex - rowFirstIndex) >= 0 && (rowLastIndex - rowFirstIndex) < maxRowsCountBeforeSplitting) {
            contentElement.appendChild(totalAmountTableElement);
            contentElement.appendChild(commentsTableElement);
            pageElement.appendChild(contentElement);
            document.body.appendChild(pageElement);
          } else {
            // will set the previous page that contains the remaining rows of shipments table
            pageElement.appendChild(contentElement);
            document.body.appendChild(pageElement);

            // then create a new page for the total amount and comments table
            const newPageElement = createPageElement();
            const newContentElement = createContentElement();

            newContentElement.appendChild(totalAmountTableElement);
            newContentElement.appendChild(commentsTableElement);
            newPageElement.appendChild(newContentElement);
            document.body.appendChild(newPageElement);
          }
          // export with summary
          if (window.data?.exportWithSummary) {
            drawSummaryTable();
          }

        } else {
          pageElement.appendChild(contentElement);
          document.body.appendChild(pageElement);
        }
      }
    }
    /*   for(let pageIndex = 0; pageIndex <data.deliveryNoteAttachments.length; pageIndex++) {
         const newPage = document.createElement("div");
         newPage.setAttribute("class", "summary-page");
         const imageElement = document.createElement("img");
         imageElement.setAttribute("src", data.deliveryNoteAttachments[pageIndex]);
         newPage.appendChild(imageElement);
         document.body.appendChild(newPage);
     }*/
  }

  // *************************************************************
  const wrapper = document.getElementsByClassName("tables-list")[0];
  wrapper.parentNode.removeChild(wrapper);

  // ******************************* basic page methods
  function createPageElement() {
    const element = document.createElement("div");
    element.setAttribute("class", "page");
    return element;
  }

  function createContentElement() {
    const element = document.createElement("div");
    element.setAttribute("class", "content");
    return element;
  }

  function createTableElement() {
    const element = document.createElement("table");
    element.style.width = "100%";
    return element;
  }

  function createShipmentTableWrapperElement(table) {
    const element = document.createElement("div");
    element.setAttribute("class", "shipments-table");
    element.appendChild(table);
    return element;
  }

  // ******************************** summary page method
  function drawSummaryTable() {
    const firstPageRowsCount = 17;
    const maxRowsCountPerPage = 17;

    const summaryTableElement =
      document.getElementsByClassName("summary-table")[0];
    const summaryTableRows = summaryTableElement.querySelectorAll("tr"); //object
    const summaryTableRowsCount = summaryTableRows.length;
    const summaryTableHeader = summaryTableRows[0];

    const requiredPagesNumToDrawShipmentsTable = Math.ceil(Math.abs(summaryTableRowsCount) / maxRowsCountPerPage) || 1;
    let currentRowIndex;
    let rowFirstIndex = 1; // because the index of 0 is the header and it's already inserted in the above step
    let rowLastIndex = maxRowsCountPerPage - 1;
    if (summaryTableRowsCount <= rowLastIndex) {
      rowLastIndex = summaryTableRowsCount - 1;
    }

    // *********************************************************** for other pages
    for (let pageIndex = 1; pageIndex <= requiredPagesNumToDrawShipmentsTable; pageIndex++) {

      const newPage = document.createElement("div");
      newPage.setAttribute("class", "summary-page");

      const table = document.createElement("table");

      const cloneHeader = summaryTableHeader.cloneNode(true);
      table.appendChild(cloneHeader);

      for (currentRowIndex = rowFirstIndex; currentRowIndex <= rowLastIndex; currentRowIndex++) {
        console.log(currentRowIndex);
        table.appendChild(summaryTableRows[currentRowIndex]);
      }

      if ((rowLastIndex - rowFirstIndex) >= 1 && (rowLastIndex - rowFirstIndex) <= 3) {
        table.style.left = "-80mm";
        table.style.top = "120mm";
      } else if ((rowLastIndex - rowFirstIndex) >= 4 && (rowLastIndex - rowFirstIndex) <= 6) {
        table.style.left = "-80mm";
        table.style.top = "120mm";
      } else if ((rowLastIndex - rowFirstIndex) >= 7 && (rowLastIndex - rowFirstIndex) <= 9) {
        table.style.left = "-50mm";
        table.style.top = "110mm";
      } else if ((rowLastIndex - rowFirstIndex) >= 10 && (rowLastIndex - rowFirstIndex) <= 14) {
        table.style.left = "-50mm";
        table.style.top = "90mm";
      } else {
        table.style.left = "-24mm";
        table.style.top = "60mm";
      }

      const summaryTableWrapper = document.createElement("div");
      summaryTableWrapper.setAttribute("class", "summary-table");
      summaryTableWrapper.appendChild(table);

      newPage.appendChild(summaryTableWrapper);
      document.body.appendChild(newPage);

      rowFirstIndex = rowLastIndex + 1;
      rowLastIndex = rowLastIndex + maxRowsCountPerPage; // to move the last so the first will be moved

      if (summaryTableRowsCount <= rowLastIndex) {
        rowLastIndex = summaryTableRowsCount - 1;
      }
    }
  }
});
